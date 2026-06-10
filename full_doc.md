# Ralio Documentation - Full Content

Generated: 2026-06-09 17:40 UTC

Source: https://docs.ralio.co

This file contains all Ralio documentation pages concatenated for LLM consumption.

Individual pages: https://docs.ralio.co/llms.txt

OpenAPI spec: https://docs.ralio.co/openapi.json



========================================================================
URL: https://docs.ralio.co/introduction
TITLE: Introduction
========================================================================
import { CardGrid, LinkCard } from '@astrojs/starlight/components';

# Ralio

Ralio lets you create AI agents that perform banking operations on your behalf. Each agent operates within guardrails you define: spend limits, tool permissions, and human-in-the-loop approvals. You interact with agents via a web console, CLI, REST API or MCP Gateway.

## What Ralio Does

A **Ralio agent** is a scoped payment authority. You create an agent, configure what it can do, connect it to a banking provider, and then direct it in natural language — via chat or programmatic access. The agent executes banking operations, and Ralio enforces your guardrails at every step.

**Typical use cases:**

- An internal payments bot that processes expense reimbursements after human approval
- An automated treasury agent that sweeps balances on a schedule
- A customer-service agent that issues refunds within a daily spend limit
- An AI assistant in your existing app that can make payments via the MCP Gateway

At a high level, a request flows from any interface to your Ralio agent. The agent operates with **scoped authority** — bounded by guardrails and approvals, it can only reach payment infrastructure within those limits, and every step is recorded:

<figure class="ralio-flow" role="img" aria-label="A request flows from you, through an interface (Console, CLI, REST API, or MCP Gateway), into a Ralio agent whose authority is scoped by guardrails and approvals — intent verification, spend limits, tool permissions, and approvals. Only actions within those limits reach payment infrastructure, and every step is written to an audit log.">
<svg viewBox="0 0 964 268" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="rf-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
    </marker>
  </defs>

  {/* scoped-authority boundary (dashed) wrapping the agent */}
  <rect x="376" y="68" width="380" height="128" rx="12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="6 5" />

  {/* boxes */}
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="93" width="116" height="54" rx="8" />
    <rect x="168" y="93" width="172" height="54" rx="8" />
    <rect x="474" y="100" width="184" height="40" rx="8" stroke="var(--sl-color-text-accent)" stroke-width="2.5" />
    <rect x="792" y="93" width="156" height="54" rx="8" />
    <rect x="168" y="216" width="780" height="38" rx="8" stroke-dasharray="5 4" />
  </g>

  {/* flow arrows: input crosses into the boundary, output crosses out */}
  <g stroke="currentColor" stroke-width="1.5" fill="none" marker-end="url(#rf-arrow)">
    <line x1="132" y1="120" x2="166" y2="120" />
    <line x1="340" y1="120" x2="472" y2="120" />
    <line x1="658" y1="120" x2="790" y2="120" />
  </g>

  {/* audit dashed arrows */}
  <g stroke="currentColor" stroke-width="1.5" fill="none" stroke-dasharray="5 4" marker-end="url(#rf-arrow)">
    <line x1="566" y1="196" x2="566" y2="214" />
    <line x1="870" y1="147" x2="870" y2="214" />
  </g>

  {/* text */}
  <g fill="currentColor" text-anchor="middle">
    <text x="74" y="117" font-size="13.5" font-weight="600">You /</text>
    <text x="74" y="135" font-size="13.5" font-weight="600">your app</text>

    <text x="254" y="116" font-size="13.5" font-weight="600">Interfaces</text>
    <text x="254" y="135" font-size="10.5">Console · CLI · REST API · MCP</text>

    <text x="566" y="124" font-size="13.5" font-weight="600">Ralio Agent</text>

    <text x="870" y="116" font-size="13" font-weight="600">Payment</text>
    <text x="870" y="134" font-size="13" font-weight="600">infrastructure</text>

    <text x="566" y="88" font-size="11.5" font-weight="600">Guardrails &amp; approvals · scoped authority</text>
    <text x="566" y="164" font-size="10.5">intent verification  ·  spend limits</text>
    <text x="566" y="182" font-size="10.5">tool permissions  ·  <tspan fill="var(--sl-color-text-accent)">approvals</tspan></text>

    <text x="558" y="240" font-size="13" font-weight="600">Audit log <tspan font-weight="400">— every step recorded</tspan></text>
  </g>
</svg>
</figure>

## Core Concepts

<CardGrid>
  <LinkCard title="Agents" href="/concepts/agents" description="Configurable payment entities with a defined purpose, spend limits, and tool permissions." />
  <LinkCard title="Payment Intents" href="/concepts/payment-intents" description="Every payment starts as an intent — a recorded request before execution, enabling audit and approval." />
  <LinkCard title="Intent Verification" href="/concepts/intent-verification" description="A separate model scores each payment intent against the conversation and agent purpose. Low scores pause the payment for human approval." />
  <LinkCard title="Tool Permissions" href="/concepts/tool-permissions" description="Control which banking operations an agent can execute — automatically or with approval." />
  <LinkCard title="Spend Limits" href="/concepts/spend-limits" description="Hard and soft limits on per-transaction, daily, and monthly spending." />
  <LinkCard title="Approvals" href="/concepts/approvals" description="Real-time human-in-the-loop approval flows for tool calls and spend limit overrides." />
</CardGrid>

## Integration Options

| Interface | Best For |
|-----------|----------|
| **Web Console** | Humans managing agents, configuring guardrails, reviewing transactions |
| **REST API** | Server-side integrations, custom dashboards, programmatic agent management |
| **CLI (`ralio`)** | Terminal-based chat and automation |
| **MCP Gateway** | AI agents (Claude, GPT, etc.) calling banking tools directly |

## Quick Navigation

<CardGrid>
  <LinkCard title="Quickstart" href="/quickstart" description="Create your first agent and make a payment in 5 minutes." />
  <LinkCard title="API Reference" href="/api-reference/overview" description="Complete REST API documentation with examples." />
  <LinkCard title="MCP Gateway" href="/mcp/overview" description="Connect an AI agent to Ralio banking tools." />
  <LinkCard title="CLI" href="/cli/overview" description="Terminal-based chat, agent management, and automation." />
</CardGrid>

## Base URLs

| Service | URL |
|---------|-----|
| REST API | `https://api.ralio.co` |
| MCP Gateway | `https://mcp.ralio.co` |
| Console | `https://console.ralio.co` |

## Machine-Readable Specs

LLMs and tools can consume the full API surface from these files:

- **OpenAPI 3.1 (JSON):** [`https://docs.ralio.co/openapi.json`](https://docs.ralio.co/openapi.json)
- **Full docs (plaintext):** [`https://docs.ralio.co/llms-full.txt`](https://docs.ralio.co/llms-full.txt)


========================================================================
URL: https://docs.ralio.co/quickstart
TITLE: Quickstart
========================================================================
import { CardGrid, LinkCard } from '@astrojs/starlight/components';

This guide walks through the complete flow from registration to a first payment — entirely in the [Ralio Console](https://console.ralio.co).

## Prerequisites

- A web browser — everything below happens in the [Ralio Console](https://console.ralio.co).

No external banking account is needed — every Ralio account comes with a **RalioWallet** sandbox provider enabled by default.

## Step 1: Register and Confirm Your Email

Go to [console.ralio.co](https://console.ralio.co) and choose **Sign up**. Enter your email, a password, and your name and company (e.g. `Acme Ltd`), then submit.

Check your inbox and click the confirmation link. Your account starts in `pending_approval` status — an admin must approve it before you can log in.

## Step 2: Log In

Once your account is approved, sign in at [console.ralio.co](https://console.ralio.co) with your email and password. You'll land on your dashboard, where you can create agents and review activity.

## Step 3: Create an Agent

Your account already has **RalioWallet** enabled — no banking setup required to get started.

In the console, go to **Agents → New agent**. Give it a name (`Payroll Agent`) and a plain-language purpose (`Handles monthly payroll disbursements`); Ralio drafts the tool allow-list and conservative default spend limits, which you review and save. For a supervised start, leave **always require approval** enabled so every payment pauses for your sign-off.

Your new agent now appears in the agent list, ready to use.

## Step 4: Adjust Spend Limits (Optional)

If you created the agent with **always require approval** enabled, every payment pauses for your approval. For autonomous operation up to a cap, open **Agents → Payroll Agent → Settings → Spend Limits** and set soft (approval) and hard (block) thresholds per dimension — for example, approve above £100 per transaction and block above £500. Payments above the soft thresholds pause for approval; payments above the hard thresholds are blocked outright.

## Step 5: Chat and Make a Payment

Open **Agents → Payroll Agent → Chat** and send a message to confirm the agent can see your accounts:

> What bank accounts do I have?

The agent replies with your RalioWallet account and its balance — for example, *"Acme Ltd Current Account (sort code 04-00-04) with a balance of £10,000.00 GBP."*

Now ask it to make a payment:

> Send £100 to account acc_sandbox_recipient_001

The agent creates a payment intent and checks it against your spend limits. If the payment needs sign-off — because **always require approval** is on, or it crosses a soft limit — it pauses and appears under **Approvals**. Approve it there and the agent completes the payment, confirming back in the chat.

## CLI Quickstart

```bash
# Install (pick one)
brew install ralioco/tap/ralio                       # Homebrew
curl -fsSL https://releases.ralio.co/install.sh | bash  # or install script

# Authenticate (humans)
ralio auth login       # Opens browser for OAuth

# Or register an agent host (CI / autonomous bots)
ralio auth agent --ticket ralio-reg-<...>    # Generated in Console → Credentials

# Chat
ralio chat "What's my balance?"

# Make a payment interactively
ralio chat
```

## Next Steps

<CardGrid>
  <LinkCard title="Configure Tool Permissions" href="/concepts/tool-permissions" description="Control which tools the agent can use automatically vs. with your approval." />
  <LinkCard title="Connect via MCP" href="/mcp/overview" description="Use Ralio banking tools from Claude, Cursor, or any MCP client." />
  <LinkCard title="API Reference" href="/api-reference/overview" description="Full documentation for every REST endpoint." />
  <LinkCard title="Build a Payment Agent" href="/guides/building-agent" description="Step-by-step guide to deploying an autonomous payment agent." />
</CardGrid>


========================================================================
URL: https://docs.ralio.co/concepts/agents
TITLE: Agents
========================================================================
An **agent** is a configurable AI entity that executes banking operations on your behalf. Each agent has a **purpose** — a plain-language statement of what it's meant to do (e.g., "Process employee expense reimbursements up to £500 per transaction"). The purpose is injected into the agent's system prompt to guide its behaviour. You create and configure agents — purpose, guardrails (spend limits and tool permissions), and banking provider — in the console, then instruct them in natural language, either from the console or programmatically through the chat API.

Each agent is scoped to a single user — agents cannot access another user's accounts. A user can create multiple agents for different purposes (e.g., a payroll agent, a refund agent, an expense tracker).

## Agent Lifecycle

1. **Describe** — Write a plain-language statement of what the agent should do. Ralio's profile generator turns it into a draft configuration: a name, the smallest tool allow-list that satisfies the purpose, and conservative default spend limits.
2. **Edit and create** — Adjust the draft (tools, spend limits, banking provider) and save.
3. **Use** — Send messages via chat, CLI, or API. The agent reasons about your request and executes banking tools.
4. **Monitor** — Review transactions and audit logs. The agent's full action history is retained.
5. **Delete** — Agents can be permanently deleted. Conversations and audit logs are retained for compliance.

## AI Profile Generation

When creating an agent in the console, Ralio derives a complete configuration draft from a plain-language purpose — a friendly name plus the smallest tool allow-list that satisfies the purpose and conservative default spend limits. You review and edit the draft before saving.

## Banking Provider

Each agent is associated with one banking provider at a time:

- **RalioWallet** — Built-in provider, enabled by default. No setup required.
- **Griffin** — UK bank API. FPS (Faster Payments) and book transfers. Configured with an API key.
- **Revolut** — Revolut Business. Connected via OAuth.

New agents default to RalioWallet. To use Griffin or Revolut, assign the provider in the console under the agent's settings — you must have that provider connected in your account settings first.

## Agent Permissions and Guardrails

Agents operate within four layers of guardrails:

1. **Tool Permissions** — Which banking tools the agent can call. See [Tool Permissions](/concepts/tool-permissions).
2. **Spend Limits** — Hard and soft limits on payment amounts and counts. See [Spend Limits](/concepts/spend-limits).
3. **Account Allowlists** — Which bank accounts the agent can see and operate on. See [Account Allowlists](/concepts/account-allowlists).
4. **Intent Verification** — Every payment intent is scored against the conversation and agent purpose. See [Intent Verification](/concepts/intent-verification).

All four are set during creation or in agent settings. The AI profile generator picks sensible defaults for tool permissions and spend limits from your purpose; account allowlists are configured separately.

## Multiple Agents

A single user can create many agents. Each agent has independent:
- Spend limits (per currency)
- Tool permissions
- Conversation history
- Audit log entries

This allows you to create purpose-built agents: a conservative read-only agent for balance queries, a payment agent with strict limits, and an admin agent for configuration tasks.

## Related Pages

- [Tool Permissions](/concepts/tool-permissions) — Control what the agent can do
- [Spend Limits](/concepts/spend-limits) — Set payment limits
- [Account Allowlists](/concepts/account-allowlists) — Restrict which bank accounts the agent can access
- [Conversations](/concepts/conversations) — How chat history works
- [Banking Providers](/concepts/banking-providers) — Griffin and Revolut setup
- [Console: Managing Agents](/console/agents) — Create and manage agents in the UI


========================================================================
URL: https://docs.ralio.co/concepts/payment-intents
TITLE: Payment Intents
========================================================================
A **payment intent** is a record of a proposed payment created by an agent before execution. Every payment flows through this step — the agent analyses the conversation, determines the payment parameters, and records them as an intent. Only after the intent passes all guardrails (spend limits, tool permissions, and [intent verification](/concepts/intent-verification)) does the actual payment execute.

## Why Intents Exist

Payment intents serve three purposes:

1. **Auditability** — Every payment has a clear record of what was requested and why, linked to the conversation that triggered it.
2. **Verification** — The intent is scored against the conversation to catch misaligned payments before they execute.
3. **Traceability** — The intent captures the agent's reasoning, making it possible to review why a payment was made after the fact.

## Intent Lifecycle

1. The user asks the agent to make a payment in conversation.
2. The agent calls `create_payment_intent` with the proposed parameters and a factual summary of the request.
3. Ralio records the intent and runs [intent verification](/concepts/intent-verification) against the conversation context.
4. If verification passes, the agent proceeds to execute the payment via `create_payment`.
5. If verification fails, the payment is paused for human approval.

## Related Pages

- [Intent Verification](/concepts/intent-verification) — How intents are scored against the conversation
- [Transactions API](/api-reference/transactions) — List payment intents and transactions via API
- [Audit Logs](/concepts/audit-logs) — Full action trail including `payment.intent_created` events
- [Spend Limits](/concepts/spend-limits) — How limits are enforced per transaction


========================================================================
URL: https://docs.ralio.co/concepts/intent-verification
TITLE: Intent Verification
========================================================================
**Intent verification** is a guardrail that checks whether a proposed payment actually matches what the user requested. Before any payment executes, Ralio evaluates the [payment intent](/concepts/payment-intents) against the conversation history and the agent's configured purpose. If the score falls below the threshold, the payment is paused for human approval.

Intent verification is always enabled for payment-capable agents. There is no toggle — every payment is checked.

## How It Works

1. The agent creates a [payment intent](/concepts/payment-intents) with the proposed payment parameters and its interpretation of the conversation.
2. Ralio evaluates the full conversation, the intent parameters, and the agent's purpose.
3. This produces a composite score (0.0 to 1.0) across five dimensions.
4. If the score meets the threshold, the payment proceeds automatically.
5. If the score is below the threshold, the payment is paused and the user sees an approval card with the score, explanation, and intent details.

## Scoring Dimensions

Five dimensions are evaluated independently:

| Dimension | What It Checks |
|-----------|---------------|
| **Amount accuracy** | Does the payment amount match what the user explicitly stated or confirmed? |
| **Currency accuracy** | Does the currency match the user's request or conversation context? |
| **Recipient accuracy** | Does the recipient match who the user intended to pay? |
| **User consent** | Did the user clearly confirm or agree to this specific payment? |
| **Purpose alignment** | Does the payment fall within the scope of the agent's configured purpose? |

Every dimension must be aligned — a single misaligned dimension produces a low overall score. For example, if the amount, currency, recipient, and consent are all correct but the payment falls outside the agent's purpose, that one dimension pulls the overall score down and the payment is paused for approval.

## Purpose Alignment

The purpose alignment dimension uses the agent's configured [purpose](/concepts/agents) to evaluate whether the payment is within scope. For example:

- An agent with purpose *"recurring utility bill payments"* processing a transfer to a personal account would score low on purpose alignment.
- An agent with a broad or empty purpose scores 1.0 on this dimension — no constraint means no penalty.

## Approval Flow

When the score falls below the threshold:

1. The payment is paused.
2. In the console, an approval card appears showing:
   - The alignment score and threshold
   - The explanation for the score
   - The payment intent details (amount, currency, recipient)
3. You can **approve** or **deny** the payment.

## Fail-Closed Design

Intent verification is designed to fail closed:

- If verification cannot be computed, the payment requires approval.
- If the score cannot be persisted, the payment is blocked.
- There is no way to bypass verification for payment-capable agents.

## Related Pages

- [Payment Intents](/concepts/payment-intents) — The recorded payment request that is scored
- [Agents](/concepts/agents) — Configuring an agent's purpose
- [Approvals](/concepts/approvals) — How approval flows work
- [Tool Permissions](/concepts/tool-permissions) — The allow/ask/deny model for tool access


========================================================================
URL: https://docs.ralio.co/concepts/tool-permissions
TITLE: Tool Permissions
========================================================================
Every agent has a **tool allow-list** that controls which banking operations it can perform. Tools not in the list are denied. Configure the list when creating the agent (the AI generator picks the smallest set that satisfies your purpose) or change it later in the console.

## How It Works

Each agent has a list of allowed tools. When the agent tries to call a tool, the system checks the list — if the tool is allowed, the call proceeds; if not, the call returns a denial the agent can react to (e.g., explain to the user that the tool is not available).

For example, an agent allowed only `list_accounts`, `get_balance`, and `list_transactions` can read accounts, balances, and transactions, but cannot create payments or manage beneficiaries.

## Always-Allowed Tools

Two tools bypass the allow-list and are available to every agent:

| Tool | Why |
|------|-----|
| `list_accounts` | Read-only. Required so the agent can discover available accounts. |
| `get_payment_status` | Read-only. Required so the agent can confirm payment outcomes. |

You don't need to add these to the allow-list — they're always callable.

## Coupled Permissions

`create_payment_intent` inherits its permission from `create_payment`. Granting `create_payment` automatically grants `create_payment_intent` (the agent must be able to draft an intent before executing it). They cannot be configured independently.

## Tool Catalog

| Tool | Description | Always Allowed |
|------|-------------|----------------|
| `list_accounts` | List the agent's bank accounts. | Yes |
| `get_account_details` | Get sort code, account number, and balance for an account. | No |
| `get_balance` | Get the current balance for an account. | No |
| `list_transactions` | List recent transactions. | No |
| `list_beneficiaries` | List saved payment beneficiaries. | No |
| `create_beneficiary` | Save a new beneficiary. | No |
| `delete_beneficiary` | Remove a saved beneficiary. | No |
| `create_payment` | Execute a payment. Subject to spend limits. | No |
| `create_payment_intent` | Record a payment intent before execution. Coupled to `create_payment`. | No |
| `get_payment_status` | Check the status of a payment. | Yes |

## Tool Permissions vs Approvals

The allow-list decides whether a tool **can be called**. It doesn't decide whether a `create_payment` call **needs human approval** — that's the job of the agent's [spend limits](/concepts/spend-limits).

In short:
- **Tool not allowed** → the call is denied without ever asking you.
- **Tool allowed and below all soft thresholds** → the call executes immediately.
- **Tool allowed and above a soft threshold** (or `always_require_approval` is true) → you're asked to approve before it executes.
- **Tool allowed and above a hard threshold** → the call is denied and approval is not offered.

See [Approvals](/concepts/approvals) for the full approval flow.

## Viewing and Editing Permissions

In the console, go to **Agents → [Agent Name] → Settings → Tools** to see and change the allow-list.

## Machine Auto-Approval

When an agent is accessed through programmatic (non-interactive) authentication — a credential binding rather than a signed-in user — payments that would otherwise prompt for confirmation are **automatically approved**, as long as the request is within the credential's granted scopes. No human approval step occurs. **Hard spend limits still apply** and cannot be bypassed by any auth method.

This enables fully autonomous agent operation when using programmatic access. See [Scopes](/authentication/scopes) for scope details.

## Related Pages

- [Approvals](/concepts/approvals) — How spend-limit approval flows work
- [Spend Limits](/concepts/spend-limits) — Hard and soft limit controls
- [Authentication / Scopes](/authentication/scopes) — How credential-binding scopes map to tools
- [Console: Managing Agents](/console/agents) — Edit tool permissions in the UI


========================================================================
URL: https://docs.ralio.co/concepts/spend-limits
TITLE: Spend Limits
========================================================================
**Spend limits** cap how much an agent can spend. They are enforced automatically before every payment, before any money moves. There are two kinds: **hard limits** (block the payment) and **soft limits** (trigger a human approval request).

## Limit Tiers

Spend limits are defined per-agent per-currency. Each currency has three tiers:

| Limit | Description |
|-------|-------------|
| `max_transaction` | Maximum amount for a single payment. |
| `daily_limit` | Maximum total spending in a calendar day (UTC). |
| `monthly_limit` | Maximum total spending in a calendar month (UTC). |

### Ordering Rule

Limits must satisfy this inequality — Ralio rejects configurations that violate it:

```
max_transaction ≤ daily_limit ≤ monthly_limit
```

### Example

```json
{
  "currency": "GBP",
  "max_transaction": 500.00,
  "daily_limit": 5000.00,
  "monthly_limit": 50000.00
}
```

## Hard Limits

When a payment would exceed a **hard limit**, the payment is **blocked**. The agent receives an error and cannot proceed. The user sees an explanation in the chat.

Hard limits cannot be overridden — they are always enforced.

## Soft Limits

**Soft limits** are optional thresholds below the hard limits. When a payment would exceed a soft limit (but stay within the hard limit), the agent **pauses** and requests your approval before proceeding.

| Soft Limit Field | Description |
|-----------------|-------------|
| `soft_max_transaction` | Soft per-transaction threshold (must be < `max_transaction`). |
| `soft_daily_limit` | Soft daily threshold (must be < `daily_limit`). |
| `soft_monthly_limit` | Soft monthly threshold (must be < `monthly_limit`). |

Soft limits are optional. If not set, payments proceed automatically up to the hard limits.

### Soft Limit Example

```json
{
  "currency": "GBP",
  "max_transaction": 1000.00,
  "daily_limit": 10000.00,
  "monthly_limit": 100000.00,
  "soft_max_transaction": 500.00,
  "soft_daily_limit": 8000.00,
  "soft_monthly_limit": 80000.00
}
```

With this config:
- A £400 payment: executes automatically (under all soft limits).
- A £600 payment: pauses for approval (exceeds `soft_max_transaction` of £500).
- A £1100 payment: **blocked** (exceeds `max_transaction` hard limit of £1000).

## Enforcement

Spend limit enforcement happens at the moment `create_payment` is called. Ralio sums all payments made by the agent in the relevant time window:

- **Per-transaction:** compared against the single payment amount.
- **Daily:** all payments by this agent in the current UTC calendar day.
- **Monthly:** all payments by this agent in the current UTC calendar month.

The enforcement logic:
1. If the payment would exceed a hard limit → **DENY** (blocked, cannot proceed).
2. If the payment would exceed a soft limit (but not a hard limit) → **CONFIRM** (paused, approval required).
3. Otherwise → **APPROVE** (payment proceeds).

## Setting Spend Limits

Go to **Agents → [Agent Name] → Settings → Spend Limits**. Enter hard and optional soft limits per currency — a per-transaction, daily, and monthly amount for each. The console validates the ordering rules before saving.

## No Limits Configured

If an agent has no spend limits configured, **all payments are approved** without limit checks. Always configure spend limits before deploying an agent that can make real payments.

## Related Pages

- [Approvals](/concepts/approvals) — What happens when a soft limit is exceeded
- [Tool Permissions](/concepts/tool-permissions) — Control which tools the agent can use
- [Console: Managing Agents](/console/agents) — Set spend limits in the UI


========================================================================
URL: https://docs.ralio.co/concepts/approvals
TITLE: Approvals
========================================================================
**Approvals** let you stay in control of agent actions. When an agent needs your sign-off — a tool set to *Ask*, a payment over a soft spend limit, or a low intent-verification score — it pauses and sends you an approval request in real time.

There are three types of approval:

| Type | Trigger | What You Decide |
|------|---------|----------------|
| **Tool Approval** | A tool set to *Ask* permission is about to run | Approve once, approve for the conversation, or deny the call |
| **Spend Limit Approval** | Payment would exceed a soft spend limit | Approve or deny the payment |
| **Intent Verification Approval** | Payment intent scored below the alignment threshold | Approve or deny the payment |

## Spend Limit Approvals

When a payment would exceed a **soft spend limit** (but stay within the hard limit), the agent pauses and asks for your approval. Payments that would exceed a hard limit are blocked outright — no approval is possible.

In the console, an approval modal appears showing:

- The **payment amount** and **currency**
- Which **limit was exceeded** (per-transaction, daily, or monthly)
- The **soft limit** and **hard limit** values
- A **plain-English explanation** of the breach

You can **Approve** to let the payment proceed, or **Deny** to cancel it. If no decision is received within **5 minutes**, the payment is automatically denied.

### Confirm Every Payment

Set `always_require_approval: true` on the agent's spend limits and **every payment** triggers an approval request, regardless of amount. This is the safest configuration — a human reviews every transaction. The AI profile generator applies it by default for any payment-capable agent.

### Threshold-Based Approval

Set `require_approval_above_transaction_amount`, `require_approval_above_daily_amount`, or the monthly equivalent to confirm only payments that exceed a threshold. Payments below the soft limits proceed automatically; payments between the soft and hard limits require approval. Use this when you want autonomous operation under a known cap.

## Intent Verification Approvals

When a payment intent's [alignment score](/concepts/intent-verification) falls below the threshold, the agent pauses and asks for your approval.

In the console, an approval card appears showing:

- The **alignment score** and **threshold**
- The scoring model's **explanation** of why the score is low
- The **payment intent details** (amount, currency, recipient)

This catches cases where the agent misinterprets the conversation — for example, paying the wrong amount or the wrong recipient.

## Tool Approvals

When a tool is set to **Ask** permission (see [Tool Permissions](/concepts/tool-permissions)), the agent pauses before running it and shows an approval request with the **tool name**, its **arguments**, and a plain-English explanation. You can **Approve** (this call only), **Approve for conversation** (skip approval for this tool for the rest of the session), or **Deny**. As with payment approvals, no response within **5 minutes** denies the call.

## Machine Auto-Approval

When an agent is accessed via a **DPoP-bound access token minted from a credential binding** (rather than an interactive user session), tool calls within the binding's scopes are **automatically approved** — no human approval step occurs.

Hard spend limits still apply and cannot be bypassed by any auth method.

## Console UI

In the web console chat interface, approval requests appear as interactive modals. You can approve or deny with a single click. The modal provides all the context needed to make a decision without leaving the chat.

## Related Pages

- [Tool Permissions](/concepts/tool-permissions) — Per-agent tool allow-list
- [Spend Limits](/concepts/spend-limits) — Hard and soft limits explained
- [Intent Verification](/concepts/intent-verification) — How payment intents are scored


========================================================================
URL: https://docs.ralio.co/concepts/conversations
TITLE: Conversations
========================================================================
A **conversation** is a persistent chat session between a user and an agent. Every message — including the agent's tool calls and their results — is stored and available for later review.

## Message Roles

Messages in a conversation have one of these roles:

| Role | Description |
|------|-------------|
| `user` | Message sent by the human. |
| `assistant` | Response generated by the agent (the LLM). |
| `tool` | Result of a tool call (e.g. the output of `list_accounts`). Rendered as tool call cards in the console. |
| `system` | System-generated messages (rare; used for context injection). |
| `alignment_approval` | Intent verification approval request — shown when a payment intent scores below the alignment threshold. |
| `spend_limit_approval` | Spend limit approval request — shown when a payment would exceed a soft spend limit. |

## Conversation ID

You choose the conversation ID. You can:
- Supply a client-generated UUID (`"conv-my-session-123"`) to maintain continuity across reconnections.
- Omit it and let Ralio auto-generate one.
- Use the same conversation ID across multiple API calls to continue a session.

Conversation IDs are per-user and per-agent. The same ID cannot be reused across different agents.

## Message Persistence

All messages are retained indefinitely. Tool call arguments and results are stored in the message `metadata` field, making every agent action auditable.

When the agent uses conversation history as context, it considers the most recent messages. Older messages remain stored and fully auditable, but may not be included in the agent's reasoning for a new message.

## Creating a Conversation

Conversations are created implicitly when you send a chat message with a new `conversation_id` — pass any unused ID to [`POST /api/chat`](/api-reference/chat) and the conversation is created on first use. You can also start and revisit conversations from the console chat interface.

## Messages

Each chat turn returns the new messages on the response (`new_messages`), and the full history is visible in the console. A stored message looks like:

```json
[
  {
    "id": "msg_001",
    "role": "user",
    "content": "What is my current balance?",
    "status": "accepted",
    "metadata": {},
    "created_at": "2026-04-04T10:00:00Z"
  },
  {
    "id": "msg_002",
    "role": "assistant",
    "content": "Your main account balance is £10,000.00 GBP.",
    "status": "accepted",
    "metadata": {
      "tool_calls": [
        {
          "id": "call_abc123",
          "name": "get_balance",
          "arguments": {},
          "result": {"balance": 10000.00, "currency": "GBP"}
        }
      ]
    },
    "created_at": "2026-04-04T10:00:05Z"
  }
]
```

## Related Pages

- [Agents](/concepts/agents) — Conversations belong to agents
- [POST /api/chat](/api-reference/chat) — Send messages
- [Console: Chat](/console/chat) — Manage conversation history in the UI


========================================================================
URL: https://docs.ralio.co/concepts/banking-providers
TITLE: Banking Providers
========================================================================
Ralio supports three banking providers: **RalioWallet**, **Griffin**, and **Revolut**.

| Provider | Connection | Payment Types | Currency | Default |
|----------|-----------|---------------|----------|---------|
| **RalioWallet** | Built-in | Internal transfers | GBP | Yes |
| **Griffin** | API key | FPS (Faster Payments), Book transfers | GBP | No |
| **Revolut** | OAuth 2.0 | Business transfers | GBP | No |

## RalioWallet

RalioWallet is Ralio's built-in payment provider. It's enabled by default for every account — no external credentials or setup required. New agents are automatically assigned RalioWallet unless you configure a different provider.

RalioWallet is ideal for getting started quickly and for testing agent guardrails without connecting an external bank.

## Griffin

Griffin is a UK bank-as-a-service provider. Ralio uses Griffin's API to:
- List accounts and balances
- Initiate Faster Payments (FPS) to UK bank accounts
- Execute book transfers between Griffin accounts

### Setup

1. Create a Griffin account at [griffin.com](https://griffin.com). The sandbox is free and doesn't require a real business account.
2. Generate an API key in the Griffin dashboard.
3. Add the key to Ralio in the console at **Settings → Integrations → Griffin**, and choose the environment (`sandbox` or `live`).
4. Click **Validate** — Ralio makes a live call to confirm the key works before saving it.
5. Assign Griffin to an agent under **Agents → [Agent Name] → Settings → Banking provider**.

### Environments

| Environment | Base URL | Use |
|-------------|----------|-----|
| `sandbox` | Griffin sandbox API | Development and testing |
| `live` | Griffin production API | Production payments |

### Account URLs

Griffin uses HATEOAS-style URLs to identify accounts. When you call `list_accounts`, you receive URLs like:

```
https://api.griffin.com/v0/bank-accounts/ba_AbCdEfGhIj
```

These URLs are used as identifiers in payment calls (`to_account_url`, `source_account_url`).

## Revolut

Revolut Business provides multi-currency accounts and transfers. Ralio connects via OAuth 2.0.

### Setup

1. Create a Revolut Business sandbox account at [sandbox.revolut.codes](https://sandbox.revolut.codes).
2. In the console, go to **Settings → Integrations → Revolut** and click **Connect Revolut**.
3. You'll be redirected to Revolut's OAuth consent page. Approve access.
4. Revolut redirects back to Ralio with an authorisation code, which is exchanged for access tokens.

### Environments

| Environment | Use |
|-------------|-----|
| `sandbox` | Development and testing (uses Revolut sandbox) |
| `production` | Live business payments |

### Disconnecting

To disconnect a Revolut account, go to **Settings → Integrations → Revolut** and click **Disconnect**. This revokes Revolut access and removes the stored tokens.

## Assigning a Provider to an Agent

Each agent can have one active banking provider at a time. Set it in the console under **Agents → [Agent Name] → Settings → Banking provider**. The choices are RalioWallet, Griffin, Revolut, or none; new agents default to RalioWallet.

## Checking Connected Providers

The console shows the connection status of each provider under **Settings → Integrations** — whether it's connected, the environment (`sandbox` / `live`), and when it was last validated.

## Related Pages

- [Console: Banking Setup](/console/banking-setup) — Step-by-step UI walkthrough
- [Agents](/concepts/agents) — Assigning providers to agents


========================================================================
URL: https://docs.ralio.co/concepts/audit-logs
TITLE: Audit Logs
========================================================================
Ralio maintains a comprehensive audit log of every significant action. Audit logs are immutable — entries are never modified or deleted.

## Audit Log Entry

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Unique entry ID. |
| `user_id` | `string` | The user who owns the agent or triggered the action. |
| `action` | `string` | What happened (see Action Types below). |
| `agent_id` | `string \| null` | Agent involved (if applicable). |
| `agent_name` | `string \| null` | Agent name at the time of the action. |
| `metadata` | `object` | Action-specific details (amounts, tool names, decisions, etc.). The `client_type` and `actor` keys identify which surface (console / cli / mcp / agent / webhook) and which named principal triggered the action. |
| `created_at` | `string` (ISO 8601) | When the action occurred. |

### Example Entry

```json
{
  "id": "log_Abc123Def456",
  "user_id": "usr_Alice789",
  "action": "payment.created",
  "agent_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
  "agent_name": "Payroll Agent",
  "metadata": {
    "client_type": "agent",
    "actor": "Payroll Agent",
    "amount": 500.00,
    "currency": "GBP",
    "to_account": "ba_Xyz789",
    "payment_id": "pmt_Qrs456"
  },
  "created_at": "2026-04-04T10:05:00Z"
}
```

## Action Types

| Action | Description |
|--------|-------------|
| `agent.created` | New agent created. |
| `agent.deleted` | Agent deleted. |
| `payment.intent_created` | Payment intent created. |
| `payment.created` | Payment executed successfully. |
| `spend_limits.updated` | Spend limits changed for an agent. |
| `agent_tool_settings.updated` | Tool settings updated for an agent. |
| `griffin_settings.created` | Griffin API key saved. |
| `griffin_settings.deleted` | Griffin API key removed. |
| `revolut_connection.created` | Revolut OAuth completed. |
| `revolut_connection.deleted` | Revolut connection removed. |

## Querying Audit Logs

### Via API

```bash
curl "https://api.ralio.co/api/audit-logs?action=payment.created&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `string` | Filter by action type (e.g. `payment.created`). |
| `agent_id` | `string` | Filter by agent. |
| `limit` | `integer` | Maximum entries to return (default: 50, max: 200). |
| `offset` | `integer` | Number of entries to skip (for pagination). |

### Via Console

Go to **Audit Logs** in the main navigation. Filter by agent, action type, or date range.

## Agent Access to Audit Logs

The Ralio agent does **not** have a tool to read audit logs directly. Audit-log review is a human activity — it lives in Console (the **Audit Logs** page) and in the REST API endpoint described above, both of which require an authenticated user session (or a credential binding with the `audits:read` scope, for direct API consumers).

If you want your agent to consider recent activity when reasoning, ask it in chat ("anything unusual in the last 24 hours?") — the agent will use its own tools (`list_transactions`, account reads, etc.) to gather what it knows. For a full compliance review, use Console or the API.

## Related Pages

- [Transactions](/api-reference/transactions) — Payment-specific history
- [GET /api/audit-logs](/api-reference/audit-logs) — API reference
- [Agents](/concepts/agents) — Agents have their own audit log entries


========================================================================
URL: https://docs.ralio.co/authentication/overview
TITLE: Authentication Overview
========================================================================
Ralio supports three authentication paths depending on who or what is making the request.

## Authentication paths

| Path | Used by | How it works |
|------|---------|--------------|
| **Ralio JWT** | Console users (human sign-in) | Email/password sign-in (with optional MFA) in the [Console](/console/getting-started). |
| **OAuth 2.1 `client_credentials` + `private_key_jwt` + DPoP** | Autonomous agents, CI, SDKs, raw-HTTP callers | Owner mints a registration ticket in the console; the agent host runs `ralio auth agent` to generate a P-256 keypair locally and bind it to one target agent. Token requests use a signed `client_assertion`; resource requests use DPoP-bound access tokens. |
| **OAuth 2.1 `authorization_code` + PKCE** | MCP clients (Claude connector, Cursor, Claude Code) | The client auto-discovers the gateway's OAuth metadata and runs an interactive browser flow; a human signs in and approves. It receives a Bearer access token limited to `agents:execute` and pinned to the agent the user selects on the consent screen — not a full account session. See [MCP Authentication](/authentication/mcp). |

## Choosing a path

**Humans use the Console.** Sign in with email + password (and MFA if enrolled). No further configuration.

**Agents use the registration flow.**

1. The agent owner opens the Ralio console → **Settings → Credentials → New credential**, picks the target agent and scope ceiling, and clicks **Generate**. The console returns a one-time `ralio-reg-…` ticket (15 min TTL).
2. The owner sends the ticket to the operator (the person or system running the agent host) through whatever channel they already trust.
3. The operator runs `ralio auth agent --ticket ralio-reg-…` on the agent host. The CLI generates a P-256 keypair locally (stored at `~/.ralio/keys/<jkt>.pem`, mode 0600), submits the public JWK to Ralio, and polls until the owner approves the pending binding in the console.
4. Once approved, the CLI mints access tokens transparently. Subsequent `ralio` commands authenticate without any further interaction.

No shared secret leaves the owner's machine, and the private key never leaves the operator's host.

**MCP clients configure themselves.** Connectors like Claude, Cursor, and Claude Code read the gateway's OAuth discovery document and run the interactive sign-in flow automatically — you just sign in and approve in the browser. See [MCP Authentication](/authentication/mcp).

## The Authorization header

The header carries the access token. The scheme depends on the path:

| Token came from | Header |
|-----------------|--------|
| Console sign-in (human — Ralio JWT) | `Authorization: Bearer <token>` |
| `ralio auth agent` (operator-attested machine path) | `Authorization: DPoP <token>` plus a fresh `DPoP: <proof>` header on every request, per [RFC 9449](https://datatracker.ietf.org/doc/html/rfc9449) |
| MCP client OAuth (interactive `authorization_code` + PKCE) | `Authorization: Bearer <token>` |

The `ralio` CLI selects the scheme automatically based on the credentials it has on disk. Raw HTTP clients calling DPoP-bound resources must sign a fresh proof JWT for each request — the proof binds the access token to one HTTP method + URL + nonce so a captured token can't be replayed without the matching private key.

## Token lifetimes

| Token | Lifetime | Refresh |
|-------|----------|---------|
| Ralio JWT (console session) | 1 hour | Automatic via the stored refresh token |
| Ralio-issued access token (machine) | 30 minutes | Single-use refresh token rotation on `/oauth/token` (RFC 6749 §6) |
| MCP client OAuth token (resource-scoped Ralio JWT) | 30 minutes | None — the connector re-authorizes at access-token expiry (no refresh token is issued) |
| Refresh tokens | 30 days | Re-register if expired |
| DPoP proof | ±60 seconds from `iat` | Mint a fresh proof per request — they're cheap |
| Registration ticket | 15 minutes | Mint a new one |

## Account status

Users must be in `approved` status before they can log in. After registration, accounts start in `pending_approval`. An admin must approve the account via the console or the admin API.

If your login returns a `403` with `"Your account is pending approval."`, contact your Ralio administrator.

## Related pages

- [MCP](/authentication/mcp) — How MCP clients authenticate (interactive OAuth) and the tokens the gateway accepts.
- [CLI](/authentication/cli) — Authenticate the `ralio` CLI as a credential binding.
- [API](/authentication/api) — End-to-end raw-HTTP walkthrough for autonomous callers: register, mint a DPoP-bound access token, sign proofs, refresh.
- [Scopes](/authentication/scopes) — What each scope grants access to.


========================================================================
URL: https://docs.ralio.co/authentication/scopes
TITLE: Scopes
========================================================================
**Scopes** are permissions attached to a credential binding (or to a user session for humans). They determine which tools and endpoints a token issued from the binding can reach.

## Available scopes

| Scope | Description | Grantable on a credential binding? |
|-------|-------------|-----------------------------------|
| `agents:execute` | Execute banking operations: list accounts, check balances, create payments. | ✅ Yes |
| `transactions:read` | List transaction history. | ✅ Yes |
| `audits:read` | Read audit log entries. | ✅ Yes |
| `agents:config` | Manage agents, spend limits, conversations, and credential bindings. | ❌ **No** — credential bindings can't be granted this scope. It's a user-only operation. |

The `agents:config` scope is never grantable on a credential binding — a credential that could rewrite the agent it's pinned to would let one compromised credential lift its own spend limits. It remains a user-only operation.

## Scope-to-tool mapping (MCP gateway)

| Scope | MCP tools unlocked |
|-------|-------------------|
| `agents:execute` | `list_accounts`, `get_account_details`, `get_balance`, `create_payment_intent`, `create_payment`, `get_payment_status` |
| `transactions:read` | `list_transactions` |
| `audits:read` | `list_audit_logs` |

## Scope-to-endpoint mapping (REST API)

| Scope | REST API access |
|-------|----------------|
| `agents:execute` | `/api/griffin-accounts`, `/api/chat`, `/api/chat/stream` |
| `transactions:read` | `GET /api/transactions`, `GET /api/payment-intents` |
| `audits:read` | `GET /api/audit-logs` |
| `agents:config` (humans only) | `GET/POST/PATCH/DELETE /api/agents`, `GET/PUT /api/agents/{id}/spend-limits`, `GET/PUT /api/agents/{id}/tool-settings`, `GET/POST/PATCH/DELETE /api/conversations`, `GET/POST/DELETE /api/credential-bindings`, `GET/POST/DELETE /api/credential-bindings/registration-tickets` |

## Humans get the full set

Humans authenticated via the console or `ralio auth login` carry a Ralio JWT with the full scope set. Scope restrictions only apply to machine bindings.

## Scope ceiling vs requested scope

At registration, the owner picks the binding's **scope ceiling**. Each token minted against the binding can request the full ceiling or a narrower subset (RFC 6749 §6 down-scoping):

```
&scope=agents:execute
```

Requesting a scope outside the ceiling returns `invalid_scope`. Omitting the parameter defaults to the full ceiling.

This lets a single binding back multiple modes — e.g. a worker that mostly reads transactions and occasionally executes can mint two tokens with different scope subsets for blast-radius reasons.

## Target binding (separate from scope)

In addition to scopes, every credential binding is pinned to **one target agent** at issuance. Every token minted from the binding is bound to that agent, and any request naming a different agent is rejected — even with the right scope. To act on a second agent, mint a separate binding.

## Choosing scopes

Follow the principle of least privilege — only grant what the agent actually needs:

| Use case | Recommended scope ceiling |
|----------|-------------------------|
| Read-only reporting agent | `transactions:read`, `audits:read` |
| Payment execution bot | `agents:execute` |
| Balance checker | `agents:execute` |
| Full operational agent | `agents:execute`, `transactions:read`, `audits:read` |

Notice none of these include `agents:config` — it's unavailable on bindings by design.

## Combining scopes

Scopes are additive. A binding with `["agents:execute", "transactions:read"]` has access to every tool and endpoint under either scope.

## Related pages

- [Authentication Overview](/authentication/overview) — How tokens are issued in the first place
- [MCP Tools](/mcp/tools) — Full tool catalog with input schemas
- [Tool Permissions](/concepts/tool-permissions) — Per-agent tool control (orthogonal to scopes)


========================================================================
URL: https://docs.ralio.co/api-reference/overview
TITLE: API Reference
========================================================================
# REST API Reference

The Ralio REST API provides programmatic access to all platform features: agents, conversations, banking, transactions, and more.

## Base URL

```
https://api.ralio.co
```

All endpoints are relative to this base URL.

## Authentication

The API is built for programmatic callers — agents, CI jobs, and server-side integrations. They authenticate as a **credential binding**: OAuth 2.1 `client_credentials` with `private_key_jwt` and DPoP-bound access tokens. There are no shared secrets — each credential is a private key that lives on exactly one host.

The easiest way to connect is an official SDK. It registers the binding, mints and refreshes DPoP-bound tokens, and signs a fresh proof for every request:

- **[Python SDK](/api-reference/sdk)** — `pip install ralio`
- **[TypeScript SDK](/api-reference/sdk-node)** — `npm install @ralioco/sdk`

Every request then carries a DPoP-bound access token:

| Header | Value |
|--------|-------|
| `Authorization` | `DPoP <access_token>` |
| `DPoP` | `<proof>` — a fresh single-use JWT, signed per request |

To call the API from another language, or without an SDK, see [API Authentication (machines)](/authentication/api) for the end-to-end raw-HTTP walkthrough.

## Request Format

- Content type: `application/json`
- Always set `Content-Type: application/json` for POST/PATCH/PUT requests
- Request bodies are JSON objects

## Response Format

All responses are JSON. Successful responses return the resource object or a status object directly:

```json
{
  "id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
  "name": "Payroll Agent",
  ...
}
```

List responses return a JSON array:

```json
[
  { "id": "...", "name": "..." },
  { "id": "...", "name": "..." }
]
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `204` | No content (for DELETE) |
| `400` | Bad request (malformed JSON, missing required fields) |
| `401` | Unauthorised (missing or invalid token) |
| `403` | Forbidden (account not approved, resource not owned by user) |
| `404` | Not found |
| `409` | Conflict (e.g. email already registered) |
| `422` | Unprocessable (invalid field values, business rule violation) |
| `429` | Rate limited |
| `503` | Service unavailable |

## Error Response Format

```json
{
  "detail": "Your account is pending approval."
}
```

All errors include a `detail` field with a human-readable message.

## Pagination

List endpoints accept `limit` and `before` query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | `integer` | `50` | Maximum items to return (max: 200). |
| `before` | `string` (ISO 8601) | — | Return items created before this timestamp. |

## Rate Limits

API requests are rate-limited per user. If you exceed the limit, you receive a `429` response. Implement exponential backoff and retry.

## Endpoints

These are the endpoints that make up the documented programmatic surface (reachable via the [SDK](/api-reference/sdk) or a machine token). Management operations — agents, conversations, spend limits, tool permissions, beneficiaries, and banking-provider credentials — require the human-only `agents:config` scope and are managed through the [Console](/console/getting-started); they are not part of this reference.

| Resource | Endpoints |
|----------|-----------|
| [Chat](/api-reference/chat) | `POST /api/chat`, `POST /api/chat/stream` |
| [Transactions](/api-reference/transactions) | `GET /api/transactions`, `GET /api/payment-intents` |
| [Audit Logs](/api-reference/audit-logs) | `GET /api/audit-logs` |
| [Errors](/api-reference/errors) | Error catalog |

## Machine-Readable Spec

Download the full OpenAPI 3.1 specification:

- **JSON:** [`https://docs.ralio.co/openapi.json`](https://docs.ralio.co/openapi.json)


========================================================================
URL: https://docs.ralio.co/api-reference/chat
TITLE: Chat API
========================================================================
The Chat API is the primary way to interact with agents. You send a natural-language message and the agent reasons about it, calls banking tools as needed, and returns a response.

## Send a Message (Synchronous)

```
POST /api/chat
```

Send a message to an agent and wait for the complete reply.

**Authentication:** Requires the `agents:execute` scope. See [Authentication](/authentication/api).

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | `string` | Yes | The message to send to the agent. |
| `agent_id` | `string` (UUID) | Yes | Which agent should process the message. |
| `conversation_id` | `string` | No | Continue an existing conversation. If omitted, a new one is created. |

```bash
curl -X POST https://api.ralio.co/api/chat \
  -H "Authorization: DPoP $ACCESS_TOKEN" \
  -H "DPoP: $PROOF" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my current balance?",
    "agent_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
    "conversation_id": "conv-my-session-001"
  }'
```

`$ACCESS_TOKEN` is your DPoP-bound access token and `$PROOF` is a fresh DPoP proof signed for this exact method and URL. See [Authentication](/authentication/api) for how to obtain both — or use an [SDK](/api-reference/sdk), which signs every request for you.

**Response `200`:**

```json
{
  "reply": "Your main account (Acme Ltd Current Account, sort code 04-00-04) has a balance of £10,000.00 GBP.",
  "conversation_id": "conv-my-session-001",
  "new_messages": [
    {
      "id": "msg_usr_001",
      "role": "user",
      "content": "What is my current balance?",
      "created_at": "2026-04-04T10:00:00Z"
    },
    {
      "id": "msg_ast_002",
      "role": "assistant",
      "content": "Your main account (Acme Ltd Current Account, sort code 04-00-04) has a balance of £10,000.00 GBP.",
      "created_at": "2026-04-04T10:00:05Z"
    }
  ]
}
```

| Field | Description |
|-------|-------------|
| `reply` | The agent's text response. |
| `conversation_id` | The conversation ID (useful if it was auto-generated). |
| `new_messages` | All new messages created in this exchange (user + assistant + any tool messages). |

**Timeout:** The synchronous endpoint times out after 120 seconds. If the request enters an approval flow, the connection stays open up to 120 seconds waiting for the decision — use SSE (`/api/chat/stream`) for interactive approval flows where the human may take longer to respond.

---

## Send a Message (SSE Streaming)

```
POST /api/chat/stream
```

Stream the agent's reply token-by-token using Server-Sent Events. The connection stays open until the agent finishes.

**Authentication:** Requires the `agents:execute` scope. See [Authentication](/authentication/api).

**Request Body:** Same as `POST /api/chat`.

```bash
curl -X POST https://api.ralio.co/api/chat/stream \
  -H "Authorization: DPoP $ACCESS_TOKEN" \
  -H "DPoP: $PROOF" \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{
    "message": "List my accounts and check the balance on each",
    "agent_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
    "conversation_id": "conv-my-session-001"
  }'
```

**Response (SSE stream):**

```
event: conversation
data: {"conversation_id": "conv-my-session-001"}

event: tool_started
data: {"tool_call_id": "call_abc123", "tool_name": "list_accounts", "arguments": {}}

event: tool_completed
data: {"tool_call_id": "call_abc123", "tool_name": "list_accounts", "result": [{"account_url": "...", "name": "Main Account"}]}

event: text_delta
data: {"text": "You have one account: "}

event: text_delta
data: {"text": "Main Account (sort code 04-00-04)."}

event: reply
data: {"text": "You have one account: Main Account (sort code 04-00-04)."}
```

**Event Types:**

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation` | `{conversation_id}` | Sent at the start of the stream with the conversation ID. |
| `tool_started` | `{tool_call_id, tool_name, arguments}` | Agent began calling a tool. |
| `tool_completed` | `{tool_call_id, tool_name, result}` | Tool returned successfully. |
| `tool_failed` | `{tool_call_id, tool_name, error}` | Tool call failed. |
| `text_delta` | `{text}` | Incremental token of the agent's text reply. |
| `reply` | `{text}` | The agent's complete text reply. |
| `error` | `{message}` | Stream-level error. |

## Notes

- The agent may call multiple tools before responding. With the synchronous endpoint, you wait for the full result. With SSE, you see tool calls as they happen.
- If a tool requires approval (ask permission), the synchronous `/api/chat` request waits up to its 120-second timeout for the decision. If approval is not completed within that window, the HTTP request times out. Use SSE (`/api/chat/stream`) for interactive approval flows where the human may need more time.
- Conversation history is automatically included in the agent's context (last 50 messages).

## Related Pages

- [Python SDK](/api-reference/sdk) — `chat()` from Python without managing tokens
- [Conversations](/concepts/conversations) — How conversation history works
- [Tool Permissions](/concepts/tool-permissions) — Control which tools run automatically


========================================================================
URL: https://docs.ralio.co/api-reference/transactions
TITLE: Transactions API
========================================================================
## List Transactions

```
GET /api/transactions
```

List payment transactions made by all agents owned by the authenticated user.

**Authentication:** Requires the `transactions:read` scope. See [Authentication](/authentication/api).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `agent_id` | `string` | Filter by agent ID. |
| `limit` | `integer` | Maximum results (default: 50). |

```bash
curl "https://api.ralio.co/api/transactions?limit=20" \
  -H "Authorization: DPoP $ACCESS_TOKEN" \
  -H "DPoP: $PROOF"
```

`$ACCESS_TOKEN` is your DPoP-bound access token and `$PROOF` is a fresh DPoP proof signed for this exact method and URL. See [Authentication](/authentication/api) for how to obtain both — or use an [SDK](/api-reference/sdk), which signs every request for you.

**Response `200`:**

```json
[
  {
    "id": "txn_Qrs456Tuv789",
    "amount": "500.00",
    "currency": "GBP",
    "date": "2026-04-04T10:05:00Z",
    "creditor": "Bob Smith",
    "debtor": "Acme Ltd",
    "reference": "Payroll April 2026",
    "status": "submitted",
    "payment_intent_id": "intent_Lmn345Opq678"
  }
]
```

**Transaction Fields:**

| Field | Description |
|-------|-------------|
| `id` | Transaction record ID. |
| `amount` | Payment amount as a decimal string. |
| `currency` | Currency code (e.g. `"GBP"`). |
| `date` | When the transaction was recorded (ISO 8601). |
| `creditor` | Recipient name or account identifier. |
| `debtor` | Sender name or account identifier. |
| `reference` | Payment reference (if provided). |
| `status` | Payment status (e.g. `"submitted"`). |
| `payment_intent_id` | The payment intent that initiated this transaction (if applicable). |

---

## List Payment Intents

```
GET /api/payment-intents
```

List payment intents — the recorded payment requests created before execution. Every payment starts as an intent.

**Authentication:** Requires the `transactions:read` scope. See [Authentication](/authentication/api).

```bash
curl https://api.ralio.co/api/payment-intents \
  -H "Authorization: DPoP $ACCESS_TOKEN" \
  -H "DPoP: $PROOF"
```

**Response `200`:**

```json
[
  {
    "id": "intent_Lmn345Opq678",
    "agent_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
    "agent_name": "Payroll Agent",
    "conversation_id": "conv-my-session-001",
    "creditor_account": "acc_sandbox_recipient_001",
    "creditor_name": "Bob Smith",
    "debtor_account": "acc_sandbox_main_001",
    "debtor_name": "Acme Ltd",
    "amount": "500.00",
    "currency": "GBP",
    "user_request_summary": "User asked to pay £500 to Bob Smith for April 2026 payroll.",
    "created_at": "2026-04-04T10:04:50Z"
  }
]
```

**Payment Intent Fields:**

| Field | Description |
|-------|-------------|
| `id` | Unique intent identifier. |
| `agent_id` | The agent that created the intent. |
| `agent_name` | Agent name at time of creation. |
| `conversation_id` | The conversation that led to this intent. |
| `creditor_account` | Recipient account identifier. |
| `creditor_name` | Recipient name (if available). |
| `debtor_account` | Sender account identifier. |
| `debtor_name` | Sender name (if available). |
| `amount` | Payment amount as a decimal string. |
| `currency` | Currency code. |
| `user_request_summary` | The agent's factual restatement of what the user asked for — recorded for audit and intent verification. |
| `created_at` | When the intent was created. |

## Related Pages

- [Python SDK](/api-reference/sdk) — `transactions.list()` from Python without managing tokens
- [Payment Intents](/concepts/payment-intents) — What payment intents are
- [Audit Logs API](/api-reference/audit-logs) — Full action history
- [Spend Limits](/concepts/spend-limits) — How limits are enforced per transaction


========================================================================
URL: https://docs.ralio.co/api-reference/audit-logs
TITLE: Audit Logs API
========================================================================
## List Audit Logs

```
GET /api/audit-logs
```

Return audit log entries for the authenticated user's agents.

**Authentication:** Requires the `audits:read` scope. See [Authentication](/authentication/api).

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `action` | `string` | Filter by action type (e.g. `payment.created`). |
| `agent_id` | `string` | Filter by agent ID. |
| `limit` | `integer` | Maximum results (default: 50, max: 200). |
| `offset` | `integer` | Number of entries to skip (for pagination). |

```bash
curl "https://api.ralio.co/api/audit-logs?action=payment.created&limit=20" \
  -H "Authorization: DPoP $ACCESS_TOKEN" \
  -H "DPoP: $PROOF"
```

`$ACCESS_TOKEN` is your DPoP-bound access token and `$PROOF` is a fresh DPoP proof signed for this exact method and URL. See [Authentication](/authentication/api) for how to obtain both — or use an [SDK](/api-reference/sdk), which signs every request for you.

**Response `200`:**

```json
[
  {
    "id": "log_Abc123Def456",
    "user_id": "usr_Alice789",
    "action": "payment.created",
    "agent_id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
    "agent_name": "Payroll Agent",
    "metadata": {
      "client_type": "agent",
      "actor": "Payroll Agent",
      "amount": 500.00,
      "currency": "GBP",
      "to_account": "ba_Xyz789",
      "payment_id": "pmt_Qrs456"
    },
    "created_at": "2026-04-04T10:05:00Z"
  }
]
```

## Action Types Reference

| Action | Description |
|--------|-------------|
| `agent.created` | Agent was created. |
| `agent.deleted` | Agent was deleted. |
| `payment.intent_created` | Payment intent was created. |
| `payment.created` | Payment was executed successfully. |
| `spend_limits.updated` | Spend limits were changed. |
| `agent_tool_settings.updated` | Tool settings were updated. |
| `griffin_settings.created` | Griffin API key saved. |
| `griffin_settings.deleted` | Griffin API key removed. |
| `revolut_connection.created` | Revolut OAuth completed. |
| `revolut_connection.deleted` | Revolut connection removed. |

## Related Pages

- [Python SDK](/api-reference/sdk) — The recommended client; connect and authenticate without managing tokens
- [Audit Logs Concept](/concepts/audit-logs) — What gets logged and why
- [Transactions API](/api-reference/transactions) — Payment-specific history


========================================================================
URL: https://docs.ralio.co/api-reference/errors
TITLE: Errors
========================================================================
All Ralio API errors return a JSON body with a `detail` field:

```json
{
  "detail": "Human-readable error message"
}
```

## HTTP Status Codes

### 400 — Bad Request

The request is malformed or missing required fields.

```json
{"detail": "Invalid JSON body"}
```

**Common causes:**
- Malformed JSON in the request body
- Missing required fields (`name`, `scopes`, etc.)
- Invalid field types (string where number expected)

---

### 401 — Unauthorized

The request is missing a valid authentication token.

```json
{"detail": "Not authenticated"}
```

**Common causes:**
- Missing `Authorization` or `DPoP` header
- Expired access token (mint or refresh one via `POST /oauth/token`)
- Invalid or tampered token, or a rejected DPoP proof

---

### 403 — Forbidden

The request is authenticated but not permitted.

```json
{"detail": "Your account is pending approval."}
```

```json
{"detail": "Your account has been suspended. Please contact support."}
```

```json
{"detail": "Agent not found or access denied"}
```

**Common causes:**
- Account not yet approved by admin (`pending_approval` status)
- Account suspended
- Attempting to access another user's resource
- Access token scope insufficient for the requested endpoint

---

### 404 — Not Found

The requested resource does not exist.

```json
{"detail": "Agent not found"}
```

```json
{"detail": "Credential binding not found"}
```

```json
{"detail": "Device not found"}
```

**Common causes:**
- Incorrect ID in the URL path
- Resource belongs to another user (returns 404, not 403, for security)

---

### 409 — Conflict

A resource conflict prevents the operation.

```json
{"detail": "An account with this email already exists."}
```

**Common causes:**
- Attempting to register with an email already in use

---

### 422 — Unprocessable Entity

The request is well-formed but contains invalid business logic.

```json
{"detail": "Invalid scope: 'read:all'. Valid scopes: agents:execute, transactions:read, audits:read, agents:config"}
```

```json
{"detail": "max_transaction must be <= daily_limit"}
```

```json
{"detail": "soft_max_transaction must be < max_transaction"}
```

**Common causes:**
- Invalid scope names in credential-binding creation
- Spend limit ordering violation (`max_transaction > daily_limit`)
- Soft limit >= hard limit
- Zero or negative spend limit amounts
- Invalid tool name in tool settings

---

### 429 — Rate Limited

Too many requests in a short period.

```json
{"detail": "Rate limit exceeded. Please retry after 30 seconds."}
```

Implement exponential backoff. The `Retry-After` header (if present) indicates when to retry.

---

### 503 — Service Unavailable

A dependent service is temporarily unavailable.

```json
{"detail": "Authentication service not configured"}
```

```json
{"detail": "OpenAI API key not configured"}
```

**Common causes:**
- External service (OpenAI, Griffin, Revolut) is unreachable
- Service is starting up or restarting

---

## Authentication Errors

Errors specific to minting tokens and signing DPoP proofs — `invalid_client`, `invalid_grant`, `invalid_scope`, `insufficient_scope`, and DPoP proof rejections — are documented with the flow that produces them. See [API Authentication → Error responses](/authentication/api#error-responses).

## Related Pages

- [API Authentication (machines)](/authentication/api) — Token and DPoP error responses
- [API Reference Overview](/api-reference/overview)


========================================================================
URL: https://docs.ralio.co/mcp/overview
TITLE: MCP Gateway
========================================================================
The **MCP Gateway** lets any MCP-compatible client — Claude Desktop, Cursor, a custom LLM agent — talk to your Ralio agent over the Model Context Protocol.

There is one tool: `chat`. Every interaction goes through the user's Ralio agent, which runs the request through the same agent loop the Console and CLI use: mandates, alignment scoring, spend limits, approval challenges, and escalation all fire. Foreign agents don't drive Ralio's payment rails directly and they don't inspect Ralio's data directly — they talk to *your* agent, which decides what to do and what to reveal.

## Base URL

```
https://mcp.ralio.co
```

## Transport

Streamable HTTP (MCP 2025-03-26 specification). Each request is a JSON-RPC POST to the root (`/`). Server-sent events (SSE) are used for server notifications.

```
POST https://mcp.ralio.co
Content-Type: application/json
Authorization: Bearer <token>

{"jsonrpc": "2.0", "method": "tools/list", "id": 1}
```

## Authentication

The gateway authenticates with the **interactive browser sign-in** token an OAuth-capable MCP client obtains automatically — discovery and sign-in need no manual configuration. See **[MCP Authentication](/authentication/mcp)** for the sign-in flow. Only `agents:execute` is meaningful for MCP: it's the scope that unlocks `chat`.

## The single tool: `chat`

| Tool | Scope | Description |
|------|-------|-------------|
| `chat` | `agents:execute` | Send a message to your Ralio agent. Returns the agent's reply; when human confirmation is needed, the agent's reply includes the Console approval URL inline. |

See the [Tools Reference](/mcp/tools) for the full input schema and example responses.

## Example: Talk to Your Agent

```bash
curl -X POST https://mcp.ralio.co \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "id": 2,
    "params": {
      "name": "chat",
      "arguments": {
        "message": "Pay Alice £100 for office supplies",
        "conversation_id": null,
        "agent_id": null
      }
    }
  }'
```

`agent_id` can be `null` — the interactive connector token is pinned to the agent you chose on the consent screen, so the gateway fills it in. (Passing a different `agent_id` than the token is pinned to is rejected.)

A successful response carries the agent's reply, the conversation id (so the foreign agent can resume context by passing it on the next call), and `new_messages` (the assistant turns and tool calls the agent emitted). When the action needs human confirmation, the agent's `reply` text includes the Console approval URL:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{"type": "text", "text": "{\"conversation_id\": \"...\", \"reply\": \"I've prepared £100 to Alice but it exceeds your approval threshold. Please confirm at https://console.ralio.co/approve/abc123 — I'll continue once you've confirmed.\", \"new_messages\": [...]}"}]
  }
}
```

The approval URL is part of the reply text (and the conversation's appended messages), not a separate structured field. Foreign agents surface `reply` (or render `new_messages`) to their end-user. Once the human resolves the approval in Console, send another `chat` message on the same `conversation_id` ("did it go through?") to learn the outcome.

## Connecting Claude (custom connector)

Claude — both **claude.ai** and **Claude Desktop** — connects to Ralio as a **custom connector** over OAuth 2.1. There's no config file or wrapper to install: in **Settings → Connectors → Add custom connector**, enter the gateway URL:

```
https://mcp.ralio.co
```

Claude discovers the authorization server automatically (RFC 8414 + RFC 9728), registers itself via dynamic client registration (DCR), opens a browser sign-in to your Ralio account, and you approve the `agents:execute` scope on the consent screen — where you also pick, from a dropdown, which agent this connection talks to. The `chat` tool then appears in Claude's tool list. The same URL works for other OAuth-capable MCP clients (e.g. Cursor) and for the Claude Code CLI via `claude mcp add --transport http ralio https://mcp.ralio.co`.

There's nothing to configure: no client ID, no secret, no config file. The token Claude receives is scoped to a single tool (`chat`) on the agent you selected during sign-in.

For **autonomous agents** (no browser, no human at the keyboard), the MCP gateway isn't the right surface — it accepts only the interactive sign-in token. Build against the **REST API** on `api.ralio.co` instead: enroll a credential binding with `ralio auth agent` and call `/api/chat` with a DPoP-bound access token. See [API Authentication](/authentication/api).

### Starter prompts

Once connected, Claude surfaces ready-made prompts that send a first message to your agent. You can also just type your own:

- **List my accounts** — accounts your agent can act on, with balances
- **Pay an invoice** — walk through paying an invoice
- **Check my spend limits** — current spend limits and mandates
- **Review pending approvals** — actions waiting on your confirmation
- **Add a beneficiary** — add a new payment beneficiary

### Usage examples

These are plain-language messages you'd send from a Claude conversation; the agent runs each through the safety layer before doing anything.

**Check accounts and balances** — a pure read, returns immediately:

> **You:** List my accounts and their current balances.
>
> **Ralio agent:** You have two accounts: **Operating** (£48,210.55) and **Payroll** (£12,000.00).

**Pay an invoice** — when the amount is above your auto-approve threshold, the agent does *not* move money; it raises an approval challenge and returns a Console URL:

> **You:** Pay the £2,400 invoice from Acme Ltd from my Operating account.
>
> **Ralio agent:** I've prepared £2,400 to Acme Ltd from Operating, but it's above your auto-approve threshold. Please confirm at https://console.ralio.co/approve/abc123 — I'll continue once you've approved.

Approve in Console, then continue **in the same conversation** to learn the outcome:

> **You:** Done — did it go through?
>
> **Ralio agent:** Confirmed. £2,400 to Acme Ltd has been submitted; reference RP-10482.

Claude relays the reply verbatim — it doesn't retry the payment or assume success, and it never approves on your behalf. The approval URL is part of the reply text, not a hidden action.

**Review pending approvals:**

> **You:** Is anything waiting on my approval right now?
>
> **Ralio agent:** Yes — one item: £2,400 to Acme Ltd (raised 4 minutes ago). Approve or reject at https://console.ralio.co/approve/abc123.

**Add a beneficiary:**

> **You:** Add a new beneficiary — Bright Office Supplies, sort code 04-00-04, account 12345678.
>
> **Ralio agent:** I've added **Bright Office Supplies** to your beneficiaries. New beneficiaries start outside your auto-approve allowlist, so the first payment to them will ask for your confirmation.

## Why one tool?

If foreign agents could call raw banking or read tools directly, they'd bypass the agent loop's safety stack — the whole product Ralio sells. Routing everything through `chat` means every payment-affecting action gets mandate resolution, alignment scoring, spend limits, approval challenges, and escalation, regardless of who initiated it. Reads still work — the agent fetches them as part of answering.

Beneficiary management and the banking reads/writers are still reachable *via* `chat` — the Ralio agent has those tools internally and can call them when asked. They're just no longer **direct MCP tools**. Agent CRUD, spend-limit changes, conversation management, and audit-log reads are not in the agent's toolset and remain Console / CLI only — perimeter changes need a signed-in human.

## Related Pages

- [MCP Authentication](/authentication/mcp) — the interactive OAuth sign-in flow
- [MCP Tools](/mcp/tools) — `chat` input schema and example responses
- [MCP Scopes](/mcp/scopes) — Scope-to-tool mapping


========================================================================
URL: https://docs.ralio.co/mcp/tools
TITLE: MCP Tools Reference
========================================================================
The Ralio MCP Gateway exposes one tool: `chat`. Every interaction with Ralio over MCP goes through the user's agent, which runs the request through the safety stack (mandates, alignment scoring, spend limits, approval challenges, escalation) before doing anything.

If your agent needs context to answer — account balances, recent transactions, beneficiaries — it has its own tools and will fetch what it needs internally. You don't drive those reads from the MCP side. (Audit-log review is not in the agent's toolset — it lives in Console and via the REST API with `audits:read`.)

---

## `chat`

Send a message to your Ralio agent. The agent reasons about the request and replies with what it did. When an action requires human confirmation, the agent raises an approval challenge — the resulting Console approval URL is included inline in the agent's reply text and as a message in the conversation; the foreign agent surfaces it to its end-user.

**Scope:** `agents:execute`

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The message to send to the agent."
    },
    "conversation_id": {
      "type": ["string", "null"],
      "description": "Continue an existing conversation by ID. Pass null to start a new conversation."
    },
    "agent_id": {
      "type": ["string", "null"],
      "description": "Agent to chat with. Pass null — the interactive OAuth token is pinned to the agent selected on the consent screen, and the gateway fills it in."
    }
  },
  "required": ["message", "conversation_id", "agent_id"],
  "additionalProperties": false
}
```

**Example Call:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "id": 1,
  "params": {
    "name": "chat",
    "arguments": {
      "message": "Pay Alice £100 for office supplies",
      "conversation_id": null,
      "agent_id": null
    }
  }
}
```

**Example Response (clean execution):**
```json
{
  "content": [{
    "type": "text",
    "text": "{\"conversation_id\": \"conv_abc\", \"reply\": \"Sent £100 to Alice. Payment ID xyz.\", \"new_messages\": [...]}"
  }]
}
```

**Example Response (approval needed):**
```json
{
  "content": [{
    "type": "text",
    "text": "{\"conversation_id\": \"conv_abc\", \"reply\": \"I've prepared £5,000 to Alice but it exceeds your approval threshold. Please confirm at https://console.ralio.co/approve/abc123 — I'll continue once you've confirmed.\", \"new_messages\": [...]}"
  }]
}
```

The approval URL is part of the agent's reply text and the appended conversation messages — not a structured field. Surface `reply` (or render `new_messages`) to your end-user. Once they resolve the approval in Console, send another `chat` message on the same `conversation_id` ("did it go through?") to learn the outcome.

## Related Pages

- [MCP Authentication](/authentication/mcp) — JWT and credential-binding flows
- [MCP Scopes](/mcp/scopes) — Scope-to-tool mapping
- [MCP Gateway](/mcp/overview) — Overview and transport details


========================================================================
URL: https://docs.ralio.co/mcp/scopes
TITLE: MCP Scopes
========================================================================
The MCP surface is a single tool, `chat`, gated by a single scope, `agents:execute`. Other scopes the wider system uses (`transactions:read`, `audits:read`, `agents:config`) exist for Console, CLI, and direct API use — they don't unlock anything on `mcp.ralio.co`.

## Scope Reference

### `agents:execute`

Unlocks the only MCP tool, `chat`. The `chat` tool routes every interaction through the user's Ralio agent and the safety stack (mandates, alignment scoring, spend limits, approval challenges, escalation).

| Tool | Description |
|------|-------------|
| `chat` | Send a message to your Ralio agent. Returns the agent's reply; when human confirmation is needed, the Console approval URL is included inline in that reply (not as a structured field). |

## Scopes that don't apply to MCP

- **`transactions:read`** — Console / CLI / direct API only. If your foreign agent needs transaction context, ask the agent via `chat`.
- **`audits:read`** — Console / CLI / direct API only. The Ralio agent does **not** have an audit-log read tool, so asking via `chat` won't surface log entries — use Console (the **Audit Logs** page) or `GET /api/audit-logs` directly.
- **`agents:config`** — Console / CLI only, and **never grantable on a credential binding** (it's hidden from the scope picker and rejected at binding creation; see [Scopes](/authentication/scopes)). Foreign agents talk to the agent; they don't reshape its perimeter.

Credential bindings (the `transactions:read` / `audits:read` machine scopes) are a **REST API** credential — they can't authenticate to the MCP gateway at all. The only token the gateway accepts is the interactive sign-in token, which always carries exactly `agents:execute`.

## Recommended Scopes

There's nothing to configure for MCP: the interactive sign-in mints a token scoped to exactly `agents:execute`, which is all `chat` needs. Extra scopes belong to REST API / Console credentials, not the MCP gateway.

## Related Pages

- [MCP Authentication](/authentication/mcp) — the interactive OAuth sign-in flow
- [MCP Tools](/mcp/tools) — `chat` input schema and example responses
- [Scopes (Auth)](/authentication/scopes) — REST API scope-to-endpoint mapping


========================================================================
URL: https://docs.ralio.co/cli/overview
TITLE: CLI Overview
========================================================================
# CLI (`ralio`)

The `ralio` CLI provides interactive and scriptable access to the Ralio platform from your terminal.

## Installation

### Homebrew (macOS arm64 / Linux x86_64)

```bash
brew install ralioco/tap/ralio
```

### Install script

```bash
curl -fsSL https://releases.ralio.co/install.sh | bash
```

This auto-detects your platform (macOS arm64, Linux x64) and installs the `ralio` binary to `/usr/local/bin`.

**Options:**
- `RALIO_INSTALL_DIR` — override install directory (default: `/usr/local/bin`)
- `RALIO_RELEASES_URL` — override releases base URL (default: `https://releases.ralio.co`)

## Authentication

For automation, see [CLI Authentication](/authentication/cli) — register the host as a credential binding with `ralio auth agent`.

### Browser OAuth (humans, recommended)

```bash
ralio auth login
```

Opens your browser to `https://console.ralio.co`. After you log in (with MFA if enrolled) and approve CLI access, a Ralio JWT is saved locally.

### Agent host registration

```bash
ralio auth agent --ticket ralio-reg-<...>
```

On agent hosts (CI, autonomous bots, MCP servers), the owner mints a one-time registration ticket in **Console → Settings → Credentials** and the operator runs this command. The CLI generates a keypair locally and waits for owner approval. Subsequent commands authenticate transparently — the private key never leaves the host. See [Authentication Overview](/authentication/overview).

### Check Status

```bash
ralio auth status
```

Shows the current authentication method and email.

### Logout

```bash
ralio auth logout
```

Clears stored credentials.

## Available Commands

| Command | Description |
|---------|-------------|
| `ralio auth login` | Browser OAuth login (humans) |
| `ralio auth agent --ticket <...>` | Register an agent host against a credential binding |
| `ralio auth status` | Show auth status |
| `ralio auth logout` | Clear credentials |
| `ralio chat [message]` | Start interactive REPL or send single message |
| `ralio chat -c <id>` | Continue a specific conversation |
| `ralio agents list` | List all agents |
| `ralio agents create` | Create a new agent |
| `ralio agents select` | View agent config |
| `ralio transactions` | List recent transactions |
| `ralio audits` | List audit log entries |
| `ralio conversations` | List conversations |

See [CLI Commands](/cli/commands) for the full reference.

## Configuration

The CLI stores credentials in `~/.ralio/`:
- `~/.ralio/credentials.json` — Stored tokens (protected, not readable by other users)

The default API URL is `https://api.ralio.co`. Override it with the `--api-url` flag or the `RALIO_API_URL` environment variable — see [CLI Commands](/cli/commands#global-options).

## Related Pages

- [CLI Commands](/cli/commands) — Full command reference
- [CLI Examples](/cli/examples) — Walkthroughs and scripting


========================================================================
URL: https://docs.ralio.co/cli/commands
TITLE: CLI Commands
========================================================================
# CLI Commands Reference

## `ralio auth`

Authentication management.

### `ralio auth login`

Open a browser window to authenticate via OAuth 2.1 authorization code + PKCE.

```bash
ralio auth login
```

After completing the browser flow, a Ralio JWT is stored in `~/.ralio/credentials.json`. This is the human path — use it on your own workstation.

### `ralio auth agent --ticket <ralio-reg-...>`

Register an agent host against a credential binding. Use this on machines that run autonomously (CI, agent hosts, MCP servers).

```bash
ralio auth agent --ticket ralio-reg-<...>
```

The CLI generates a keypair locally — the private key is written under `~/.ralio/keys/` with `0600` file permissions — and polls until the owner approves the pending binding in the console. Once approved, subsequent `ralio` commands authenticate transparently — the private key never leaves the host, and no shared secret is shipped between machines. See [Authentication Overview](/authentication/overview) for the full registration flow.

### `ralio auth status`

Show current authentication status.

```bash
ralio auth status
# Authenticated as alice@example.com (method: jwt)
# Token expires in: 45 minutes
```

For a registered agent host:

```bash
ralio auth status
# Registered binding: cb_Prod7yX (agent: Payroll Bot, scopes: agents:execute, transactions:read)
# Access token expires in: 22 minutes
```

### `ralio auth logout`

Clear all stored credentials.

```bash
ralio auth logout
# Logged out successfully
```

---

## `ralio chat`

Chat with an agent interactively or send a single message.

### Interactive REPL

```bash
ralio chat
```

Starts an interactive chat session. Type your message and press Enter. Type `/quit` or `Ctrl+C` to exit.

```
ralio> What's my current balance?
Agent: Your main account (Acme Ltd) has a balance of £10,000.00 GBP.

ralio> Send £100 to ba_Xyz789
Agent: I've initiated a payment of £100.00 to account ba_Xyz789. Payment ID: pmt_PqR789.
```

### Single Message

```bash
ralio chat "What is my balance?"
```

Sends a single message and prints the response, then exits.

### Options

| Flag | Description |
|------|-------------|
| `-c <conversation_id>` | Continue a specific conversation. |
| `-a <agent_id>` | Use a specific agent (defaults to the first/selected agent). |
| `--json` | Output raw JSON response. |

```bash
# Continue a specific conversation
ralio chat -c conv-payroll-001 "Send £500 to ba_Xyz789"

# Use a specific agent
ralio chat -a d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90 "What is my balance?"
```

---

## `ralio agents`

Manage agents.

### `ralio agents list`

List all agents.

```bash
ralio agents list
```

```
#1  Payroll Agent        (griffin)   d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90
#2  Expense Tracker      (revolut)   a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### `ralio agents create`

Create a new agent interactively.

```bash
ralio agents create
# Prompts for name, description, banking provider
```

### `ralio agents select [agent_id]`

View or set the default agent.

```bash
ralio agents select d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90
```

---

## `ralio transactions`

List recent payment transactions.

```bash
ralio transactions
```

```
Date                  Agent          Amount    Creditor               Status
2026-04-04 10:05:00   Payroll Agent  £500.00   Bob Smith              completed
2026-04-03 14:30:00   Payroll Agent  £250.00   Jane Doe               completed
```

### Options

| Flag | Description |
|------|-------------|
| `-a <agent_id>` | Filter by agent. |
| `-n <limit>` | Number of results (default: 20). |
| `--json` | Output raw JSON. |

---

## `ralio audits`

List audit log entries.

```bash
ralio audits
```

### Options

| Flag | Description |
|------|-------------|
| `--action <action>` | Filter by action type (e.g. `payment.created`). |
| `-n <limit>` | Number of results (default: 20). |
| `--json` | Output raw JSON. |

---

## `ralio conversations`

List and manage conversations.

```bash
ralio conversations list
ralio conversations delete <conversation_id>
```

---

## Global Options

| Flag | Description |
|------|-------------|
| `--json` | Output raw JSON for scripting. |
| `--api-url <url>` | Override the API URL (also: `RALIO_API_URL` env var). |
| `--help` | Show help for any command. |

## Related Pages

- [CLI Overview](/cli/overview) — Installation and authentication
- [CLI Examples](/cli/examples) — Scripting and automation


========================================================================
URL: https://docs.ralio.co/cli/examples
TITLE: CLI Examples
========================================================================
## Example 1: First Login and Chat

```bash
# Install (pick one)
brew install ralioco/tap/ralio                       # Homebrew
curl -fsSL https://releases.ralio.co/install.sh | bash  # or install script

# Authenticate (opens browser)
ralio auth login

# Check who you're logged in as
ralio auth status

# Start chatting
ralio chat "What bank accounts do I have?"
# Agent: You have one account: Acme Ltd Current Account (sort code 04-00-04, balance £10,000.00 GBP).

# Interactive session
ralio chat
# ralio> What's the balance on my main account?
# ralio> Send £100 to https://api.griffin.com/v0/bank-accounts/ba_Xyz789
# ralio> /quit
```

---

## Example 2: Payment Automation Script

```bash
#!/bin/bash
# pay-supplier.sh — Send a payment to a supplier

AGENT_ID="d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90"
SUPPLIER_ACCOUNT="https://api.griffin.com/v0/bank-accounts/ba_Supplier999"
AMOUNT="500"

# Send payment
REPLY=$(ralio chat -a "$AGENT_ID" "Send £$AMOUNT to $SUPPLIER_ACCOUNT" --json)

# Parse the reply
echo "$REPLY" | python3 -c "import sys, json; print(json.load(sys.stdin)['reply'])"
```

---

## Example 3: JSON Output for Scripting

Use `--json` to get machine-parseable output:

```bash
# List agents as JSON and extract IDs
ralio agents list --json | python3 -c "
import sys, json
agents = json.load(sys.stdin)
for a in agents:
    print(a['id'], a['name'])
"

# Get transactions and sum amounts
ralio transactions --json | python3 -c "
import sys, json
txns = json.load(sys.stdin)
completed = [t for t in txns if t['status'] == 'completed']
total = sum(float(t['amount']) for t in completed)
print(f'Total paid: £{total:.2f} ({len(completed)} transactions)')
"
```

---

## Example 4: Registering an Agent Host

```bash
# On the owner's machine (the console UI is fine too):
# Console → Settings → Credentials → New credential
#   - Target agent: Payroll Bot
#   - Label: ci-payroll-bot
#   - Scope ceiling: agents:execute, transactions:read
# → returns one-time ticket: ralio-reg-7yX4mPqR3wL... (15 min TTL)

# On the agent host (CI runner, agent VM, etc.):
ralio auth agent --ticket ralio-reg-7yX4mPqR3wL...
# Generated keypair → private key at ~/.ralio/keys/ (file mode 0600)
# Waiting for owner approval in the console...
# Approved. Binding cb_Prod7yX registered.

# Subsequent commands authenticate transparently:
ralio transactions --json
```

The private key never leaves the agent host, and the registration ticket can't be reused.

---

## Example 5: Monitor Transactions in a Loop

```bash
#!/bin/bash
# monitor-payments.sh — Check for new payments every minute

LAST_COUNT=0

while true; do
    COUNT=$(ralio transactions --json | python3 -c "import sys, json; print(len(json.load(sys.stdin)))")
    if [ "$COUNT" -gt "$LAST_COUNT" ]; then
        echo "$(date): $COUNT transactions (was $LAST_COUNT)"
        LAST_COUNT=$COUNT
    fi
    sleep 60
done
```

## Related Pages

- [CLI Commands](/cli/commands) — Full command reference
- [CLI Overview](/cli/overview) — Installation and configuration


========================================================================
URL: https://docs.ralio.co/console/getting-started
TITLE: Getting Started with the Console
========================================================================
import { CardGrid, LinkCard } from '@astrojs/starlight/components';

The Ralio console is available at [console.ralio.co](https://console.ralio.co). This guide covers registration, email confirmation, and account approval.

## Step 1: Register

Go to [console.ralio.co/register](https://console.ralio.co/register) and fill in:

- **First name** and **surname**
- **Email address**
- **Company name**
- **Password**

Click **Create account**.

## Step 2: Confirm Your Email

Check your inbox for a confirmation email from Ralio. Click **Confirm email address**.

You'll be redirected to a confirmation page. Your account is now email-confirmed.

## Step 3: Wait for Admin Approval

After confirmation, your account is in `pending_approval` status. Your Ralio administrator must approve your account before you can log in.

## Step 4: Log In

Once approved, go to [console.ralio.co/login](https://console.ralio.co/login) and enter your credentials.

You'll land on the dashboard showing your agents.

## Dashboard Overview

The main navigation includes:

| Section | Description |
|---------|-------------|
| **Dashboard** | Agent grid — create, select, or configure agents |
| **Transactions** | Payment history across all agents |
| **Audit Logs** | Full action history |
| **Settings** | Credentials, sessions, banking integrations |

## Next Steps

<CardGrid>
  <LinkCard title="Create an Agent" href="/console/agents" description="Set up your first payment agent." />
  <LinkCard title="Connect Banking" href="/console/banking-setup" description="Connect Griffin or Revolut." />
</CardGrid>


========================================================================
URL: https://docs.ralio.co/console/agents
TITLE: Managing Agents in the Console
========================================================================
## Creating an Agent

1. Go to **Dashboard** and click **+ New Agent** (or the card with a `+` icon).
2. You'll be shown a template selection or a blank form.
3. Enter a **name** and **description**, or click **Generate with AI** — describe the agent's purpose in plain English and Ralio will suggest a name and detailed purpose statement.
4. Click **Create Agent**.

The agent is created and you're taken to the agent settings page.

## Agent Settings

The agent settings page has several sections:

### Basic Info

Edit the agent's **name** and **description**. Click **Save** after changes.

### Banking Provider

Select **RalioWallet** (default), **Griffin**, or **Revolut** as the banking provider. Griffin and Revolut must be connected first in Settings → Integrations.

### Tool Permissions

Control which banking tools the agent can use:

- **Allow** — Agent runs the tool automatically.
- **Ask** — Agent pauses and sends you an approval request before running.
- **Deny** — Agent cannot use the tool at all.

Toggle each tool between allowed and denied. Tools on "Ask" will send you real-time approval requests in the chat interface.

### Spend Limits

Set **hard limits** and optional **soft limits** per currency:

| Limit | Effect |
|-------|--------|
| Max transaction (hard) | Blocks payments above this amount |
| Daily limit (hard) | Blocks payments that would exceed this daily total |
| Monthly limit (hard) | Blocks payments that would exceed this monthly total |
| Soft limits | Request your approval instead of blocking |

Ordering rule: `max_transaction ≤ daily_limit ≤ monthly_limit`.

### Account Allowlist

Choose which bank accounts this agent can access. By default, an agent can see all accounts on the connected banking provider. Toggle individual accounts on or off — only allowed accounts will be visible to the agent when it runs tools like `list_accounts`, `get_balance`, or `create_payment`.

Each account shows its display name, sort code, and account number. If the banking provider is temporarily unreachable, the page shows the last-known allowed accounts with a warning banner.

### Saving Changes

Changes to each section must be saved individually, or use the **Save All Changes** button that appears when any section has unsaved changes.

## Sharing an Agent

Each agent has a **public card** at `/agents/\{public_card_id\}/public`. This read-only page shows the agent's name and description. Share this URL with stakeholders who need to see the agent's profile without logging in.

## Deleting an Agent

Go to **Agent Settings** and scroll to the bottom. Click **Delete Agent** and confirm. This is irreversible — conversations and audit logs are retained but the agent cannot be recovered.

## Related Pages

- [Console: Chat](/console/chat) — Using the chat interface
- [Agents Concept](/concepts/agents) — How agents work


========================================================================
URL: https://docs.ralio.co/console/chat
TITLE: Chat Interface
========================================================================
The chat interface is at **Dashboard → [Agent Name] → Chat**. It provides real-time communication with your agent.

## Sending Messages

Type your message in the input box and press **Enter** or click **Send**. The agent processes your message and responds. You can see:

- **Your messages** — shown on the right in a distinct colour.
- **Agent replies** — shown on the left, rendered as markdown.
- **Tool call events** — shown inline as the agent executes tools.

## Tool Call Visualisation

As the agent executes tools, you see them appear in the conversation:

- **Running** — spinner icon while the tool executes.
- **Completed** — checkmark with a summary of the result.
- **Failed** — alert icon with the error message.

Click on a completed tool call to expand its full arguments and result.

## Approval Requests

When the agent tries to use a tool set to **Ask** permission, an approval modal appears:

- The modal shows the **tool name**, **arguments**, and a **plain-English explanation**.
- Click **Approve** (this call only), **Approve for conversation** (skip approval for this tool for the rest of the session), or **Deny**.
- If you don't respond within **5 minutes**, the call is automatically denied.

When a payment would exceed a **soft spend limit**, a similar modal shows the amount, the limit exceeded, and the hard limit. Click **Approve** to proceed or **Deny** to cancel.

## Conversation History

Previous conversations appear in the sidebar on the left. Click any conversation to view its history. You can:

- **Rename** a conversation by clicking its title.
- **Continue** a conversation by typing in the input box.
- **Delete** a conversation from the conversation menu.

## Agent Selector

Use the agent dropdown at the top of the chat interface to switch between agents. Switching starts a new conversation with the selected agent.

## Connection Status

A connection indicator (WiFi icon) shows the connection status:
- **Green** — Connected and ready.
- **Grey/disconnected** — Reconnecting. Messages sent while disconnected are queued.

## Related Pages

- [Approvals Concept](/concepts/approvals) — How approval flows work
- [Tool Permissions](/concepts/tool-permissions) — Configuring ask/allow/deny


========================================================================
URL: https://docs.ralio.co/console/banking-setup
TITLE: Banking Setup
========================================================================
Go to **Settings → Integrations** to manage banking providers.

## RalioWallet

RalioWallet is Ralio's built-in payment provider. It's enabled by default for every account — no setup required. New agents are automatically assigned RalioWallet.

---

## Griffin

Griffin is a UK bank-as-a-service provider. You need a Griffin account and API key before connecting.

### Create a Griffin Sandbox Account

1. Go to [griffin.com](https://griffin.com) and create a free sandbox account. No real business required.
2. In the Griffin dashboard, navigate to **API Keys** and create a new key.
3. Copy the key — you'll need it in the next step.

### Connect Griffin to Ralio

1. In the console, go to **Settings → Integrations → Griffin**.
2. Paste your API key in the **Griffin API Key** field.
3. Select **Sandbox** or **Live** environment.
4. Click **Save and Validate**.

Ralio will test the key by making a live API call. If validation succeeds, the connection status changes to **Connected**.

### Assign Griffin to an Agent

After connecting Griffin:
1. Go to **Dashboard → [Agent Name] → Settings**.
2. In the **Banking Provider** section, select **Griffin**.
3. Click **Save**.

The agent can now use Griffin accounts for payments.

---

## Revolut

Revolut Business uses OAuth — you don't enter credentials directly. Instead, you authorise Ralio to access your Revolut account.

### Create a Revolut Business Sandbox Account

1. Go to [sandbox.revolut.codes](https://sandbox.revolut.codes) and create an account.
2. Note: The sandbox uses test money only — no real payments.

### Connect Revolut to Ralio

1. In the console, go to **Settings → Integrations → Revolut**.
2. Click **Connect Revolut**.
3. You're redirected to Revolut's OAuth consent page.
4. Log in to Revolut Business and click **Authorise**.
5. Revolut redirects you back to Ralio. The connection status changes to **Connected**.

Ralio stores your Revolut access tokens encrypted. They're refreshed automatically before expiry.

### Disconnect Revolut

Click **Disconnect** in Settings → Integrations → Revolut. This removes stored tokens.

---

## Checking Connection Status

The Integrations page shows:
- Connection status for each provider (Connected / Not connected)
- For RalioWallet: always connected
- For Griffin: environment (sandbox / live) and when the key was last validated
- For Revolut: business name and token expiry date

## Related Pages

- [Banking Providers Concept](/concepts/banking-providers) — How providers work


========================================================================
URL: https://docs.ralio.co/console/settings
TITLE: Console Settings
========================================================================
Access settings at **Settings** in the main navigation, or directly at [console.ralio.co/settings](https://console.ralio.co/settings).

## Tabs

### Password

Change your account password. You'll need to enter your current password to confirm.

### Sessions

View all devices and sessions that have logged in to your account. For each device:
- Browser and OS
- IP address and approximate location
- Last seen time

Click **Sign out** next to any device to revoke its session. Click **Sign out all other devices** to revoke all sessions except your current one.

### Credentials

Create and manage **credential bindings** — the machine identities autonomous agents, CI jobs, and MCP clients use to call Ralio. There are no shared API keys: each binding is a P-256 keypair generated on the operator's own host and bound to one target agent.

**Creating a credential:**
1. Click **New credential**.
2. Pick the **target agent** and a **scope ceiling** — any of `agents:execute`, `transactions:read`, `audits:read`. (`agents:config` is never grantable on a binding.)
3. Click **Generate**. The console returns a one-time `ralio-reg-…` registration ticket (15-minute TTL).
4. Send the ticket to the operator, who runs `ralio auth agent --ticket …` (or registers via an SDK). Their host generates the keypair locally and submits only the public key; you then **approve** the pending binding here.

**Managing bindings:**
The list shows each binding's label, target agent, granted scopes, status, key fingerprint, and last-used time. Click **Revoke** to disable a binding immediately and permanently.

See [CLI Authentication](/authentication/cli) and [API Authentication](/authentication/api) for the operator's side of the flow.

### Integrations

Connect banking providers. See [Banking Setup](/console/banking-setup) for detailed steps.

## Related Pages

- [Authentication Overview](/authentication/overview) — Registration flow for agent hosts
- [Banking Setup](/console/banking-setup) — Connecting providers
- [Getting Started](/console/getting-started) — Account registration and approval


========================================================================
URL: https://docs.ralio.co/guides/first-payment
TITLE: Make Your First Payment
========================================================================
This guide walks through the complete journey from a fresh account to a payment executed by an agent.

## Prerequisites

- Access to the Ralio console at [console.ralio.co](https://console.ralio.co) or the API

No external banking account is needed — every Ralio account comes with RalioWallet enabled by default.

## Step 1: Register and Get Approved

1. Register at [console.ralio.co/register](https://console.ralio.co/register).
2. Confirm your email via the link in your inbox.
3. Ask your Ralio administrator to approve your account.

## Step 2: Create an Agent

Your account already has RalioWallet enabled — no banking setup required.

1. From the dashboard, click **+ New Agent**.
2. Enter `"Payroll Agent"` as the name and a brief description.
3. Click **Create Agent**.

## Step 3: Configure Guardrails

On the agent settings page:

1. **Tool Permissions:** Leave `create_payment` on **Allow** (default). If you want approval before payments, set it to **Ask**.

2. **Spend Limits:** Click **Add Spend Limit** and enter:
   - Max transaction: `£500`
   - Daily limit: `£5,000`
   - Monthly limit: `£50,000`
   - Click **Save Spend Limits**.

## Step 4: Chat with the Agent

Go to the agent's chat tab. Ask:

```
What bank accounts do I have?
```

The agent will list your RalioWallet accounts.

```
Show me the balance on the main account.
```

The agent will call `get_balance` and return the current balance.

## Step 5: Make a Payment

Ask the agent to initiate a payment:

```
Send £100 to account acc_sandbox_recipient_001
```

If `create_payment` is set to **Ask**, you'll see an approval modal — click **Approve**.

The agent will:
1. Check spend limits (£100 is within the £500 max).
2. Call `create_payment` to execute the payment.
3. Confirm with the payment ID.

## Step 7: Verify the Transaction

Go to **Transactions** in the main navigation. You'll see the payment listed with status `completed`.

Check the **Audit Logs** for the full action trail: `payment.intent_created` → `payment.created`.

## What's Next?

- **Automate payments** via the [REST API](/api-reference/chat) or [CLI](/cli/overview).
- **Connect an AI agent** via the [MCP Gateway](/mcp/overview).
- **Tighten guardrails** by setting more restrictive spend limits or moving `create_payment` to **Ask**.

## Related Pages

- [Agent Guardrails Guide](/guides/agent-guardrails) — Detailed guardrail configuration
- [Building a Payment Agent](/guides/building-agent) — Deploying an autonomous agent


========================================================================
URL: https://docs.ralio.co/guides/building-agent
TITLE: Building a Payment Agent
========================================================================
This guide shows you how to build and deploy an autonomous payment agent that connects to Ralio. There are two surfaces: interactive MCP clients (Claude, Cursor) connect through the **MCP Gateway** via a browser sign-in, while a **headless** agent of your own authenticates to the **REST API** with a credential binding. Both land on the same Ralio agent loop and safety stack.

## Architecture

```
Interactive client (Claude, Cursor)      Headless agent (your code)
   │  OAuth browser sign-in                  │  DPoP-bound token
   ▼                                         ▼
MCP Gateway (mcp.ralio.co)            REST API (api.ralio.co /api/chat)
   └──────────────┬──────────────────────────┘
                  ▼
      Ralio agent loop + safety stack
                  ▼
      RalioWallet / Griffin / Revolut
```

## Step 1: Create a Ralio Agent

In the console, go to **Agents → New agent** and create an agent that represents your payment bot — for example, name it `Payroll Bot` and describe its purpose ("Processes weekly payroll payments to employees"). Ralio drafts a starting configuration from the purpose, which you review and save.

Note the agent's ID from its settings page — you'll pin the credential binding to it in Step 3 and pass it as `agent_id` when calling tools.

## Step 2: Configure Guardrails

Set spend limits appropriate for your use case under **Agents → Payroll Bot → Settings → Spend Limits** — for example, a £1,000 per-transaction hard cap with a £500 soft (approval) threshold, scaling daily and monthly limits accordingly. See [Configuring Agent Guardrails](/guides/agent-guardrails) for the full four-layer setup.

## Step 3: Register the Agent Host

Mint a credential binding scoped to the permissions your agent needs and register the host that will run it. The binding pins to one target agent at issuance and never leaves a shared secret on disk.

In **Console → Settings → Credentials → New credential**, pick:

- **Target agent**: Payroll Bot
- **Label**: e.g. `prod-payroll-bot`
- **Scope ceiling**: `agents:execute`, `transactions:read`

Click **Generate**. The console returns a one-time `ralio-reg-…` ticket (15 min TTL). Send it to the operator (the person or system running the agent host).

On the agent host:

```bash
ralio auth agent --ticket ralio-reg-<...>
```

This generates a keypair locally — the private key is written under `~/.ralio/keys/` with `0600` file permissions — and polls until the owner approves the pending binding in the console. After approval, subsequent `ralio` commands authenticate transparently; the private key never leaves the host.

## Step 4: Connect

### Option A: Claude (custom connector, interactive)

For interactive use, add Ralio as a **custom connector** in Claude (claude.ai or Claude Desktop) under **Settings → Connectors → Add custom connector**:

```
https://mcp.ralio.co
```

Claude discovers the OAuth endpoints automatically, registers itself (DCR), and opens a **browser sign-in** to your Ralio account. This is the only credential the MCP gateway accepts — interactive OAuth, not the machine credential binding from Step 3. After you approve the `agents:execute` scope and pick which agent to connect on the consent screen, the `chat` tool appears in Claude's tool list — the token it receives is scoped to `chat` on the agent you selected, nothing to configure. See [Connecting Claude](/mcp/overview#connecting-claude-custom-connector). For the headless, binding-based path, use Option B.

### Option B: Custom Python Agent (REST API)

A headless agent doesn't use the MCP gateway — that surface accepts only the interactive sign-in token. Instead, authenticate to the **REST API** on `api.ralio.co` with the credential binding from Step 3 and call `/api/chat` directly. Every message still flows through the Ralio agent loop and the full safety stack.

```python
import anthropic
import httpx
from ralio_sdk import RalioAuth  # signs client_assertion + DPoP proofs

AGENT_ID = "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90"
auth = RalioAuth.from_local()  # reads the registered binding from ~/.ralio/

API_CHAT = "https://api.ralio.co/api/chat"

def ralio_chat(message: str, conversation_id: str | None = None) -> dict:
    """Send a message to your Ralio agent via the REST API, with a fresh DPoP proof."""
    response = httpx.post(
        API_CHAT,
        headers=auth.dpop_headers("POST", API_CHAT),
        json={
            "agent_id": AGENT_ID,
            "message": message,
            "conversation_id": conversation_id,
        },
    )
    response.raise_for_status()
    # → {"conversation_id": ..., "reply": ..., "new_messages": [...]}
    return response.json()

# Let Claude orchestrate, exposing the Ralio agent as a single tool.
client = anthropic.Anthropic()

RALIO_TOOL = {
    "name": "ralio_chat",
    "description": (
        "Send an instruction to your Ralio payment agent. It executes "
        "payments and answers questions within your configured guardrails "
        "and returns its reply."
    ),
    "input_schema": {
        "type": "object",
        "properties": {"message": {"type": "string"}},
        "required": ["message"],
    },
}

def run_payment_agent(instruction: str) -> str:
    messages = [{"role": "user", "content": instruction}]
    conversation_id: str | None = None  # resume the same Ralio conversation

    while True:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=4096,
            tools=[RALIO_TOOL],
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return ""

        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = ralio_chat(block.input["message"], conversation_id)
                    conversation_id = result.get("conversation_id")
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result["reply"],
                    })

            messages.append({"role": "assistant", "content": response.content})
            messages.append({"role": "user", "content": tool_results})

# Use the agent
result = run_payment_agent(
    "Check the balance on all accounts. "
    "Then send £100 to account ba_Xyz789 from the main account."
)
print(result)
```

## Step 5: Test with Sandbox

Run your agent against the Griffin sandbox to verify it works:
- Payments go through but no real money moves.
- Spend limits are enforced exactly as in production.
- Audit logs are created for every action.

## Step 6: Move to Production

1. Update your Griffin settings from `sandbox` to `live`.
2. Update spend limits to appropriate production values.
3. Re-register against a production-scoped credential binding if you've been testing with a development one. Revoke the dev binding from **Console → Settings → Credentials**.
4. Enable monitoring via audit logs and the console dashboard.

## Key Considerations

- **Spend limits are your safety net.** Set them conservatively and adjust upward as you gain confidence.
- **Credential bindings are scoped and pinned.** A payment bot only needs `agents:execute` and is pinned to one target agent at issuance. `agents:config` is never grantable on a binding — agent management stays a human operation.
- **Audit everything.** Query `/api/audit-logs` regularly to verify the agent is behaving correctly.
- **Hard limits cannot be bypassed.** Even a compromised host cannot spend more than the configured hard limits, and DPoP binds tokens to the private key so a captured access token alone is useless.

## Related Pages

- [MCP Gateway](/mcp/overview) — MCP protocol overview
- [MCP Tools](/mcp/tools) — All available tools with schemas
- [Spend Limits](/concepts/spend-limits) — How limits are enforced
- [Authentication Overview](/authentication/overview) — Registration flow and scopes


========================================================================
URL: https://docs.ralio.co/guides/agent-guardrails
TITLE: Configuring Agent Guardrails
========================================================================
Guardrails protect you from unexpected agent behaviour. This guide covers four layers: tool permissions, spend limits, account allowlists, and beneficiary allowlists. All four are configured per agent in the **console** under **Agents → [Agent Name] → Settings**.

## Layer 1: Tool Permissions

Tool permissions are an **allow-list**. Only tools you enable may be called; anything else is denied. Two tools (`list_accounts`, `get_payment_status`) are always available regardless of the list.

### Setting tool permissions

In the console, open **Agents → [Agent Name] → Settings → Tools** and tick the tools the agent may use. Untick `create_payment` to remove the agent's ability to move money entirely.

### Permission strategies

| Strategy | Enabled tools | Use Case |
|----------|---------------|----------|
| Read-only reporter | `get_balance`, `list_transactions` | Balance and transaction reporting bots |
| Beneficiary manager | `get_balance`, `list_beneficiaries`, `create_beneficiary`, `delete_beneficiary` | Maintain a payee list without making payments |
| Payment with approval | `get_balance`, `list_transactions`, `create_payment` + *always require approval* | Supervised payment agents |
| Full auto under a cap | `get_balance`, `list_transactions`, `create_payment` + soft and hard spend limits | Autonomous agents with strict caps |

To remove payments from an existing agent, untick `create_payment` and save — the agent's tool gate denies the call from then on.

## Layer 2: Spend Limits

Spend limits are enforced at the payment execution layer — after tool permissions but before any money moves. Each limit applies to a dimension (transaction, daily, monthly) and exists in two flavours: **hard** (denies the payment) and **soft** (pauses for human approval).

The **always require approval** toggle means "confirm every payment" — useful for supervised agents.

Configure these under **Agents → [Agent Name] → Settings → Spend Limits**, entering hard and optional soft amounts per currency.

### Conservative setup (recommended for production)

A good starting point:

| Limit | Hard (block) | Soft (approve) |
|-------|--------------|----------------|
| Per transaction | £100 | £50 |
| Daily total | £1,000 | £800 |
| Monthly total | £10,000 | £8,000 |

With these limits, you'll be asked to approve any single payment over £50, when the daily total would exceed £800, or when the monthly total would exceed £8,000. Payments over £100 (per-transaction), £1,000/day, or £10,000/month are automatically blocked.

### Confirm every payment

For a supervised agent that should never act without your sign-off, enable **always require approval** and set conservative hard caps (e.g. £100 / £500 / £2,000).

### Validation rules

The console enforces this ordering when you save — limits that violate it are rejected:

```
per-transaction ≤ daily ≤ monthly   (within hard limits, and within soft limits)
soft limit < hard limit              (per dimension)
all amounts and counts > 0
```

The same ordering applies to the daily and monthly transaction-count caps.

### Removing limits

Clearing all spend limits is possible but **not recommended for production** — an agent with no limits has every payment approved without checks.

## Layer 3: Account Allowlists

Account allowlists restrict which bank accounts an agent can see and operate on. By default, an agent can access all accounts on the connected banking provider. When you set an allowlist, the agent is limited to only those accounts.

### Restricting to specific accounts

Open **Agents → [Agent Name] → Settings → Allowed accounts**. Every account on the connected provider appears with a checkbox; tick the ones the agent may use (e.g. just the GBP operating account). After saving, the agent's `list_accounts` tool returns only the allowed accounts, and attempts to query balances or pay from other accounts are denied.

### Removing the allowlist

Untick everything (the empty state means *unrestricted*) to give the agent access to all accounts again.

## Layer 4: Beneficiary Allowlists

A **beneficiary allowlist** narrows the recipient side: it restricts which of an agent's registered beneficiaries the agent may actually pay. By default the allowlist is empty, which means *no restriction* — the agent can pay any beneficiary registered to it. Add beneficiaries to clamp it down to a subset.

This is distinct from the [beneficiary registry](/concepts/beneficiaries) itself: the registry decides which recipients *exist* for the agent; the allowlist decides which of those the agent may *pay*.

### Restricting to specific beneficiaries

Open **Agents → [Agent Name] → Settings → Allowed beneficiaries** and tick the beneficiaries the agent is permitted to pay. After saving, `create_payment` denies attempts to pay any other beneficiary, and denials are recorded as `agent.beneficiaries.denied` audit events.

### Removing the allowlist

Untick everything to return to the default (the agent may pay any registered beneficiary).

## Combining All Layers

The safest configuration uses all four layers together:

| Tool Permission | Spend Limit | Account Allowlist | Beneficiary Allowlist | Effect |
|-----------------|-------------|-------------------|------------------------|--------|
| `create_payment` allowed | Always require approval | Specific accounts | Specific beneficiaries | Every payment from allowed accounts to allowed beneficiaries pauses for your approval |
| `create_payment` allowed | Soft + hard thresholds set | Specific accounts | All beneficiaries (default) | Small payments auto-execute, large ones pause, oversized ones are blocked |
| `create_payment` allowed | Hard thresholds only | All accounts (default) | All beneficiaries (default) | Payments auto-execute up to the cap from any account to any registered beneficiary |
| `create_payment` not enabled | (any) | (any) | (any) | No payments possible — call is denied at the tool gate |

## Monitoring Guardrail Enforcement

Blocked and approved payments are visible in the console's audit view, and via the [Audit Logs API](/api-reference/audit-logs) for programmatic callers:

```bash
# See all blocked payments
curl "https://api.ralio.co/api/audit-logs?action=payment.blocked" \
  -H "Authorization: Bearer $TOKEN"

# See all approved tool calls
curl "https://api.ralio.co/api/audit-logs?action=tool.approved" \
  -H "Authorization: Bearer $TOKEN"
```

## Related Pages

- [Tool Permissions Concept](/concepts/tool-permissions) — Allow-list semantics, always-allowed tools, coupled permissions
- [Spend Limits Concept](/concepts/spend-limits) — Hard and soft limits in detail
- [Account Allowlists Concept](/concepts/account-allowlists) — Per-agent bank account restrictions
- [Beneficiary Allowlist Concept](/concepts/beneficiary-allowlist) — Per-agent recipient restrictions
- [Approvals](/concepts/approvals) — Real-time approval flows
- [Building a Payment Agent](/guides/building-agent) — Deploying an agent with guardrails