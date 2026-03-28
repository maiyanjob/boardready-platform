import importlib
import os
import sys
import types
from pathlib import Path
from types import SimpleNamespace

import pytest
from flask import Flask, jsonify
from flask_login import LoginManager


BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite://")


class FakeVector:
    def __init__(self, values):
        self._values = values

    def tolist(self):
        return list(self._values)


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
    def __init__(self, *, project_row, gap_rows, gap_embeddings, candidate_pairs, similarity_scores):
        self.project_row = project_row
        self.gap_rows = gap_rows
        self.gap_embeddings = gap_embeddings
        self.candidate_pairs = candidate_pairs
        self.similarity_scores = similarity_scores
        self.committed = False
        self.closed = False

    def execute(self, statement, params=None):
        sql = str(statement)
        params = params or {}

        if "FROM projects" in sql and "client_name, description" in sql:
            return FakeResult(one=self.project_row)

        if "FROM project_gaps_v2" in sql:
            return FakeResult(rows=self.gap_rows)

        if "SELECT gap_embedding FROM gap_analysis" in sql:
            return FakeResult(one=(self.gap_embeddings.get(params["title"]),))

        if "SELECT 1 - (CAST(:c_emb AS vector) <=> CAST(:g_emb AS vector)) AS similarity" in sql:
            candidate_key = params["c_emb"]
            gap_key = params["g_emb"]
            score = self.similarity_scores[(candidate_key, gap_key)]
            return FakeResult(one=(score,))

        raise AssertionError(f"Unexpected SQL in test double: {sql}")

    def query(self, *_args, **_kwargs):
        return FakeJoinQuery(self.candidate_pairs)

    def commit(self):
        self.committed = True

    def close(self):
        self.closed = True


@pytest.fixture
def nike_project_id():
    return 3


@pytest.fixture
def mock_gap_categories():
    return [
        ("Circular Economy & Sustainable Manufacturing", 101),
        ("Data Analytics & AI-Driven Personalization", 102),
        ("Global Supply Chain Resilience", 103),
    ]


@pytest.fixture
def mock_candidates():
    return [
        {
            "candidate_id": 41,
            "name": "Rachel Foster",
            "title": "Chief Sustainability Officer",
            "company": "GreenTech Ventures",
            "bio": (
                "Sustainability leader with 14 years driving ESG strategy, circular economy "
                "programs, and responsible manufacturing initiatives across global brands."
            ),
            "vector": FakeVector([0.11, 0.22, 0.33]),
            "status": "sourced",
            "source": "internal_db",
        },
        {
            "candidate_id": 42,
            "name": "Samuel Lee",
            "title": "Chief Data Officer",
            "company": "DataVision Analytics",
            "bio": (
                "Data executive focused on AI platforms, personalization systems, customer "
                "analytics, and enterprise machine learning governance."
            ),
            "vector": FakeVector([0.44, 0.55, 0.66]),
            "status": "reviewed",
            "source": "internal_db",
        },
    ]


@pytest.fixture
def expected_match_scores():
    return {
        "Rachel Foster": {
            "gap_scores": {
                "Circular Economy & Sustainable Manufacturing": 92.0,
                "Data Analytics & AI-Driven Personalization": 48.0,
                "Global Supply Chain Resilience": 61.0,
            },
            "match_score": 67.0,
        },
        "Samuel Lee": {
            "gap_scores": {
                "Circular Economy & Sustainable Manufacturing": 38.0,
                "Data Analytics & AI-Driven Personalization": 96.0,
                "Global Supply Chain Resilience": 58.0,
            },
            "match_score": 64.0,
        },
    }


@pytest.fixture
def fake_project_session(mock_candidates, mock_gap_categories, expected_match_scores):
    gap_embeddings = {
        "Circular Economy & Sustainable Manufacturing": [0.9, 0.1, 0.2],
        "Data Analytics & AI-Driven Personalization": [0.3, 0.8, 0.7],
        "Global Supply Chain Resilience": [0.5, 0.6, 0.4],
    }

    candidate_pairs = []
    similarity_scores = {}

    for index, candidate in enumerate(mock_candidates, start=1):
        pc = SimpleNamespace(
            id=index,
            candidate_id=candidate["candidate_id"],
            status=candidate["status"],
            source=candidate["source"],
            gap_coverage_scores=None,
            overall_match_score=None,
            match_reasoning=None,
        )
        c = SimpleNamespace(
            id=candidate["candidate_id"],
            name=candidate["name"],
            title=candidate["title"],
            company=candidate["company"],
            bio=candidate["bio"],
            bio_embedding=candidate["vector"],
        )
        candidate_pairs.append((pc, c))

        candidate_vector_key = str(candidate["vector"].tolist())
        for gap_name, gap_score in expected_match_scores[candidate["name"]]["gap_scores"].items():
            gap_vector_key = str(gap_embeddings[gap_name])
            similarity_scores[(candidate_vector_key, gap_vector_key)] = gap_score / 100.0

    return FakeDBSession(
        project_row=("Nike, Inc.", "Global athletic apparel and retail board search"),
        gap_rows=mock_gap_categories,
        gap_embeddings=gap_embeddings,
        candidate_pairs=candidate_pairs,
        similarity_scores=similarity_scores,
    )


@pytest.fixture
def missing_project_session():
    return FakeDBSession(
        project_row=None,
        gap_rows=[],
        gap_embeddings={},
        candidate_pairs=[],
        similarity_scores={},
    )


@pytest.fixture
def project_routes_module():
    fake_claude_module = types.ModuleType("services.claude_service")
    fake_claude_module.claude_service = SimpleNamespace(
        generate_embedding=lambda text: [0.1, 0.2, 0.3]
    )
    sys.modules["services.claude_service"] = fake_claude_module

    fake_document_module = types.ModuleType("services.document_service")
    fake_document_module.document_service = SimpleNamespace(
        generate_strategy_fit_summary=lambda candidate_name, candidate_scores, **_kwargs: (
            f"{candidate_name} aligns strongly with {max(candidate_scores, key=candidate_scores.get)}."
        )
    )
    sys.modules["services.document_service"] = fake_document_module

    sys.modules.pop("routes.project_routes", None)
    return importlib.import_module("routes.project_routes")


def _build_app(project_routes_module, login_disabled):
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SECRET_KEY="test-secret",
        LOGIN_DISABLED=login_disabled,
    )

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def _load_user(_user_id):
        return None

    @login_manager.unauthorized_handler
    def _unauthorized():
        return jsonify({"error": "Authentication required"}), 401

    app.register_blueprint(project_routes_module.project_bp, url_prefix="/api")
    return app


def _db_generator(session):
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def authenticated_project_client(project_routes_module, fake_project_session, monkeypatch):
    monkeypatch.setattr(project_routes_module, "get_db", lambda: _db_generator(fake_project_session))
    app = _build_app(project_routes_module, login_disabled=True)
    return app.test_client(), fake_project_session


@pytest.fixture
def missing_project_client(project_routes_module, missing_project_session, monkeypatch):
    monkeypatch.setattr(project_routes_module, "get_db", lambda: _db_generator(missing_project_session))
    app = _build_app(project_routes_module, login_disabled=True)
    return app.test_client(), missing_project_session


@pytest.fixture
def unauthenticated_project_client(project_routes_module, fake_project_session, monkeypatch):
    monkeypatch.setattr(project_routes_module, "get_db", lambda: _db_generator(fake_project_session))
    app = _build_app(project_routes_module, login_disabled=False)
    return app.test_client(), fake_project_session
