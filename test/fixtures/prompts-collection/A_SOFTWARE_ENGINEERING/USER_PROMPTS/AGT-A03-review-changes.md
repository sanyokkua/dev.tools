# Prompt ID
AGT-A03-review-changes

# Domain / Category
A — Software Engineering / A03 Code Review

# Description
Agent: review code changes in-repo.

# Prompt
Autonomously review {{language}} changes at {{repo_path}}.

# Parameters
- language
  - Description: Programming language.
- repo_path
  - Description: Path to the repository.

# Example Values
language:
- Go
- TypeScript

repo_path:
- /home/user/myproject

# Notes
- Recommended system prompt: `SYS-A03-code-review`.
- Related: `USR-A03-review-change`; `SKILL-code-review`.

# Keywords
code review, agent, A03
