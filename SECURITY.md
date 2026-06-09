# Security Policy

## Reporting Vulnerabilities

Please do not report security issues through public GitHub issues or pull
requests.

Report vulnerabilities privately by emailing `security@ralio.co`, or by
contacting a Ralio maintainer directly if you already have an established
private channel.

Include enough detail to reproduce the issue, including affected files,
commands, environment assumptions, and any relevant logs with secrets removed.

## Scope

This repository is a reference implementation for a client agent that connects
to a Ralio Agent through the Ralio CLI. Security reports are most useful when
they relate to:

- Command execution safety.
- Secret or environment variable exposure.
- Unsafe handling of CLI output.
- Authentication, session, or agent-to-agent interaction guidance.

Please do not include live credentials, auth tickets, personal data, or private
account information in reports.
