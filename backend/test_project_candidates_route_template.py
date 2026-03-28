import importlib
import os
import sys
import types
from pathlib import Path
from types import SimpleNamespace

import pytest
from flask import Flask


pytestmark = pytest.mark.skip(
    reason=(
        "Template only. Enable once Claude Code fixes "
        "/api/projects/<id>/candidates to return the final contract."
    )
)

BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite://")


class FakeResult:
    def __init__(self, *, rows=None, one=None):
        self._rows = rows or []
        self._one = one

    def fetchall(self):
        return self._rows

    def fetchone(self):
        return self._one


class FakeJoinQuery:
    def __init__(self, pairs):
        self._pairs = pairs

    def join(self, *_args, **_kwargs):
        return self

    def filter(self, *_args, **_kwargs):
        return self

    def all(self):
        return self._pairs


class FakeDBSession:
    def __init__(self, *, gap_rows, project_row, similarity_scores, candidate_pairs):
        self._gap_rows = gap_rows
        self._project_row = project_row
        self._similarity_scores = similarity_scores
        self._candidate_pairs = candidate_pairs
        self.committed = False
        self.closed = False

    def execute(self, statement, params=None):
        sql = str(statement)
        params = params or {}

        if "FROM project_gaps_v2" in sql:
            return FakeResult(rows=self._gap_rows)

        if "SELECT client_name, description FROM projects" in sql:
            return FakeResult(one=self._project_row)

        if "SELECT gap_embedding FROM gap_analysis" in sql:
            gap_title = params["title"]
            return FakeResult(one=(f"embedding:{gap_title}",))

        if "SELECT 1 - (:c_emb <=> :g_emb) AS similarity" in sql:
            candidate_name = str(params["c_emb"]).split("bio:", 1)[1]
            gap_name = str(params["g_emb"]).split("embedding:", 1)[1]
            return FakeResult(one=(self._similarity_scores[(candidate_name, gap_name)],))

        raise AssertionError(f"Unexpected SQL in template test: {sql}")

    def query(self, *_args, **_kwargs):
        return FakeJoinQuery(self._candidate_pairs)

    def commit(self):
        self.committed = True

    def close(self):
        self.closed = True


def _build_project_candidate(candidate_id, status="sourced", source="internal_db"):
    return SimpleNamespace(
        id=candidate_id,
        candidate_id=candidate_id,
        status=status,
        source=source,
        gap_coverage_scores=None,
        overall_match_score=None,
        match_reasoning=None,
    )


def _build_candidate(candidate_id, name, bio_embedding=True):
    return SimpleNamespace(
        id=candidate_id,
        name=name,
        title="Board Director",
        company="BoardReady",
        bio_embedding=f"bio:{name}" if bio_embedding else None,
    )


def _load_project_routes_module():
    fake_claude_module = types.ModuleType("services.claude_service")
    fake_claude_module.claude_service = SimpleNamespace(
        generate_embedding=lambda text: f"generated:{text}"
    )
    sys.modules["services.claude_service"] = fake_claude_module

    fake_document_module = types.ModuleType("services.document_service")
    fake_document_module.document_service = SimpleNamespace(
        generate_strategy_fit_summary=lambda candidate_name, candidate_scores, **_kwargs: (
            f"Summary for {candidate_name}: {sorted(candidate_scores)}"
        )
    )
    sys.modules["services.document_service"] = fake_document_module

    sys.modules.pop("routes.project_routes", None)
    return importlib.import_module("routes.project_routes")


def _build_app(project_routes_module):
    app = Flask(__name__)
    app.config.update(TESTING=True, SECRET_KEY="test-secret", LOGIN_DISABLED=True)
    app.register_blueprint(project_routes_module.project_bp, url_prefix="/api")
    return app


def _assert_normalized_gap_scores(candidate_payload):
    assert "gap_coverage_scores" in candidate_payload
    gap_scores = candidate_payload["gap_coverage_scores"]
    assert isinstance(gap_scores, dict)
    assert gap_scores

    for gap_name, score in gap_scores.items():
        assert isinstance(gap_name, str)
        assert gap_name
        assert isinstance(score, (int, float))
        assert not isinstance(score, bool)
        assert 0.0 <= float(score) <= 1.0


def test_template_project_candidates_returns_normalized_gap_scores(monkeypatch):
    project_routes = _load_project_routes_module()

    gap_rows = [("Finance", 101), ("SaaS", 102)]
    project_row = ("Nike, Inc.", "Board search")
    candidate_pairs = [
        (_build_project_candidate(1), _build_candidate(1, "Candidate A")),
        (_build_project_candidate(2), _build_candidate(2, "Candidate B")),
    ]
    similarity_scores = {
        ("Candidate A", "Finance"): 0.0,
        ("Candidate A", "SaaS"): 1.0,
        ("Candidate B", "Finance"): 0.44,
        ("Candidate B", "SaaS"): 0.89,
    }
    fake_db = FakeDBSession(
        gap_rows=gap_rows,
        project_row=project_row,
        similarity_scores=similarity_scores,
        candidate_pairs=candidate_pairs,
    )

    monkeypatch.setattr(project_routes, "get_db", lambda: iter([fake_db]))

    app = _build_app(project_routes)

    with app.test_client() as client:
        response = client.get("/api/projects/3/candidates")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert len(payload["candidates"]) == 2

    for candidate in payload["candidates"]:
        _assert_normalized_gap_scores(candidate)

    assert fake_db.committed is True


def test_template_project_candidates_includes_match_reasoning(monkeypatch):
    project_routes = _load_project_routes_module()

    candidate_pairs = [
        (_build_project_candidate(7), _build_candidate(7, "Candidate C")),
    ]
    fake_db = FakeDBSession(
        gap_rows=[("Digital", 201)],
        project_row=("Nike, Inc.", "Board search"),
        similarity_scores={("Candidate C", "Digital"): 0.73},
        candidate_pairs=candidate_pairs,
    )

    monkeypatch.setattr(project_routes, "get_db", lambda: iter([fake_db]))

    app = _build_app(project_routes)

    with app.test_client() as client:
        response = client.get("/api/projects/3/candidates")

    assert response.status_code == 200
    payload = response.get_json()
    candidate_payload = payload["candidates"][0]

    assert candidate_payload["match_reasoning"]
    assert isinstance(candidate_payload["match_reasoning"], str)
    _assert_normalized_gap_scores(candidate_payload)


def test_template_project_candidates_returns_empty_list_when_project_has_no_gaps(monkeypatch):
    project_routes = _load_project_routes_module()

    fake_db = FakeDBSession(
        gap_rows=[],
        project_row=None,
        similarity_scores={},
        candidate_pairs=[],
    )

    monkeypatch.setattr(project_routes, "get_db", lambda: iter([fake_db]))

    app = _build_app(project_routes)

    with app.test_client() as client:
        response = client.get("/api/projects/3/candidates")

    assert response.status_code == 200
    assert response.get_json() == {"success": True, "candidates": []}
