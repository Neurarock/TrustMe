# Ralio Client Agent

This repository is a reference implementation for a client agent that connects
to a Ralio Agent through the Ralio CLI.

It keeps the agent loop deliberately small so implementers can focus on how a
CLI-capable client agent interacts with Ralio, instead of rebuilding an agent
loop from scratch.

The Python agent does not import or wrap Ralio SDK, API, or CLI internals. It
has one generic tool: `run_cli_command`. That tool executes allowed CLI commands
as argv arrays without a shell. Product-specific behavior is supplied through
external skill files.

## Setup

From the repo root:

```bash
python -m pip install openai
```

Install and authenticate whatever CLI the agent should use. For Ralio:

```bash
brew install ralioco/tap/ralio
ralio auth agent --ticket ralio-reg-...
ralio auth status
```

Set the OpenAI key and allow the executable the agent may run:

```bash
export OPENAI_API_KEY="your-openai-api-key"
export CLI_AGENT_ALLOWED_COMMANDS="ralio"
```

The sample defaults to OpenAI model `gpt-5.4`. The Ralio CLI defaults to the
production API at `https://api.ralio.co` when `RALIO_API_URL` is unset. Leave
`RALIO_API_URL` unset for production; set it only when intentionally targeting a
local or development API.

## Run Interactively

Run the agent and keep it open until you close it:

```bash
CLI_AGENT_ALLOWED_COMMANDS="ralio" \
python agent.py \
  --skill-file skills/ralio_cli.md
```

Useful session commands:

- `/quit` or `/exit` closes the agent.
- `/new` starts a fresh model history and CLI session id.
- `/id` prints the current CLI session id.

Start with an initial prompt and then keep chatting:

```bash
CLI_AGENT_ALLOWED_COMMANDS="ralio" \
python agent.py \
  --skill-file skills/ralio_cli.md \
  "Find available Ralio agents and list account names only."
```

Run a single request and exit:

```bash
CLI_AGENT_ALLOWED_COMMANDS="ralio" \
python agent.py \
  --once \
  --skill-file skills/ralio_cli.md \
  "Check whether a 50 GBP office-supplies payment is possible. Do not make the payment."
```

You can avoid the env var and pass the allowlist explicitly:

```bash
python agent.py \
  --allow-command ralio \
  --skill-file skills/ralio_cli.md
```

## Design

- `MinimalCliAgent` is the loop: model response, CLI command execution, command
  result, repeat until final text.
- `OpenAIResponsesModelClient` is the model adapter.
- `CliCommandTool` is the only integration adapter. It runs configured
  executables without a shell and returns stdout, stderr, and exit code.
- `--skill-file` appends external Markdown/text instructions to the model.
- `--session-id` exposes a stable generic id that skills can use for CLI
  conversation, session, or correlation ids.

To adapt this for another platform, allow a different executable and provide a
different skill file. The agent code should not need to change.

For a casual high-level walkthrough of agent-to-agent communication and how this
sample connects to Ralio through the CLI, see
[`AGENT_TO_AGENT.md`](AGENT_TO_AGENT.md).
