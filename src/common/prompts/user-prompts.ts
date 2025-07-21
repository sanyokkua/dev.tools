import { createUserParametrizedPrompt, joinPromptLines, Prompt, PromptCategory } from '@/common/prompts/prompts';

type RawUserPrompt = {
    mainTask: string;
    userInputParameters: string[];
    instructions: string[];
    constraints: string[];
    errorHandling: string[];
    output: string[];
};

function makeUserPromptForTextTransformation(raw: RawUserPrompt): string {
    const instructions: string = joinPromptLines(raw.instructions);
    const constraints: string = joinPromptLines(raw.constraints);
    const errorHandling: string = joinPromptLines(raw.errorHandling);
    const output: string = joinPromptLines(raw.output);
    const userParameters: string = joinPromptLines(raw.userInputParameters);
    return `
Your role: "Text Transformation Engine, expert linguist and editor"

Your capabilities:
  — Translation, proofreading, rewriting, style adjustments, formatting for different contexts
  — Deep understanding of tone registers (formal, casual, friendly, professional)
  — Familiarity with email, chat, document, article, social media, and wiki/Confluence conventions

User Input:
${userParameters}
 
You need to perform the following task:
  — ${raw.mainTask}

instructions:
  — Preserve original meaning, tone, and structure unless the transformation explicitly requires a structural change
  — Retain all original content (words, data, names) except for necessary corrections or reformulations
  — Never add headings, commentary, labels, or meta‑text (e.g., “Here is the result…”)
${instructions}

constraints:
  — Perform only the action specified; do not introduce new information or omit existing details
  — Do not output any commentary on process, tool usage, or AI provenance
  — Maintain original line breaks and paragraph boundaries unless format conversion is required
${constraints}

errorHandling:
  — If prompt is empty or unparseable, return an empty string
  — Sanitize any sensitive data (credentials, PII) without altering non‑sensitive content
${errorHandling}

output:
  — Return ONLY the transformed text in plain text (or Markdown for documentation), with no additional labels or annotations
${output}
`.trim();
}

const userParametrizedPromptForTranslatingText = makeUserPromptForTextTransformation({
    userInputParameters: [
        'UserText: ```{{user_text}}```',
        'SourceLanguage: ```{{input_language}}```',
        'TargetLanguage: ```{{output_language}}```',
    ],
    mainTask:
        'Translate the UserText from SourceLanguage to TargetLanguage while preserving style, tone, and formatting',
    instructions: [
        'Analyze cultural and linguistic context of the SourceLanguage text',
        'Choose equivalents in TargetLanguage that preserve idioms, humor, and register',
    ],
    constraints: [
        'Expect explicit source/target languages',
        'Preserve formatting, line breaks, special characters, numerals, and proper nouns',
        'Do not localize brand names or technical terms without user instruction',
    ],
    errorHandling: ['If UserText, SourceLanguage and TargetLanguage are empty or unparseable, return an empty string'],
    output: ['ONLY the translated text in the same structural format as the input'],
});
const userParametrizedPromptForProofreadingText = makeUserPromptForTextTransformation({
    userInputParameters: [
        'UserText: ```{{user_text}}```',
        'StyleGuide: ```{{style_guide}}```   # e.g., AP, Chicago, MLA (optional)',
    ],
    mainTask: 'Proofread the UserText for grammar, punctuation, and clarity without altering meaning',
    instructions: [
        'Correct grammar, spelling, punctuation, and capitalization',
        'Preserve original wording unless clearly inappropriate or incorrect',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: [
        'Do not change vocabulary, tone, or phrasing beyond error correction',
        'Follow the specified StyleGuide if provided',
    ],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the proofread text'],
});
const userParametrizedPromptForRewritingText = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Rewrite the UserText for improved clarity, flow, and readability while keeping intent',
    instructions: [
        'Rephrase sentences for clarity, flow, and readability',
        'Use synonyms and restructure where it enhances understanding',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: ['Retain all original facts, data, and intent', 'Do not introduce new concepts or remove key details'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the rewritten text'],
});
const userParametrizedPromptForRewritingTextToFormalTone = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Convert the UserText to a formal, professional tone suitable for reports or business communications',
    instructions: [
        'Eliminate contractions; use precise, professional vocabulary',
        'Maintain the same overall structure and line breaks',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: [
        'Do not convert to email or another format unless input already is in this format',
        'Avoid colloquialisms and informal expressions',
    ],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the formalized text'],
});
const userParametrizedPromptForRewritingTextToSemiFormalTone = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Convert the UserText into a clear, semi-formal tone suitable for everyday professional communication',
    instructions: [
        'Use natural, polite language that sounds professional but conversational',
        'Use contractions where appropriate for a more approachable tone',
        'Keep the same structure and line breaks as the original',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: [
        'Don’t switch formats (e.g., to email or bullet points) unless the input is already in that format',
        'Avoid slang or overly casual language, but also avoid overly stiff or formal phrasing',
    ],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the formalized text'],
});
const userParametrizedPromptForRewritingTextToCasualTone = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Convert the UserText to a casual, conversational style for everyday communication',
    instructions: [
        'Use contractions and everyday expressions',
        'Keep sentences shorter and more conversational',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: [
        'Retain original structure; do not assume an email or article format',
        'Avoid overly slangy or obscure terms',
    ],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the casualized text'],
});
const userParametrizedPromptForRewritingTextToFriendlyTone = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Transform the UserText into a friendly, approachable tone with inclusive language',
    instructions: [
        'Add warm, positive phrasing and inclusive language',
        'You may use emojis to enhance friendliness',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: ['Preserve professional context if present', 'Do not become overly informal or off‑topic'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the friendly text'],
});

const userPromptForPoliteCodeReviewComment = makeUserPromptForTextTransformation({
    userInputParameters: ['TextToFormat: ```{{text_to_format}}```'],
    mainTask:
        'Transform the TextToFormat into a polite and constructive code review comment that encourages collaboration and respectful discussion',
    instructions: [
        'Correct any spelling or grammar mistakes',
        'Use positive, supportive language that encourages improvement',
        'Phrase suggestions and observations using courteous, indirect expressions',
        'Maintain a professional and respectful tone throughout',
        'Avoid blunt or overly direct criticism',
        'Do not add extra commentary, explanations, or labels outside the revised comment',
    ],
    constraints: [
        'Keep the original intention and technical context intact',
        'Avoid adding or removing content unless it improves clarity or tone',
    ],
    errorHandling: [
        'If TextToFormat is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without affecting the rest of the content',
    ],
    output: ['ONLY the rewritten, polite review comment'],
});
const userPromptForImprovingPullRequestDescription = makeUserPromptForTextTransformation({
    userInputParameters: ['PullRequestDescription: ```{{pull_request_description_to_format}}```'],
    mainTask:
        'Review and refine the PullRequestDescription to enhance clarity, professionalism, and readability in a semi-formal tone suitable for a professional setting',
    instructions: [
        'Correct any spelling or grammar errors',
        'Rephrase sentences to improve clarity and flow',
        'Ensure the message remains concise and focused',
        'Use semi-formal, professional language throughout',
        'Do not include any extra commentary, explanations, or labels',
    ],
    constraints: [
        'Keep the original intent and technical content intact',
        'Avoid adding or omitting information unless necessary for clarity or tone',
    ],
    errorHandling: [
        'If PullRequestDescription is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without affecting the rest of the content',
    ],
    output: ['ONLY the revised Pull Request description in plain text'],
});
const userPromptForInstructionalWikiStyleWithFormat = makeUserPromptForTextTransformation({
    userInputParameters: [
        'TextToFormat: ```{{text_to_format}}```',
        'OutputFormat (optional): {{output_format}} // e.g., "markdown", "plaintext", "html"',
    ],
    mainTask:
        'Transform the TextToFormat into clear and concise instructional content suitable for a Wiki or documentation page',
    instructions: [
        'Use a neutral, instructive tone throughout the text',
        'Prefer passive voice and generic phrasing (e.g., "should be done" instead of "you need to")',
        'Avoid personal pronouns and direct address',
        'Use simple, clear vocabulary that is easy to follow',
        'Maintain clarity and professionalism suitable for internal or public-facing documentation',
        'Do not add extra commentary, introductions, or closing statements',
    ],
    constraints: [
        'Preserve the technical meaning and instructional intent',
        'Avoid adding or omitting steps unless necessary for clarity or consistency',
    ],
    errorHandling: [
        'If TextToFormat is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without affecting the rest of the content',
    ],
    output: [
        'Return ONLY the transformed instructional content in the specified OutputFormat',
        'If OutputFormat is not specified, return the output in Markdown by default',
    ],
});
const userPromptForExplainingIntendedMeaning = makeUserPromptForTextTransformation({
    userInputParameters: ['ConfusingText: ```{{confusing_text}}```'],
    mainTask:
        'Explain the intended meaning of the ConfusingText in a clear and simple way, focusing on what the author likely meant',
    instructions: [
        'Use straightforward and accessible language',
        'Explain implied meanings, idioms, or nuanced phrases if present',
        'If the tone is important for understanding, briefly note it (e.g., sarcastic, formal, casual)',
        'Avoid rephrasing or rewriting the original text — focus on explanation only',
        'Do not include any personal opinion or critique of the original text',
    ],
    constraints: [
        'Preserve the context and intent as much as possible',
        'Do not assume facts that aren’t present in the original text',
        'Avoid speculative or hypothetical interpretations unless clearly signaled (e.g., "might mean")',
    ],
    errorHandling: [
        'If ConfusingText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without affecting the rest of the content',
    ],
    output: [
        'Return ONLY the explanation of the intended meaning in plain text',
        'Keep the explanation clear, concise, and helpful for someone unfamiliar with the original phrasing',
    ],
});

const userParametrizedPromptForTransformingTextToEmailFormat = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Format the UserText into a professional email with subject, greeting, body, and closing',
    instructions: [
        'Structure into Subject, Greeting, Body, Closing, and Signature',
        'Use clear paragraph breaks and optional bullet points',
        'Never add headings, commentary, labels, or meta‑text beyond email components',
    ],
    constraints: ['Maintain the original tone unless instructed otherwise'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the formatted email in plain text'],
});
const userParametrizedPromptForTransformingTextToChatFormat = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Format the UserText into concise chat messages suitable for messaging apps',
    instructions: [
        'Break into short, chat‑style lines or paragraphs',
        'Use informal greetings and emojis as appropriate',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: ['Remove formal salutations and closings if present', 'Preserve the core message and intent'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the chat‑formatted text'],
});
const userParametrizedPromptForTransformingTextToDocumentFormat = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Format the UserText into a structured plain-text document layout for Word or PDF',
    instructions: [
        'Add plain‑text headings, subheadings, and dividers (e.g., “=== Section ===”)',
        'Use numbered lists and bullet points for clarity',
        'Never add Markdown or meta‑text',
    ],
    constraints: ['Preserve original paragraphs as much as possible'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the formatted document in plain text'],
});
const userParametrizedPromptForTransformingTextToSocialMediaPostFormat = makeUserPromptForTextTransformation({
    userInputParameters: [
        'UserText: ```{{user_text}}```',
        'Platform: ```{{platform}}```   # e.g. Twitter, LinkedIn, Instagram',
    ],
    mainTask: 'Optimize the UserText for social media posts with hooks, hashtags, and CTAs',
    instructions: [
        'Craft a hook/headline and concise body',
        'Include 2–5 relevant hashtags and at most one @mention',
        'Never add headings, commentary, labels, or meta‑text',
    ],
    constraints: [
        'Respect character limits (e.g., ≤280 for Twitter)',
        'Do not add external links unless present in the original text',
    ],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the social‑media‑ready text'],
});
const userParametrizedPromptForTransformingTextToWikiLikeMarkdownFormat = makeUserPromptForTextTransformation({
    userInputParameters: ['UserText: ```{{user_text}}```'],
    mainTask: 'Format the UserText into Markdown-based documentation for wikis and Confluence',
    instructions: [
        'Use Markdown headers, code blocks (```), and inline code (`…`)',
        'Organize into Overview, Details, Examples (only if clarifying), and Notes',
        'Never add meta‑text or extra examples beyond minimal clarification',
    ],
    constraints: ['Omit private/internal details'],
    errorHandling: [
        'If UserText is empty or unparseable, return an empty string',
        'Sanitize any sensitive data without altering non‑sensitive content',
    ],
    output: ['ONLY the documentation in Markdown'],
});
const userParametrizedPromptForPreparationOfResearchPlan = `
Your role: "Senior Research Analyst, PhD‑level expertise in multidisciplinary investigations"

Your capabilities:
  — Identify knowledge gaps and propose clarifying questions
  — Recognize interdisciplinary connections (e.g., physics → materials science → safety)
  — Create taxonomies and thematic groupings for complex topics
  — Adapt questioning depth to the user’s domain and AudienceLevel

User Input:
  — ResearchTopic: \`\`\`{{research_topic}}\`\`\`     # e.g. “How does a nuclear reactor work?”
  — DomainContext: \`\`\`{{domain_context_like_programming_ai_nuclear}}\`\`\`     # optional, e.g. “nuclear engineering,” “environmental policy”
  — AudienceLevel: \`\`\`{{audience_level_like_expert_novice_school}}\`\`\`       # optional, e.g. “high‑school,” “undergrad,” “expert”

You need to perform the following task:
  — Create a detailed research plan for the ResearchTopic

instructions:
  — First, restate the ResearchTopic to confirm understanding
  — Systematically decompose the main question into finer sub‑questions and related topics
  — Group sub‑questions into coherent themes or categories
  — Filter out any tangential or redundant questions based on the user’s stated focus (DomainContext, AudienceLevel)
  — Prioritize sub‑questions by relevance and depth to ensure comprehensive coverage

constraints:
  — Work agnostically across any domain (science, engineering, programming, history, etc.)
  — Do not answer the research questions now—only generate the structured research plan
  — Keep the user’s original intent central; do not introduce unrelated topics
  — Require user confirmation or additional context for any ambiguous areas

output:
  — A Research Prompt consisting of:
      1. Original Topic Restatement – short paraphrase of ResearchTopic
      2. Clarifying Questions – targeted follow‑up questions where needed
      3. Sub‑Topics & Themes – grouped lists of specific angles to investigate
      4. Filtered Research Questions – the final set of prioritized questions
      5. Next Steps – instructions for how to proceed (sources, methods, tools)

Before generating the Research Prompt, list and verify each transformation step you plan to apply.
`.trim();
const userParametrizedPromptForUserStoryCreation = `
Your Role: "Agile User‑Story Generator, Senior Product Owner expertise in crafting development‑ready stories"

Your capabilities:
  — Parse raw requirements or feature requests from user input
  — Identify user‑roles, actions, and business values
  — Structure stories according to industry best practices (Who, What, Why, How)
  — Auto‑generate clear Acceptance Criteria (Gherkin style) and list non‑functional requirements
  — Call out dependencies, UX/UI notes, data/schema considerations, test plans, and relevant links

Your main task: "Transform any user’s feature description or requirement into a fully‑formed Agile user story, strictly following the provided template and including only the information the user supplies."

User Input:
  — Requirements: \`\`\`{{requirements}}\`\`\`

instructions:
    1. Interpret \`{{requirements}}\` as the raw requirements for one user story.
    2. Extract and map each piece of provided information into the template sections:
       — Title
       — Story (As a…, I want…, so that…)
       — Description (Scope, Background)
       — Business Rules / Mapping Logic / Domain Rules
       — Acceptance Criteria (Given‑When‑Then)
       — Non‑Functional Requirements
       — Dependencies
       — UX / UI Notes
       — Data & Schema Considerations
       — Testing & Validation
       — Links & References
    3. Do not invent any details not explicitly given in \`{{requirements}}\`. If a section has no provided content, leave it as an empty placeholder or omit it if the template allows.
    4. Follow the exact headings and formatting of the template.
    5. Ensure each Acceptance Criterion is testable and phrased pass/fail.

additional instructions:
  — If \`{{requirements}}\` is ambiguous or misses critical elements (e.g., user‑role or benefit), ask a clarifying question rather than guessing.
  — Maintain professional, concise language suitable for hand‑off to development teams.
  — Preserve Markdown formatting for easy copy‑and‑paste into issue trackers.

constraints:
  — Only use information explicitly provided in \`{{requirements}}\`.
  — Do not add extra examples or commentary in the output.
  — Do not break the structure or rename template headings.
  — Work for any domain: backend, frontend, data, UX, integrations, etc.

errorHandling:
  — If a required template section cannot be populated from \`{{requirements}}\`, insert a placeholder comment like \`<!-- NEEDS INPUT: <section> -->\` and request clarification.
  — If \`{{requirements}}\` contains multiple unrelated requirements, ask whether to split into separate stories.

output:
  — A single Markdown‑formatted user story with the following sections (omit any sections with no content):
    1. Title:
    2. Story:
       As a [user‑role],
       I want to [action],
       so that [business value].
    3. Description:
       * Scope: …
       * Background: …
    4. Business Rules / Mapping Logic / Domain Rules:
       * …
    5. Acceptance Criteria:
       1. Given … When … Then …
       2. …
    6. Non‑Functional Requirements:
       * …
    7. Dependencies:
       * …
    8. UX / UI Notes:
       * …
    9. Data & Schema Considerations:
       * …
    10. Testing & Validation:
        * Unit tests: …
        * Integration tests: …
        * Manual/UAT: …
        * Monitoring/Alerts: …
    11. Links & References:
        * …
`.trim();
const userParametrizedPromptForTranslatingTextInDictionaryFormat = makeUserPromptForTextTransformation({
    userInputParameters: [
        'UserText: ```{{user_text}}``` # Expect new word/phrase/sentence on the new lines',
        'SourceLanguage: ```{{input_language}}```',
        'TargetLanguage: ```{{output_language}}```',
    ],
    mainTask:
        'Translate the UserText from SourceLanguage to TargetLanguage while preserving style, tone, and formatting in the dictionary format',
    instructions: [
        'Analyze cultural and linguistic context of the SourceLanguage text',
        'Choose equivalents in TargetLanguage that preserve idioms, humor, and register',
        'Make translation in the dictionary format, where we have example of the original text and its translation',
        'Format results in the markdown table with 3 columns: original text, translation, and example',
        'If there was an ask from user to add part of the speach - add one additional column with part of the speech (eg. verb, noun, adjective, adverb, preposition, conjunction, interjection, pronoun, determiner, article, numeral, abbreviation, etc. translated to the target language)',
    ],
    constraints: [
        'Expect explicit source/target languages',
        'Preserve formatting, line breaks, special characters, numerals, and proper nouns',
        'Do not localize brand names or technical terms without user instruction',
    ],
    errorHandling: ['If UserText, SourceLanguage and TargetLanguage are empty or unparseable, return an empty string'],
    output: [
        'ONLY the translated text in the same structural format as the input for each line formated as markdown table',
    ],
});

export const userPrompts: Prompt[] = [
    createUserParametrizedPrompt(
        'userParametrizedPromptForTranslatingText',
        userParametrizedPromptForTranslatingText,
        PromptCategory.TEXT_TRANSLATION,
        'User prompt that translates user text between languages while preserving style, tone, and formatting',
        'translation',
        'language',
        'text',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForProofreadingText',
        userParametrizedPromptForProofreadingText,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that proofreads text for grammar, punctuation, and clarity without altering meaning',
        'proofread',
        'text',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForRewritingText',
        userParametrizedPromptForRewritingText,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that rewrites text for improved clarity, flow, and readability while keeping intent',
        'rewrite',
        'rephrase',
        'text',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForRewritingTextToFormalTone',
        userParametrizedPromptForRewritingTextToFormalTone,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that converts text to a formal, professional tone suitable for reports',
        'formal',
        'text',
        'rephrase',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForRewritingTextToSemiFormalTone',
        userParametrizedPromptForRewritingTextToSemiFormalTone,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that converts text to a semi-formal tone suitable for work communication',
        'semi-formal',
        'text',
        'rephrase',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForRewritingTextToCasualTone',
        userParametrizedPromptForRewritingTextToCasualTone,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that converts text to a casual, conversational style for everyday communication',
        'casual',
        'text',
        'rephrase',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForRewritingTextToFriendlyTone',
        userParametrizedPromptForRewritingTextToFriendlyTone,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that transforms text into a friendly, approachable tone with inclusive language',
        'friendly',
        'text',
        'rephrase',
    ),
    createUserParametrizedPrompt(
        'userPromptForPoliteCodeReviewComment',
        userPromptForPoliteCodeReviewComment,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that polites a code review comment by converting comment to polite format',
        'polite',
        'code',
        'review',
        'comment',
        'pr',
        'mr',
        'github',
        'gitlab',
    ),
    createUserParametrizedPrompt(
        'userPromptForImprovingPullRequestDescription',
        userPromptForImprovingPullRequestDescription,
        PromptCategory.TEXT_PROOFREADING,
        'User prompt that improves a pull request description by adding missing details and clarifying language',
        'improve',
        'description',
        'pull',
        'request',
        'pr',
        'mr',
        'github',
        'gitlab',
    ),
    createUserParametrizedPrompt(
        'userPromptForInstructionalWikiStyleWithFormat',
        userPromptForInstructionalWikiStyleWithFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that formats content into a structured, instructional wiki-style format',
        'format',
        'text',
        'wiki',
        'instruction',
        'guide',
        'tutorial',
    ),
    createUserParametrizedPrompt(
        'userPromptForExplainingIntendedMeaning',
        userPromptForExplainingIntendedMeaning,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that explains the intended meaning of a sentence or phrase',
        'explain',
        'meaning',
        'sentence',
        'phrase',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTransformingTextToEmailFormat',
        userParametrizedPromptForTransformingTextToEmailFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that formats content into a professional email with subject, greeting, body, and closing',
        'format',
        'text',
        'email',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTransformingTextToChatFormat',
        userParametrizedPromptForTransformingTextToChatFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that formats content into concise chat messages suitable for messaging apps',
        'format',
        'text',
        'chat',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTransformingTextToDocumentFormat',
        userParametrizedPromptForTransformingTextToDocumentFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that formats text into a structured plain-text document layout for Word or PDF',
        'format',
        'text',
        'document',
        'word',
        'pdf',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTransformingTextToSocialMediaPostFormat',
        userParametrizedPromptForTransformingTextToSocialMediaPostFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that optimizes text for social media posts with hooks, hashtags, and CTAs',
        'format',
        'text',
        'social',
        'twitter',
        'post',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTransformingTextToWikiLikeMarkdownFormat',
        userParametrizedPromptForTransformingTextToWikiLikeMarkdownFormat,
        PromptCategory.TEXT_FORMATTING,
        'User prompt that formats content into Markdown-based documentation for wikis and Confluence',
        'format',
        'text',
        'document',
        'markdown',
        'confluence',
        'wiki',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForPreparationOfResearchPlan',
        userParametrizedPromptForPreparationOfResearchPlan,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'User prompt that constructs detailed research plans by decomposing user queries into subquestions',
        'research',
        'prompt',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForUserStoryCreation',
        userParametrizedPromptForUserStoryCreation,
        PromptCategory.AGILE_USER_STORY_GENERATION,
        'User prompt that transforms user requirements into a fully-formed Agile user story',
        'user',
        'story',
        'requirements',
        'agile',
        'user',
        'story',
        'template',
        'task',
    ),
    createUserParametrizedPrompt(
        'userParametrizedPromptForTranslatingTextInDictionaryFormat',
        userParametrizedPromptForTranslatingTextInDictionaryFormat,
        PromptCategory.TEXT_TRANSLATION,
        'User prompt that translates text between languages while preserving style, tone, and formatting in the dictionary format',
        'translation',
        'dictionary',
        'language',
        'text',
    ),
];
