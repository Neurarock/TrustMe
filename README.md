# TrustMe Ralio Backend

This repository now contains TrustMe, a multi-agent finance operations backend
for money-out requests. TrustMe investigates and decides whether money should
move; Ralio safely moves approved money.

The original Ralio CLI sample remains in `agent.py` as a reference client. The
TrustMe backend lives under `backend/app` and uses FastAPI, PydanticAI, SQLite,
CSV-backed mock business systems, and a mock/live Ralio adapter.

## TrustMe Quickstart

The simplest path is the Taskfile:

```bash
cp .env.example .env
task install
task dev
```

Open the REST docs at `http://127.0.0.1:8000/docs`.

Run the same backend in Docker:

```bash
cp .env.example .env
task up
```

Default mode is `RALIO_MODE=mock`, so the seeded demo can run without Ralio
credentials. For live Ralio, create and register a Ralio credential binding,
set `RALIO_MODE=live` and `RALIO_AGENT_ID`, then keep Ralio credentials in the
host-level `~/.ralio` store. The live adapter lazy-loads Ralio's Python SDK
because the documented `pip install ralio` package is not currently available
on the public PyPI index.

Useful tasks:

```bash
task verify        # ruff + pytest
task smoke         # checks a running API
task demo          # runs the four-request demo flow against a running API
task mcp           # starts the TrustMe MCP server
task ralio:doctor  # checks live Ralio prerequisites
```

`task demo` runs real PydanticAI/OpenAI investigations, so `OPENAI_API_KEY`
must be set in `.env`. The tests use scripted PydanticAI `FunctionModel`
clients and never call OpenAI or Ralio.

To register a live Ralio host, install the CLI first:

```bash
brew install ralioco/tap/ralio
```

Then set `RALIO_REGISTRATION_TICKET` in `.env` and run:

```bash
task ralio:register
```

Ralio writes the private key under `~/.ralio`; do not copy that directory into
the repository. Registration tickets are one-time credentials with a short TTL;
if Ralio returns `ticket_expired`, generate a new ticket in
Console → Settings → Credentials and rerun `task ralio:register`.

## Core Flow

1. `POST /api/requests` creates a money-out request.
2. `POST /api/requests/{id}/investigate` runs the PydanticAI orchestrator,
   specialist agent, and risk agent.
3. `POST /api/requests/{id}/approve` grants TrustMe approval when required.
4. `POST /api/requests/{id}/execute` validates the final decision and calls the
   Ralio adapter.
5. `GET /api/requests/{id}/audit` shows the audit trail.

## Demo Requests

On first startup, TrustMe seeds four demo requests:

- Sarah reimbursement: approved and paid in mock mode.
- Northstar invoice: needs TrustMe approval before execution.
- BrightPath refund: approved and paid in mock mode.
- Duplicate Sarah reimbursement: blocked before Ralio is called.

## MCP

TrustMe exposes its own MCP server:

```bash
task mcp
```

This is separate from Ralio's MCP Gateway. TrustMe MCP tools call TrustMe
services and safety gates; live Ralio execution still goes through the Ralio
REST Chat API via the Ralio Python SDK.

## Original Ralio CLI Sample

The original CLI sample is still available:

```bash
python agent.py --allow-command ralio
```

## Run Interactively

Run the agent and keep it open until you close it:

```bash
python agent.py
```

Useful session commands:

- `/quit` or `/exit` closes the agent.
- `/new` starts a fresh model history and CLI session id.
- `/id` prints the current CLI session id.

Start with an initial prompt and then keep chatting:

```bash
python agent.py \
  "Find available Ralio agents and list account names only."
```

Run a single request and exit:

```bash
python agent.py \
  --once \
  "Check whether a 50 GBP office-supplies payment is possible. Do not make the payment."
```

You can avoid `CLI_AGENT_ALLOWED_COMMANDS` and pass the allowlist explicitly:

```bash
python agent.py \
  --allow-command ralio
```

By default, `--allow-command ralio` or `CLI_AGENT_ALLOWED_COMMANDS="ralio"`
causes the agent to fetch and inject the hosted skill at startup. You can append
additional instructions with `--skill-file` or `--skill-url`. Use
`--no-default-ralio-skill` only when you intentionally want to supply your own
Ralio instructions.

## Design

- `MinimalCliAgent` is the loop: model response, CLI command execution, command
  result, repeat until final text.
- `OpenAIResponsesModelClient` is the model adapter.
- `CliCommandTool` is the only integration adapter. It runs configured
  executables without a shell and returns stdout, stderr, and exit code.
- `--skill-file` and `--skill-url` append external Markdown/text instructions to
  the model.
- `--allow-command ralio` automatically appends the hosted Ralio CLI skill from
  `https://console.ralio.co/skill.md`, unless `--no-default-ralio-skill` is set.
- `--session-id` exposes a stable generic id that skills can use for CLI
  conversation, session, or correlation ids.

For a high-level walkthrough of agent-to-agent communication and how this
sample connects to Ralio through the CLI, see
[`AGENT_TO_AGENT.md`](AGENT_TO_AGENT.md).

## Contributing

Public contributions are welcome through pull requests. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md) before
opening issues or pull requests.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
