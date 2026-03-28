def test_get_project_candidates_for_valid_nike_project(
    authenticated_project_client,
    nike_project_id,
):
    client, fake_session = authenticated_project_client

    response = client.get(f"/api/projects/{nike_project_id}/candidates")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["success"] is True
    assert len(payload["candidates"]) == 2
    assert fake_session.committed is True
    assert fake_session.closed is True


def test_get_project_candidates_returns_404_for_invalid_project(
    missing_project_client,
):
    client, fake_session = missing_project_client

    response = client.get("/api/projects/999999/candidates")

    assert response.status_code == 404
    assert response.get_json() == {"error": "Project not found"}
    assert fake_session.committed is False
    assert fake_session.closed is True


def test_get_project_candidates_requires_authentication(
    unauthenticated_project_client,
    nike_project_id,
):
    client, fake_session = unauthenticated_project_client

    response = client.get(f"/api/projects/{nike_project_id}/candidates")

    assert response.status_code == 401
    assert response.get_json() == {"error": "Authentication required"}
    assert fake_session.committed is False
    assert fake_session.closed is False


def test_match_score_is_normalized_to_ui_range(
    authenticated_project_client,
    expected_match_scores,
    nike_project_id,
):
    client, _fake_session = authenticated_project_client

    response = client.get(f"/api/projects/{nike_project_id}/candidates")

    assert response.status_code == 200
    payload = response.get_json()

    for candidate in payload["candidates"]:
        match_score = candidate["match_score"]
        assert isinstance(match_score, (int, float))
        assert 0.0 <= match_score <= 100.0
        assert match_score == expected_match_scores[candidate["name"]]["match_score"]


def test_gap_coverage_scores_structure(
    authenticated_project_client,
    expected_match_scores,
    nike_project_id,
):
    client, _fake_session = authenticated_project_client

    response = client.get(f"/api/projects/{nike_project_id}/candidates")

    assert response.status_code == 200
    payload = response.get_json()

    for candidate in payload["candidates"]:
        gap_scores = candidate["gap_coverage_scores"]
        assert isinstance(gap_scores, dict)
        assert set(gap_scores) == set(expected_match_scores[candidate["name"]]["gap_scores"])

        for gap_name, score in gap_scores.items():
            assert isinstance(gap_name, str)
            assert gap_name
            assert isinstance(score, (int, float))
            assert 0.0 <= score <= 100.0
            assert score == expected_match_scores[candidate["name"]]["gap_scores"][gap_name]

        assert candidate["match_reasoning"]
        assert isinstance(candidate["match_reasoning"], str)
