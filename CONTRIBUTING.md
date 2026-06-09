# Contributing

Thanks for helping improve Ralio Client Agent. This repository is a reference
implementation, so contributions should keep the code small, readable, and easy
to adapt.

## What To Contribute

Good contributions include:

- Documentation improvements.
- Tests for agent loop, CLI command handling, and error behavior.
- Small fixes that make the reference implementation safer or easier to run.
- Examples that clarify how a client agent connects to Ralio through the CLI.

Please avoid adding product-specific SDK wrappers or broad framework code. The
core pattern should remain a constrained CLI-capable agent loop.

## Development Setup

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt "pytest>=8.0" "ruff>=0.8"
```

If you use `uv`, run:

```bash
uv sync --dev
```

Run the local checks:

```bash
ruff check .
pytest
```

## Pull Requests

Before opening a pull request:

- Keep changes focused and describe the user-visible impact.
- Add or update tests when behavior changes.
- Do not include credentials, auth tickets, tokens, private logs, or real account
  data.
- Prefer argv-style CLI execution. Do not introduce shell-based command
  execution unless there is a specific, reviewed reason.

Public contributors can fork this repository and open pull requests. Ralio
maintainers review and merge accepted changes.
