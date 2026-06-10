from __future__ import annotations

import argparse
import sys
from typing import Any

import httpx


DEMO_REQUESTS = [
    {
        "name": "Sarah reimbursement",
        "description": "Reimburse Sarah £38.40 for client lunch with Acme.",
        "expected_decision": "approved",
        "execute": True,
    },
    {
        "name": "Northstar invoice",
        "description": "Pay Northstar Design £420 for invoice INV-2042.",
        "expected_decision": "needs_approval",
        "approve": True,
        "execute": True,
    },
    {
        "name": "BrightPath refund",
        "description": "Refund BrightPath £260 because we overbilled them.",
        "expected_decision": "approved",
        "execute": True,
    },
    {
        "name": "Duplicate Sarah reimbursement",
        "description": "Reimburse Sarah £38.40 again for the same lunch.",
        "expected_decision": "blocked",
        "execute": False,
    },
]


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run the TrustMe API demo acceptance flow."
    )
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")

    with httpx.Client(timeout=180) as client:
        client.get(f"{base_url}/health").raise_for_status()
        for case in DEMO_REQUESTS:
            _run_case(client, base_url, case)

    print("TrustMe demo acceptance flow passed.")
    return 0


def _run_case(client: httpx.Client, base_url: str, case: dict[str, Any]) -> None:
    created = client.post(
        f"{base_url}/api/requests",
        json={"description": case["description"]},
    )
    created.raise_for_status()
    request_id = created.json()["id"]

    investigated = client.post(f"{base_url}/api/requests/{request_id}/investigate")
    if investigated.status_code >= 400:
        raise RuntimeError(
            f"{case['name']} investigation failed: {investigated.text}"
        )
    decision = investigated.json()
    if decision["decision"] != case["expected_decision"]:
        raise RuntimeError(
            f"{case['name']} expected {case['expected_decision']}, "
            f"got {decision['decision']}: {decision}"
        )

    if case.get("approve"):
        approved = client.post(
            f"{base_url}/api/requests/{request_id}/approve",
            json={"actor": "demo-acceptance", "note": "Taskfile demo run"},
        )
        approved.raise_for_status()

    if case.get("execute"):
        executed = client.post(f"{base_url}/api/requests/{request_id}/execute")
        if executed.status_code >= 400:
            raise RuntimeError(f"{case['name']} execute failed: {executed.text}")
        status = executed.json()["status"]
        if status not in {"completed", "submitted", "requires_approval"}:
            raise RuntimeError(f"{case['name']} returned unexpected payment {status}.")
    else:
        rejected = client.post(f"{base_url}/api/requests/{request_id}/execute")
        if rejected.status_code < 400:
            raise RuntimeError(f"{case['name']} executed but should be blocked.")

    audit = client.get(f"{base_url}/api/requests/{request_id}/audit")
    audit.raise_for_status()
    if not audit.json():
        raise RuntimeError(f"{case['name']} produced no audit events.")
    print(f"{case['name']}: {decision['decision']}")


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Demo acceptance failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
