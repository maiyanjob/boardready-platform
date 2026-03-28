import os
import sys
import types
from pathlib import Path
from types import SimpleNamespace

from flask import Flask


BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite://")

fake_claude_service_module = types.ModuleType("services.claude_service")
fake_claude_service_module.claude_service = SimpleNamespace()
sys.modules.setdefault("services.claude_service", fake_claude_service_module)

import routes.candidate_routes as candidate_routes


class FakeQuery:
    def __init__(self, candidates):
        self._candidates = candidates

    def all(self):
        return self._candidates


class FakeSession:
    def __init__(self, candidates):
        self._candidates = candidates
        self.closed = False

    def query(self, _model):
        return FakeQuery(self._candidates)

    def close(self):
        self.closed = True


def _build_candidate(candidate_id, gap_coverage_scores):
    return SimpleNamespace(
        id=candidate_id,
        name=f"Candidate {candidate_id}",
        title="Board Director",
        company="BoardReady",
        bio="Experienced operator",
        linkedin_url="https://example.com/profile",
        years_experience=15,
        board_count=2,
        industries=["Technology"],
        skills=["Strategy"],
        gap_coverage_scores=gap_coverage_scores,
    )


def _assert_valid_gap_coverage_scores(scores):
    assert "gap_coverage_scores" in scores
    gap_coverage_scores = scores["gap_coverage_scores"]
    assert isinstance(gap_coverage_scores, dict)
    assert gap_coverage_scores

    for gap_name, value in gap_coverage_scores.items():
        assert isinstance(gap_name, str)
        assert gap_name
        assert isinstance(value, (int, float))
        assert not isinstance(value, bool)
        assert 0.0 <= float(value) <= 1.0


def test_get_candidates_includes_phase1_gap_coverage_scores(monkeypatch):
    fake_candidates = [
        _build_candidate(1, {"finance": 0.0, "governance": 0.78, "saas": 1.0}),
        _build_candidate(2, {"audit": 0.35, "operations": 0.92}),
    ]
    fake_session = FakeSession(fake_candidates)

    monkeypatch.setattr(candidate_routes, "SessionLocal", lambda: fake_session)

    app = Flask(__name__)
    app.config.update(TESTING=True, SECRET_KEY="test-secret", LOGIN_DISABLED=True)
    app.register_blueprint(candidate_routes.candidate_bp, url_prefix="/api")

    with app.test_client() as client:
        response = client.get("/api/candidates")

    assert response.status_code == 200
    payload = response.get_json()
    assert "candidates" in payload
    assert len(payload["candidates"]) == 2

    for candidate in payload["candidates"]:
        _assert_valid_gap_coverage_scores(candidate)

    assert fake_session.closed is True
