# Ralio CLI Skill

Use the `ralio` CLI for Ralio platform work. Treat CLI output as the source of
truth. Do not invent accounts, balances, beneficiaries, payments, approvals, or
agent ids.

Commands are executed without a shell. Always pass commands as JSON argv arrays.

Useful commands:

```json
["ralio", "--help"]
```

```json
["ralio", "--json", "agents", "list"]
```

```json
["ralio", "--json", "chat", "--print", "--agent", "<agent_id>", "--conversation", "<session_id>", "<message>"]
```

Workflow:

1. If no suitable Ralio agent id is already known in the conversation, list the
   visible agents with `ralio --json agents list`.
2. Choose the most relevant agent from the returned `id`, `name`, provider, and
   config/purpose fields.
3. For account, balance, beneficiary, payment, approval, transaction, or status
   requests, send the user's exact intent to `ralio --json chat --print`.
4. Use the current CLI session id as the `--conversation` value so follow-up
   messages remain in the same platform conversation.
5. If Ralio returns an approval URL, pending approval state, refusal, or error,
   surface that result clearly instead of guessing the final outcome.
6. For read-only requests, preserve the user's requested scope. If the user asks
   for account names only, do not include balances. If the user says not to make
   a payment, do not ask Ralio to make one.
