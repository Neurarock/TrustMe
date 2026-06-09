# Ralio Client Agent

This repository is a reference implementation for a client agent that connects
to a Ralio Agent through the Ralio CLI.

It keeps the agent loop deliberately small so implementers can focus on how a
CLI-capable client agent interacts with Ralio, instead of rebuilding an agent
loop from scratch.

The Python agent does not import or wrap Ralio SDK, API, or CLI internals. It
has one generic tool: `run_cli_command`. That tool executes allowed CLI commands
as argv arrays without a shell. When `ralio` is allowed, the agent automatically
loads the hosted Ralio CLI skill from
[`https://console.ralio.co/skill.md`](https://console.ralio.co/skill.md).

## Status

This is a reference implementation, not production infrastructure. It is
intended to be small, inspectable, and easy to adapt when building a client
agent that connects to Ralio through the CLI.

## Prerequisites

- Python 3.11 or newer.
- An OpenAI API key for the model client.
- The Ralio CLI installed and available on `PATH`.
- Access to a Ralio Agent. For machine callers, this usually means a
  `ralio-reg-...` registration ticket for `ralio auth agent`.

## Setup

From the repo root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

For development with the locked dependency set, you can use `uv` instead:

```bash
uv sync --dev
```

After `uv sync`, run commands with `uv run` or activate the generated `.venv`.

Install whatever CLI the agent should use. For Ralio, use Homebrew on macOS
arm64 or Linux x86_64:

```bash
brew install ralioco/tap/ralio
```

Or use the install script:

```bash
curl -fsSL https://releases.ralio.co/install.sh | bash
```

The install script auto-detects macOS arm64 or Linux x64 and installs the
`ralio` binary to `/usr/local/bin`.

Authenticate the Ralio CLI:

```bash
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
python agent.py
```

Useful session commands:

- `/quit` or `/exit` closes the agent.
- `/new` starts a fresh model history and CLI session id.
- `/id` prints the current CLI session id.

Start with an initial prompt and then keep chatting:

```bash
CLI_AGENT_ALLOWED_COMMANDS="ralio" \
python agent.py \
  "Find available Ralio agents and list account names only."
```

Run a single request and exit:

```bash
CLI_AGENT_ALLOWED_COMMANDS="ralio" \
python agent.py \
  --once \
  "Check whether a 50 GBP office-supplies payment is possible. Do not make the payment."
```

You can avoid the env var and pass the allowlist explicitly:

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

To adapt this for another platform, allow a different executable and provide a
different skill file or URL. The agent code should not need to change.

For a casual high-level walkthrough of agent-to-agent communication and how this
sample connects to Ralio through the CLI, see
[`AGENT_TO_AGENT.md`](AGENT_TO_AGENT.md).

## Contributing

Public contributions are welcome through pull requests. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) and [`SECURITY.md`](SECURITY.md) before
opening issues or pull requests.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE).
