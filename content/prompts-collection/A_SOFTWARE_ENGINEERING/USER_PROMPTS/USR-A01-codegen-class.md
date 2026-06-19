# Prompt ID
USR-A01-codegen-class

# Domain / Category
A — Software Engineering / A01 Code Generation

# Description
Single-shot prompt that generates a class/type in a given language from a specification of its purpose, attributes, and methods.

# Prompt
You are an experienced {{language}} developer. Generate a {{language}} class (or equivalent type) that satisfies the specification below.

Specification:
```
{{spec}}
```

Rules:
- Apply clear separation of concerns and a single, well-defined responsibility; favor encapsulation and immutability where idiomatic.
- Name attributes and methods to reveal intent; document public members per {{language}} conventions.
- Validate inputs in constructors/setters; handle errors idiomatically.
- Do not invent libraries or APIs. If a detail is missing, choose the safest interpretation and state the assumption.

Output:
1. The class in a fenced ```{{language}} block.
2. A short note on its responsibility and public interface.
3. Any assumptions made.

# Parameters
- language
  - Description: Target programming language (and version if relevant).
- spec
  - Description: Purpose, key attributes, methods, and any interactions or patterns the class must follow.

# Example Values
language:
- Java 21
- TypeScript
- Python 3.12

spec:
- "A ShoppingCart that holds line items, can add/remove items, and computes a total; interacts with a PricingService."
- "An immutable Money value type with currency, supporting add/subtract and equality."

# Notes
- Recommended system prompt: `SYS-A01-code-generation`.
- Constraints: ≤2 parameters; encapsulation and validation by default; no invented dependencies.
- Related: `USR-A01-codegen-function`, `USR-A01-codegen-scaffold`, `USR-A05-test-generate`.

# Keywords
class, type, object, code generation, {{language}}, encapsulation, design, A01
