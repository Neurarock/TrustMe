# Agent to Agent Communication, Without the Ceremony

This guide explains the high-level idea behind connecting your own agent to
Ralio. The short version: your agent does not need to become a banking system.
It just needs to know how to talk to the Ralio CLI.

Think of it as one agent asking another agent to do specialist work.

```text
+------------------+       asks       +----------------------+
| Your agent       | ---------------> | Ralio platform agent |
| planner, caller  |                  | payments, accounts   |
+------------------+ <--------------- +----------------------+
        answer, status, approval links, account info
```

Your agent stays in charge of the user conversation. The Ralio agent handles
the payment-platform work.

## The Cast

```text
+-----------+       text       +------------------+
| Human     | ---------------> | Your agent       |
+-----------+                  | outer agent      |
                               +---------+--------+
                                         |
                                         | run CLI command
                                         v
                               +------------------+
                               | ralio CLI        |
                               | auth + transport |
                               +---------+--------+
                                         |
                                         | HTTPS
                                         v
                               +------------------+
                               | Ralio platform   |
                               | inner agents     |
                               +------------------+
```

The pieces:

- **Human**: asks normal questions like "what agents can I use?"
- **Your agent**: the client agent you build or run.
- **Ralio CLI**: the bridge. It handles auth, tokens, DPoP, API calls, and
  platform transport.
- **Ralio platform agent**: the agent configured in Ralio that can answer
  account, beneficiary, payment, transaction, and approval questions.

The important bit: your agent should not import Ralio internals. Keep the CLI as
the boundary.

## Why Use the CLI Boundary?

Because it keeps the client agent small.

```text
Hard path:

your agent
  |
  +--> implement auth
  +--> implement token refresh
  +--> implement DPoP proofs
  +--> implement API calls
  +--> implement agent discovery
  +--> handle platform errors
  +--> finally do the fun part

CLI path:

your agent
  |
  +--> run ["ralio", "--json", "agents", "list"]
  +--> run ["ralio", "--json", "chat", "--print", ...]
  +--> build something useful
```

The CLI is the transport layer. Your agent is the reasoning layer.

## What the Sample Agent Does

The prepared sample in this folder is a tiny CLI-using agent. It has one generic
tool:

```text
run_cli_command(command: string[], timeout_seconds?: int)
```

It does not have a `ralio_chat` tool. It does not have a Ralio SDK client. It
does not import Ralio internals.

Instead, you give it two things:

```text
1. Permission to run a command:
   --allow-command ralio

2. The hosted Ralio CLI skill:
   https://console.ralio.co/skill.md
```

The sample injects that hosted skill automatically when `ralio` is allowed.

That is the whole trick.

```text
+------------------+
| sample agent     |
| generic loop     |
+--------+---------+
         |
         | allowed command
         v
+------------------+
| ralio CLI        |
+------------------+

+------------------+
| hosted skill URL |
| "how to use it"  |
+------------------+
```

## What Happens When You Type a Message?

Say you type:

```text
You> show me my available Ralio agents
```

The loop looks like this:

```text
Step 1
Your message enters the sample agent.

Step 2
The model reads:
  - your message
  - the Ralio CLI skill
  - the available tool: run_cli_command

Step 3
The model asks to run:
  ["ralio", "--json", "agents", "list"]

Step 4
The sample agent checks:
  - is "ralio" allowed?
  - is the command an argv array?
  - is the timeout sane?

Step 5
The sample agent runs the CLI.

Step 6
The CLI returns JSON.

Step 7
The sample agent feeds that JSON back to the model.

Step 8
The model writes a normal answer for you.
```

In diagram form:

```text
+-------+        +-------------+        +-----------+
| You   | -----> | outer agent | -----> | ralio CLI |
+-------+        +------+------+        +-----+-----+
                        ^                     |
                        |                     v
                        |              +-------------+
                        |              | Ralio agent |
                        |              +------+------+
                        |                     |
                        +---------------------+
                              JSON/result
```

## Step by Step: Use the Prepared Agent

### 1. Install dependencies

From the repo root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Install the Ralio CLI:

```bash
brew install ralioco/tap/ralio
```

### 2. Authenticate the Ralio CLI

Get a one-time registration ticket from the organizer, owner, or admin who has
access to the Ralio console. They create it in:

```text
Settings -> Credentials -> New credential
```

The ticket looks like this:

```text
ralio-reg-...
```

Do not save the ticket on disk. It is short-lived and single-use. Paste it into
the CLI command once:

```bash
ralio auth agent --ticket ralio-reg-...
ralio auth status
```

After that, the ticket has done its job. The CLI saves the real local
credentials under `~/.ralio/`, including:

```text
~/.ralio/credentials.json
~/.ralio/keys/<jkt>.pem
```

If `ralio auth status` looks good, your CLI is ready. You do not need another
ticket unless the local credentials are removed, rejected, expired in a way the
CLI cannot refresh, or you want to register a different machine.

### 3. Run the sample agent

If `ralio` is already on your `PATH`:

```bash
OPENAI_API_KEY="your-openai-api-key" \
uv run python agent.py \
  --allow-command ralio
```

If `ralio` is installed somewhere custom, put that directory on `PATH` before
running the agent:

```bash
PATH="/path/to/ralio/bin:$PATH" \
OPENAI_API_KEY="your-openai-api-key" \
uv run python agent.py \
  --allow-command ralio
```

Now ask it something:

```text
You> show me my available Ralio agents
You> use the best one for account questions and list account names only
You> check whether a 50 GBP office supplies payment is possible, but do not make it
```

The sample is interactive by default. Close it with:

```text
/quit
```

Start a fresh model history and CLI session id with:

```text
/new
```

Print the current session id with:

```text
/id
```

## Step by Step: Use Your Own Agent

You do not have to use our Python file. If your agent can call tools or run
subprocesses, it can connect to Ralio the same way.

Your own agent needs five things:

```text
1. A model loop
2. A generic command tool
3. A command allowlist containing "ralio"
4. The Ralio CLI installed and authenticated
5. The Ralio skill text from https://console.ralio.co/skill.md, or equivalent
   instructions
```

Minimal shape:

```text
+------------------------------+
| your agent loop              |
|                              |
| while not final_answer:      |
|   ask model what to do       |
|   if model asks for command: |
|      validate argv           |
|      run subprocess          |
|      return output to model  |
|   else:                      |
|      show final answer       |
+------------------------------+
```

Pseudo-code:

```python
messages = []

while True:
    turn = model.respond(
        instructions=base_instructions + ralio_skill_text,
        messages=messages,
        tools=[run_cli_command_schema],
    )

    if turn.final_text:
        print(turn.final_text)
        break

    for tool_call in turn.tool_calls:
        command = tool_call.arguments["command"]

        # Keep this boring and strict.
        # No shell. No random commands. No secret env leakage.
        assert command[0] == "ralio"

        result = subprocess.run(
            command,
            shell=False,
            text=True,
            capture_output=True,
            timeout=180,
        )

        messages.append({
            "type": "function_call_output",
            "call_id": tool_call.id,
            "output": {
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
            },
        })
```

The exact framework does not matter. LangGraph, OpenAI Responses API, a custom
loop, a notebook, or a tiny script can all work. The contract is what matters:

```text
model asks for argv command -> your code runs allowed command -> model sees output
```

## The Two Ralio Commands Your Agent Usually Needs

Discover agents:

```json
["ralio", "--json", "agents", "list"]
```

Chat with a selected Ralio agent:

```json
[
  "ralio",
  "--json",
  "chat",
  "--print",
  "--agent",
  "<agent_id>",
  "--conversation",
  "<session_id>",
  "<message>"
]
```

The `--conversation` value should stay stable during a session so follow-up
messages land in the same Ralio conversation.

## Good Pattern, Bad Pattern

Good:

```text
Your agent:
  - loads the hosted Ralio skill
  - runs allowlisted CLI commands
  - treats CLI output as truth
  - summarizes results for the user
```

Bad:

```text
Your agent:
  - imports Ralio internals
  - guesses account state
  - builds payment APIs instead of using the CLI boundary
  - allows arbitrary shell commands
```

Keep it boring at the boundary. Save the creativity for what your agent does
with the result.

## Common Problems

### "No commands are allowed"

You forgot to allow the executable.

```bash
--allow-command ralio
```

or:

```bash
export CLI_AGENT_ALLOWED_COMMANDS="ralio"
```

### "Could not find CLI command 'ralio'"

The command is allowed, but your operating system cannot find it.

Install the CLI or put its install directory on `PATH`:

```bash
PATH="/path/to/ralio/bin:$PATH" \
uv run python agent.py \
  --allow-command ralio
```

The goal is for this to work:

```bash
command -v ralio
```

### "Auth failed" or "not registered"

Check CLI auth:

```bash
ralio auth status
```

Then register if needed:

```bash
ralio auth agent --ticket ralio-reg-...
```

The ticket is only needed for first-time registration on that machine. Do not
store it in your project or `.env` files. Once redeemed, the CLI stores local
credentials in `~/.ralio/` and future commands authenticate automatically.

### "It is talking to localhost"

For production, leave `RALIO_API_URL` unset. The Ralio CLI defaults to:

```text
https://api.ralio.co
```

Only set `RALIO_API_URL` when you intentionally want local or development.

## Final Mental Model

```text
Your agent is the host.
Ralio CLI is the phone.
Ralio platform agent is the specialist on the other end.

Host decides what to ask.
Phone carries the message.
Specialist does the platform work.
Host explains the result.
```

That is agent to agent communication for this reference implementation: one
agent using a CLI to reach another agent, with a small loop in the middle and no
giant integration project hiding under the table.
