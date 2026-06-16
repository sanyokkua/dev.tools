import { createUserParametrizedPromptForConversation, Prompt, PromptCategory } from '@/common/prompts/prompts';

const userParametrizedPromptResearchTaskResearch = `
I am about to undertake a development task that involves {{describe_the_task_and_problem}}.
My goal is to {{describe_the_specific_goal_or_question_related_to_the_action}}.
Could you help me define the functional aspects and the fundamental code structure necessary to successfully complete this task?
`.trim();
const userParametrizedPromptResearchTaskBreakdownStructure = `
I am about to break down a development task that involves {{describe_the_task_and_problem}}.
Before proceeding, I need to ensure a comprehensive decomposition into smaller, manageable subtasks.
Based on the functional aspects and components identified during the task research phase, please help me effectively decompose this task.
What key subtasks should be included? Are there any specific functionalities that can be treated as separate subtasks?
`.trim();
const userParametrizedPromptResearchTaskBreakdownOverview = `
I am planning to break down a development task involving {{describe_the_task_and_problem}}.
Could you first provide an overview of the key components and functional aspects identified during the task research phase?
`.trim();
const userParametrizedPromptResearchTaskDependencySpecification = `
For the subtasks identified, can you specify any dependencies among them? Understanding these dependencies will help in planning the execution order.
`.trim();
const userParametrizedPromptResearchFeedbackMechanismSetup = `
Each subtask should be valuable on its own.
How can we set up a feedback mechanism for each subtask to collect user feedback and use it to improve the functionality?
`.trim();
const userParametrizedPromptResearchTaskHierarchyCreation = `
I am in the process of organizing subtasks hierarchically for a development task that involves {{describe_the_task_and_problem}}.
To ensure efficient task completion, I aim to create a clear and effective hierarchy of tasks.
Could you guide me on how to organize these subtasks into a hierarchical structure? Additionally, are there any particular subtasks that are foundational and should be tackled first?
`.trim();
const userParametrizedPromptResearchHierarchyOrganization = `
Based on the subtasks overview provided, how should I organize these subtasks into a hierarchical structure? What criteria should I use to determine the order and grouping of these subtasks?
`.trim();
const userParametrizedPromptResearchDependencySpecification = `
I am in the process of specifying dependencies for a development task that involves {{describe_the_task_and_problem}}.
To ensure a smooth workflow, I need to establish the correct order for completing subtasks based on their dependencies.
Could you guide me on how to determine the order in which to complete these subtasks? Additionally, are there any subtasks that can be parallelized or worked on simultaneously?
`.trim();
const userParametrizedPromptResearchPositiveScenarioIdentification = `
I am developing a new feature {{describe_the_feature}} for {{describe_the_application_or_system}}.
The feature involves {{describe_what_the_feature_does}}.
Please help me identify all possible positive scenarios where this feature enhances {{mention_specific_benefits}}.
`.trim();
const userParametrizedPromptResearchNegativeScenarioIdentification = `
I am implementing a new feature {{describe_the_feature}} for {{describe_the_application_or_system}}.
Before proceeding, I need to identify all potential negative scenarios where this feature might {{describe_potential_failures_or_issues}}.
Could you help outline these scenarios?
`.trim();
const userParametrizedPromptResearchEdgeCaseIdentification = `
I'm about to enhance/add {{describe_the_feature}} to our {{describe_the_application_or_system}}.
Before finalizing, I need to identify all potential edge cases that could affect {{mention_specific_aspects}}.
What unusual input values or scenarios should I consider? How should the application handle unexpected or erroneous data?
`.trim();
const userParametrizedPromptResearchCodeSnippetGeneration = `
I am working on a development subtask {{describe_the_subtask}} and need to explore similar solutions since this is new to me.
Could you help me generate examples of potential solutions in {{specify_programming_language_or_technology}} that align with this task? Additionally, how can I ensure these solutions are relevant to my specific requirements? What common patterns or approaches should I look for, and what steps should I take to customize and integrate these solutions effectively?
`.trim();
const userParametrizedPromptResearchSolutionGeneration = `
I am working on a development subtask {{describe_the_subtask}}.
Since I am unfamiliar with this area, could you generate examples of potential solutions in {{specify_programming_language_or_technology}} that align with this task?
`.trim();
const userParametrizedPromptCodeGenerationNewFunctionCreation = `
Please generate a {{programming_language}} function that {{describe_the_function_purpose}}.
The function should take {{list_input_parameters_and_their_types}} as input and return {{describe_the_expected_return_value_and_type}}.
The method should follow these key steps: {{describe_key_steps_or_algorithmic_details}}.
Ensure that the code aligns with best practices and is suitable for reuse in similar contexts.
`.trim();
const userParametrizedPromptCodeGenerationNewClassCreation = `
Generate a {{programming_language}} class named {{class_service_name}} designed for {{describe_the_purpose_or_functionality}}.
This class should include attributes such as {{list_key_attributes_or_methods}} and methods that {{describe_what_the_methods_should_do}}.
It should interact with {{describe_interaction_with_other_classes_services}} and adhere to {{mention_specific_design_patterns_or_architectural_principles}}.
Ensure the class maintains clear separation of concerns and provides maintainable and readable code.
`.trim();
const userParametrizedPromptCodeGenerationNewModuleCreation = `
As a {{programming_language}} developer, I need assistance creating a new module/project designed for {{describe_the_purpose_and_functionality}}.
This module should integrate {{list_specific_libraries_or_frameworks}}.
Please provide an initial code structure that includes the necessary classes and methods, and adheres to {{mention_any_relevant_design_patterns}}.
Ensure the code is structured to allow for easy maintenance and scalability.
`.trim();
const userParametrizedPromptRefactoringCodeSmellIdentification = `
Please review the following code snippet in {{programming_language}} and identify any code smells or areas that may require refactoring.
This code is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
Let me know if you need any additional context or details.
`.trim();
const userParametrizedPromptRefactoringPlanCreation = `
I have identified the following code smells in my {{programming_language}} code and would like your help creating a refactoring plan to address these issues: {{list_of_code_smells}}.
This code is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
Here's a sample code snippet for reference:
\`\`\`
{{the_code_snippet}}
\`\`\`
Please suggest a step-by-step refactoring plan, including appropriate techniques or design patterns, and any additional considerations for ensuring a safe and effective refactoring process.
`.trim();
const userParametrizedPromptRefactoringSimpleRefactorExecution = `
Refactor the following {{programming_language}} code snippet, which is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
The main goal of the refactoring is to {{refactoring_goal}}.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
Please provide a step-by-step explanation for each refactoring step, including the techniques or design patterns used, and any additional considerations for ensuring a safe and effective refactoring process.
`.trim();
const userParametrizedPromptRefactoringComplexRefactorExecution = `
Refactor the following {{programming_language}} code snippet, which is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
The main refactoring goal is to {{refactoring_goal}}.
Please suggest suitable design pattern(s) to address this goal and provide a step-by-step guide on how to refactor the code using the suggested design pattern(s), including any additional considerations for ensuring a safe and effective refactoring process.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
If you have a specific design pattern in mind, please apply it to the code.
If not, suggest a suitable pattern based on the code's context and requirements.
`.trim();
const userParametrizedPromptTestingUnitTestsCreation = `
Create a set of test cases to ensure the code below is thoroughly tested, considering that the code implements {{code_explanation}}.
Then, generate unit tests for these test cases in {{language_and_testing_framework}}.
Here is the function code:
\`\`\`
{{function_code}}
\`\`\`

Explanation: {{brief_explanation_of_code_functionality}}

Specific Requirements: {{specific_requirements_or_environmental_constraints}}

Please ensure the unit tests cover all possible scenarios and edge cases, and adjust the response precision to ensure focused and deterministic outcomes.
`.trim();
const userParametrizedPromptTestingUnitTestsMaintenance = `
I have updated my function code to include new functionality.
Please update the test cases and unit tests to cover these changes.
Ensure that the updated test cases and unit tests follow the provided code style and conventions.
Explain what was updated and why.
Here is the updated function code and the previous tests:

Updated Function Code:
\`\`\`
{{updated_function_code}}
\`\`\`

Previous Tests:
\`\`\`
{{previous_tests}}
\`\`\`

Please review both the updated function code and the previous tests to ensure comprehensive coverage and alignment with the latest functionality.
Explain the updates made to the test cases and the reasons for these changes.
`.trim();
const userParametrizedPromptTestingTestDataGeneration = `
Generate test data in {{data_format}} to create an array of {{array_length}} objects based on the following model:

\`\`\`
{{model_details_or_code_snippet}}
\`\`\`

Data Format: {{data_format}}

Array Length: {{array_length}}

Model Details: {{object_structure_and_attribute_types}}

Please ensure that the generated test data accurately reflects the structure and types specified in the model details, and is suitable for use in testing the functionality of the system.
`.trim();
const userParametrizedPromptTestingTestDataSourceCodeGeneration = `
Generate a {{programming_language}} code snippet to create an array of {{number}} {{object_type}} objects with test data, adhering to the following model and constraints:

\`\`\`{{programming_language}}
class {{object_type}} {
    {{list_object_attributes_and_types}}
    
    public {{object_type}}({{constructor_parameters}}) {
        {{constructor_initialization}}
    }
}
\`\`\`

Constraints:
- {{list_specific_constraints}}

Please ensure the generated test data is diverse and realistic, considering the specified constraints.
Use domain-specific knowledge to create data that resembles real-world examples in the {{specific_domain_or_industry}}.
`.trim();
const userParametrizedPromptTestingTestDataUpdate = `
Please update the existing test data according to the newly updated data model provided below.
Ensure the test data accurately reflects the changes and explain what was updated and why.

Updated Model Description:

\`\`\`
{{updated_model_description_or_code_snippet}}
\`\`\`

Existing Test Data:

\`\`\`
{{existing_test_data_or_code_snippet}}
\`\`\`

Changes Required:
- {{list_of_changes_required}}

Explanation Requirement:
- Provide detailed explanations for each update made to help understand the modifications and their purposes.

Ensure the updated test data is comprehensive and aligns with the new model specifications.
`.trim();
const userParametrizedPromptDocumentationCodeDocumentationGeneration = `
Please generate {{type_of_comments}} comments for the following code snippet.
This code implements {{brief_description_of_code_functionality}}.
Provide clear and concise language to ensure the comments are easy to understand.

Type of Comments: {{type_of_comments}}
Code Snippet:

\`\`\`
{{code_snippet}}
\`\`\`

Information About the Code and Its Algorithms:
{{detailed_explanation_of_code_and_algorithms}}

Your assistance will help in understanding the code better and ensuring that the generated comments accurately reflect the code's functionality and logic.
`.trim();

const userConversationPromptForCloudWatchLogsInsights = `
You are an expert Amazon CloudWatch Logs Insights Query Assistant. Convert the request below into valid, optimized, copy-paste-ready queries using ONLY the documented query language reproduced in this prompt. You must never invent commands, functions, operators, or field names. If a capability is not listed below, it does not exist — say so and suggest an AWS alternative.

# USER CONTEXT
"""
{{USER_CONTEXT}}
"""

Assume the user has provided enough context. Generate queries directly. Ask ONE targeted question only if a critical anchor is genuinely missing (no field AND no value AND no recognizable AWS log source). Never guess business-specific field names or values — if you must assume something, state it under Assumptions.

---

## AUTHORITATIVE SYNTAX (your only allowed vocabulary)

**Structure:** chain commands with \`|\`; comment with \`#\`; keywords are case-insensitive; field names are case-sensitive.

**Commands (only these exist):**
\`fields\`, \`display\`, \`filter\`, \`filterIndex\`, \`parse\`, \`stats\`, \`sort\`, \`limit\`, \`dedup\`, \`pattern\`, \`anomaly\`, \`diff\`, \`unmask\`, \`unnest\`, \`lookup\`, \`join\`, \`addtotals\`, \`SOURCE\`, plus subqueries via \`filter <field> in ( <subquery> )\`.

**Recommended order:** \`filter → parse → stats → sort → limit\`

**System fields:** \`@message\`, \`@timestamp\`, \`@ingestionTime\`, \`@logStream\`, \`@log\`.

**Filter operators:**
- Comparison: \`=\`, \`!=\`, \`<\`, \`>\`, \`<=\`, \`>=\`
- Boolean: \`and\`, \`or\`, \`not\`
- \`like "str"\` (case-sensitive substring), \`not like "str"\`
- \`like /regex/\`, \`=~ /regex/\` (regex substring), \`/(?i)pat/\` (case-insensitive)
- \`in ["a","b"]\` / \`not in [...]\` (complete-string set membership)
- KEY RULE: only \`field = value\` and \`field IN [...]\` leverage field indexes. \`field like ...\` NEVER uses indexes and scans everything.

**Aggregation functions (inside \`stats\`):** \`count(*)\`, \`count(field)\`, \`sum\`, \`avg\`, \`min\`, \`max\`, \`pct(field, N)\`, \`count_distinct(field)\`.

**Datetime:** \`bin(period)\`, \`datefloor(ts, period)\`, \`dateceil(ts, period)\`, \`fromMillis(field)\`, \`toMillis(field)\`, \`now()\` (epoch SECONDS — use \`now()*1000\` to compare with \`toMillis(@timestamp)\`).
- Period units: \`ms, s, m, h, d, w, mo, q, y\`. Caps: ms=1000, s=60, m=60, h=24. So \`bin(300s)\` is wrongly capped to 60s — use \`bin(5m)\` instead.

**Numeric:** \`abs, ceil, floor, sqrt, log, round, greatest, least, toNumber, toInt, toLong, toDouble, haversine\`.

**String:** \`concat, ltrim, rtrim, trim, strlen, toupper, tolower, substr, replace, regex_replace, strcontains, startsWith, endsWith, isempty, isblank, urlencode, urldecode, base64encode, base64decode, split\`.

**General/Conditional:** \`ispresent(field)\`, \`coalesce(...)\`, \`case(cond,val,...,default)\`, \`if(cond,t,f)\`.

**IP:** \`isValidIp, isValidIpV4, isValidIpV6, isIpInSubnet(field,"cidr"), isIpv4InSubnet, isIpv6InSubnet, ipv4ToNumber, isPrivateIP, isPublicIP, isReservedIP\`.

**JSON:** \`jsonParse(field)\` → map/list; \`jsonStringify(field)\` → string. Nested access via dot notation (\`userIdentity.type\`); bracket for lists (\`users[1].action\`); backticks for special chars (\` \`user.id\` \`, \` \`detail-type\` \`).

**parse modes:** glob (\`parse @message "a=*,b=*" as a,b\` — #wildcards must equal #aliases), regex (\`parse @message /(?<a>.*?)/\`), regex \`multi\`, \`logfmt as lf\` (access \`lf.key\`), \`csv as c1,c2\`, and \`json field=f "k.sub" as alias\`. If a line doesn't match, the event still appears with empty extracted fields.

---

## HARD CONSTRAINTS (from documentation)

- **NEVER output SQL syntax:** no \`SELECT\` (→\`fields\`), \`WHERE\` (→\`filter\`), \`GROUP BY\` (→\`stats ... by\`), \`HAVING\` (→second \`filter\` after \`stats\`), \`UNION\`, \`INSERT/UPDATE/DELETE\`. Read-only system.
- \`dedup\`: only \`limit\` may follow it; \`sort\` BEFORE it (default sort is \`@timestamp desc\`). Null values are NOT treated as duplicates.
- \`display\`: only the LAST \`display\` applies.
- \`limit\`: default cap 10,000 events; max settable 100,000. \`limit any N\` stops scanning early (unordered results).
- \`SOURCE\`: CLI/API ONLY, never in the console.
- **Infrequent Access log class** does NOT support: \`pattern\`, \`diff\`, \`filterIndex\`, \`unmask\`, \`anomaly\`.
- \`join\`: only one per query, equality-only, right-side limited to 50,000 unique keys, no subquery on the right side.
- Subqueries: not nested, not correlated, inner execution capped at 30s.
- JSON: max 200 fields extracted per event.
- Maps/lists are NOT supported in \`dedup\`, \`pattern\`, \`sort\`, \`stats\`.
- Time range is chosen in the console UI — do NOT hard-code timestamps unless the user explicitly wants relative-time filtering via \`now()\`.

---

## OUTPUT FORMAT (always)

**1. Explanation** — 2–3 sentences: what the primary query does and its output.
**2. Primary Query** — one fenced \`\`\`sql block (the single best/most-probable query).
**3. Output Shape** — what columns/rows are returned.
**4. Customization Hints** — bullets: which field names, thresholds, \`bin()\` period, \`limit\`, or log-group scope to adjust.
**5. Assumptions** — bullets (assumed field names / log format / log class), or "None".
**6. Alternatives** — 2–4 genuinely useful variations; each with a short title, a \`\`\`sql block, and 1–2 sentences on what differs and when to use it.
**7. Notes** — only if a documented constraint or cost/perf risk applies (large time range, "all log groups", missing \`limit\` near the 10k cap, IA-class command limits, indexed-field \`like\`, alarming impossible → Metric Filters / Scheduled Queries, real-time → Live Tail, joins/long-term → Athena, massive search → OpenSearch).

---

## FEW-SHOT EXAMPLES (follow this style and grounding exactly)

### Example 1 — specific value lookup (exact match + index awareness)
USER CONTEXT: "Find the barcode ABC-123 stored in field barcodeId, deduplicated."

**1. Explanation** Returns log events whose \`barcodeId\` exactly equals \`ABC-123\`, keeping only the most recent event per unique \`barcodeId\`.
**2. Primary Query**
\`\`\`sql
fields @timestamp, @message, barcodeId
| filter barcodeId = "ABC-123"
| sort @timestamp desc
| dedup barcodeId
\`\`\`
**3. Output Shape** One row (the most recent event for that barcode) with \`@timestamp\`, \`@message\`, \`barcodeId\`.
**4. Customization Hints**
- Replace \`"ABC-123"\` with another barcode value.
- Remove \`dedup barcodeId\` to see all matching events.
- Add \`| limit 20\` if you expect many events before dedup.
**5. Assumptions** None — \`barcodeId\` and the value were provided.
**6. Alternatives**
- *Index-optimized lookup:* if \`barcodeId\` is a field index on Standard-class groups.
\`\`\`sql
fields @timestamp, @message, barcodeId
| filterIndex barcodeId = "ABC-123"
| sort @timestamp desc
\`\`\`
Scans far less data; not available on Infrequent Access class.
- *Multiple barcodes at once:*
\`\`\`sql
fields @timestamp, barcodeId
| filter barcodeId in ["ABC-123", "ABC-124"]
| sort @timestamp desc
\`\`\`
Uses set membership (\`IN\` is index-eligible) for several exact values.
**7. Notes** \`=\` and \`IN\` benefit from field indexes; \`like\` would not. \`dedup\` may only be followed by \`limit\`.

---

### Example 2 — Lambda latency percentiles (known source schema)
USER CONTEXT: "p50/p95/p99 Lambda duration per hour."

**1. Explanation** Computes p50, p95, and p99 of \`@duration\` (ms) from Lambda REPORT lines, bucketed hourly.
**2. Primary Query**
\`\`\`sql
filter @type = "REPORT"
| stats pct(@duration, 50) as p50_ms,
        pct(@duration, 95) as p95_ms,
        pct(@duration, 99) as p99_ms
        by bin(1h)
| sort @timestamp desc
\`\`\`
**3. Output Shape** One row per hour with \`p50_ms\`, \`p95_ms\`, \`p99_ms\`.
**4. Customization Hints**
- Change \`bin(1h)\` → \`bin(5m)\` for finer granularity.
- Add percentiles like \`pct(@duration, 99.9)\`.
**5. Assumptions** Log group contains Lambda logs (\`@type\`, \`@duration\` auto-fields).
**6. Alternatives**
- *Avg/max/min latency instead:*
\`\`\`sql
filter @type = "REPORT"
| stats avg(@duration), max(@duration), min(@duration) by bin(5m)
\`\`\`
Use when you want central tendency and extremes rather than percentiles.
**7. Notes** None.

---

### Example 3 — unstructured logs requiring parse
USER CONTEXT: "Average and p99 latency by method, logs look like: user=bob, method:GET, latency := 231"

**1. Explanation** Extracts \`userId\`, \`method\`, and \`latency\` from unstructured \`@message\`, then computes average and p99 latency per \`method\`.
**2. Primary Query**
\`\`\`sql
filter @message like /latency/
| parse @message "user=*, method:*, latency := *" as userId, method, latency
| stats avg(latency) as avg_latency, pct(latency, 99) as p99_latency by method
| sort avg_latency desc
\`\`\`
**3. Output Shape** One row per \`method\` with \`avg_latency\` and \`p99_latency\`.
**4. Customization Hints**
- Adjust the glob pattern to match your exact line format (wildcard count must equal alias count).
- Drop the \`filter\` if every line contains latency.
**5. Assumptions** Logs are unstructured text in the shown format; the three values appear in this order.
**6. Alternatives**
- *Regex parse (more precise):*
\`\`\`sql
parse @message /user=(?<userId>.*?), method:(?<method>.*?), latency := (?<latency>.*?)/
| stats avg(latency) by method
\`\`\`
Use named capture groups when delimiters are tricky or values may contain commas.
**7. Notes** Events not matching the pattern still appear, but with empty extracted fields.

---

### Example 4 — impossible request → state limit + alternative
USER CONTEXT: "Set an alarm when errors exceed 100 per minute in this query."

**1. Explanation** CloudWatch Logs Insights cannot alarm directly on a query. I'll give you the counting query and the supported alerting path.
**2. Primary Query**
\`\`\`sql
filter @message like /(?i)error/
| stats count(*) as errorCount by bin(1m)
| sort @timestamp desc
\`\`\`
**3. Output Shape** One row per minute with \`errorCount\`.
**4. Customization Hints**
- Replace the regex with your exact error field/value.
- Change \`bin(1m)\` to your evaluation window.
**5. Assumptions** "Error" is matched in \`@message\` case-insensitively.
**6. Alternatives** None meaningful for the alarm itself.
**7. Notes** You cannot alarm on an Insights query directly. Use a **CloudWatch Metric Filter** on the log group to emit a metric, then create an **Alarm**; or run a **Scheduled Query → Custom Metric → Alarm**.

---

## FOLLOW-UP TURNS
Treat later messages as refinements ("also exclude X", "group by Y", "make it faster") or new requests. Carry forward established context (source, fields, intent); re-ask only if a refinement introduces a new unknown. On refinement, output the full updated query and one line on what changed, keeping the same format.

---

Now generate queries for the USER CONTEXT above, grounded strictly in the syntax and constraints listed here, following the output format and the style of the examples.
`.trim();

export const userConversationPrompts: Prompt[] = [
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskResearch',
        userParametrizedPromptResearchTaskResearch,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Research the task and problem to define functional aspects and code structure.',
        'task',
        'research',
        'development',
        'problem analysis',
        'code structure',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskBreakdownStructure',
        userParametrizedPromptResearchTaskBreakdownStructure,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Break down the development task into smaller, manageable subtasks based on identified functional aspects.',
        'task',
        'breakdown',
        'decomposition',
        'subtasks',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskBreakdownOverview',
        userParametrizedPromptResearchTaskBreakdownOverview,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Provide an overview of key components and functional aspects identified during task research.',
        'overview',
        'task',
        'research',
        'components',
        'functional aspects',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskDependencySpecification',
        userParametrizedPromptResearchTaskDependencySpecification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Specify dependencies among subtasks to determine execution order.',
        'dependencies',
        'task',
        'planning',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchFeedbackMechanismSetup',
        userParametrizedPromptResearchFeedbackMechanismSetup,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Set up feedback mechanisms for each subtask to improve functionality.',
        'feedback',
        'mechanism',
        'subtask',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskHierarchyCreation',
        userParametrizedPromptResearchTaskHierarchyCreation,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Organize subtasks hierarchically for efficient task completion.',
        'hierarchy',
        'task',
        'organization',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchHierarchyOrganization',
        userParametrizedPromptResearchHierarchyOrganization,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Guide on organizing subtasks into a hierarchical structure with grouping criteria.',
        'organization',
        'hierarchy',
        'subtasks',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchDependencySpecification',
        userParametrizedPromptResearchDependencySpecification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Specify dependencies and determine execution order of subtasks.',
        'dependencies',
        'task',
        'planning',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchPositiveScenarioIdentification',
        userParametrizedPromptResearchPositiveScenarioIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify positive scenarios where the feature enhances specific benefits.',
        'positive',
        'scenario',
        'feature',
        'benefits',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchNegativeScenarioIdentification',
        userParametrizedPromptResearchNegativeScenarioIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify negative scenarios where the feature may fail or cause issues.',
        'negative',
        'scenario',
        'feature',
        'failure',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchEdgeCaseIdentification',
        userParametrizedPromptResearchEdgeCaseIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify edge cases that may affect specific aspects of the feature.',
        'edge',
        'case',
        'unusual',
        'input',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchCodeSnippetGeneration',
        userParametrizedPromptResearchCodeSnippetGeneration,
        PromptCategory.CODE_GENERATION,
        'Generate code examples for a development subtask and guide customization.',
        'code',
        'snippet',
        'generation',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSolutionGeneration',
        userParametrizedPromptResearchSolutionGeneration,
        PromptCategory.CODE_GENERATION,
        'Generate potential solutions for a development subtask in a specified language.',
        'solution',
        'generation',
        'development',
        'code',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewFunctionCreation',
        userParametrizedPromptCodeGenerationNewFunctionCreation,
        PromptCategory.CODE_GENERATION,
        'Generate a new function/method in a specified programming language.',
        'function',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewClassCreation',
        userParametrizedPromptCodeGenerationNewClassCreation,
        PromptCategory.CODE_GENERATION,
        'Generate a new class in a specified programming language with required attributes and methods.',
        'class',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewModuleCreation',
        userParametrizedPromptCodeGenerationNewModuleCreation,
        PromptCategory.CODE_GENERATION,
        'Create a new module/project with an initial structure and libraries.',
        'module',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringCodeSmellIdentification',
        userParametrizedPromptRefactoringCodeSmellIdentification,
        PromptCategory.CODE_REFACTORING,
        'Identify code smells in a provided code snippet.',
        'code',
        'smell',
        'refactoring',
        'analysis',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringPlanCreation',
        userParametrizedPromptRefactoringPlanCreation,
        PromptCategory.CODE_REFACTORING,
        'Create a step-by-step plan for refactoring code with identified smells.',
        'refactoring',
        'plan',
        'development',
        'strategy',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringSimpleRefactorExecution',
        userParametrizedPromptRefactoringSimpleRefactorExecution,
        PromptCategory.CODE_REFACTORING,
        'Execute a simple refactoring with step-by-step explanation.',
        'simple',
        'refactoring',
        'execution',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringComplexRefactorExecution',
        userParametrizedPromptRefactoringComplexRefactorExecution,
        PromptCategory.CODE_REFACTORING,
        'Execute a complex refactoring using design patterns.',
        'complex',
        'refactoring',
        'design pattern',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingUnitTestsCreation',
        userParametrizedPromptTestingUnitTestsCreation,
        PromptCategory.TEST_GENERATION,
        'Generate unit tests for a provided function.',
        'unit',
        'test',
        'generation',
        'coverage',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingUnitTestsMaintenance',
        userParametrizedPromptTestingUnitTestsMaintenance,
        PromptCategory.TEST_GENERATION,
        'Update existing unit tests to reflect new functionality.',
        'update',
        'test',
        'maintenance',
        'coverage',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataGeneration',
        userParametrizedPromptTestingTestDataGeneration,
        PromptCategory.TEST_GENERATION,
        'Generate test data in a specified format and length.',
        'test',
        'data',
        'generation',
        'format',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataSourceCodeGeneration',
        userParametrizedPromptTestingTestDataSourceCodeGeneration,
        PromptCategory.TEST_GENERATION,
        'Generate code to create test data objects.',
        'source',
        'code',
        'test data',
        'generation',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataUpdate',
        userParametrizedPromptTestingTestDataUpdate,
        PromptCategory.TEST_GENERATION,
        'Update existing test data based on a new model.',
        'update',
        'test data',
        'model',
        'migration',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptDocumentationCodeDocumentationGeneration',
        userParametrizedPromptDocumentationCodeDocumentationGeneration,
        PromptCategory.CODE_DOCUMENTATION,
        'Generate documentation for a code snippet.',
        'documentation',
        'code',
        'generation',
        'comments',
    ),
    createUserParametrizedPromptForConversation(
        'userConversationPromptForCloudWatchLogsInsights',
        userConversationPromptForCloudWatchLogsInsights,
        PromptCategory.MONITORING_SETUP,
        'Expert CloudWatch Logs Insights Query Assistant that converts natural language requests into valid, optimized queries using only documented CloudWatch Logs Insights syntax with follow-up turn support',
        'cloudwatch',
        'aws',
        'logs',
        'monitoring',
        'query',
        'insights',
    ),
];
