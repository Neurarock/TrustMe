from __future__ import annotations

import importlib.util
import os
import shutil
import subprocess
from pathlib import Path


def main() -> int:
    ok = True
    ralio_cli = shutil.which("ralio")
    ralio_home = Path.home() / ".ralio"
    auth_status = _ralio_auth_status(ralio_cli)

    print("Ralio live-mode prerequisite check")
    print(f"RALIO_MODE={os.getenv('RALIO_MODE', 'mock')}")
    print(f"RALIO_AGENT_ID={'set' if os.getenv('RALIO_AGENT_ID') else 'missing'}")
    print(f"ralio CLI={'found at ' + ralio_cli if ralio_cli else 'missing'}")
    print(f"~/.ralio={'present' if ralio_home.exists() else 'missing'}")
    print(f"ralio auth={auth_status}")

    sdk_available = importlib.util.find_spec("ralio_sdk") is not None
    print(f"ralio_sdk={'available' if sdk_available else 'missing'}")

    if os.getenv("RALIO_MODE") == "live":
        if not os.getenv("RALIO_AGENT_ID"):
            ok = False
        if auth_status != "authenticated":
            ok = False
        if not sdk_available:
            ok = False

    if not ralio_cli:
        print("Install the CLI with: brew install ralioco/tap/ralio")
    if auth_status != "authenticated":
        print("Register this host with: task ralio:register")
    if not sdk_available:
        print("Live REST mode needs the Ralio Python SDK when it is available.")

    return 0 if ok else 1


def _ralio_auth_status(ralio_cli: str | None) -> str:
    if ralio_cli is None:
        return "unknown"
    result = subprocess.run(
        [ralio_cli, "auth", "status"],
        check=False,
        capture_output=True,
        text=True,
        timeout=10,
    )
    combined = f"{result.stdout}\n{result.stderr}".casefold()
    if "not authenticated" in combined:
        return "not_authenticated"
    if result.returncode == 0:
        return "authenticated"
    return "unknown"


if __name__ == "__main__":
    raise SystemExit(main())
