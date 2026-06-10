from __future__ import annotations

import argparse
import sys

import httpx


def main() -> int:
    parser = argparse.ArgumentParser(description="Smoke-check a running TrustMe API.")
    parser.add_argument("--base-url", default="http://127.0.0.1:8000")
    args = parser.parse_args()
    base_url = args.base_url.rstrip("/")

    with httpx.Client(timeout=10) as client:
        health = client.get(f"{base_url}/health")
        health.raise_for_status()
        if health.json() != {"status": "ok"}:
            raise RuntimeError(f"Unexpected health response: {health.text}")

        requests = client.get(f"{base_url}/api/requests")
        requests.raise_for_status()
        items = requests.json()
        if not isinstance(items, list):
            raise RuntimeError("Expected /api/requests to return a list.")

    print(f"TrustMe API is healthy at {base_url}; {len(items)} requests visible.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Smoke check failed: {exc}", file=sys.stderr)
        raise SystemExit(1) from exc
