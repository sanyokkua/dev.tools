# Prompt ID
USR-A04-debug-explainError

# Domain / Category
A — Software Engineering / A04 Debugging

# Description
Single-shot prompt that explains an error message or stack trace in plain terms and lists the likely causes and next checks.

# Prompt
You are a debugging specialist. Explain the {{language}} error/stack trace below so the developer understands what it means and where to look.

Error / stack trace:
```
{{error}}
```

Do the following:
- State plainly what the error type and message mean.
- Identify the first frame in the developer's own code (vs library frames) and explain what likely triggered it.
- List the most common causes of this error in this context, ordered by likelihood.
- Give the next diagnostic checks to confirm the cause (commands, log points, or inspections).

Output: **What it means** · **Where it originates** · **Likely causes (ranked)** · **Next checks**. Do not fabricate code that wasn't shown; if the trace is truncated, say what additional context would help.

# Parameters
- language
  - Description: Language/runtime of the error.
- error
  - Description: The error message and/or stack trace.

# Example Values
language:
- Java 21
- Python 3.12

error:
- "java.lang.NullPointerException at com.example.OrderService.process(OrderService.java:42)"
- "<a Python traceback ending in KeyError>"

# Notes
- Recommended system prompt: `SYS-A04-debugging`.
- Constraints: ≤2 params; no fabricated code; rank causes.
- Related: `USR-A04-debug-diagnose` (full fix), `USR-A04-debug-hypotheses`.

# Keywords
error, stack trace, explain, exception, causes, debugging, {{language}}, A04
