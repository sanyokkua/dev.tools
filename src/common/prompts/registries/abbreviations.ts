/**
 * Maps bare abbreviation → "Full Name (ABBR)" expansion.
 * Used by expandAbbreviations() and future build-time lint.
 */
export const ABBREVIATIONS: Record<string, string> = {
    'ADR': 'Architecture Decision Record (ADR)',
    'PR': 'Pull Request (PR)',
    'MR': 'Merge Request (MR)',
    'RFC': 'Request for Comments (RFC)',
    'API': 'Application Programming Interface (API)',
    'CI/CD': 'Continuous Integration / Continuous Delivery (CI/CD)',
    'CI': 'Continuous Integration (CI)',
    'CD': 'Continuous Delivery (CD)',
    'SQL': 'Structured Query Language (SQL)',
    'CQL': 'Cassandra Query Language (CQL)',
    'SEO': 'Search Engine Optimization (SEO)',
    'FAQ': 'Frequently Asked Questions (FAQ)',
    'TL;DR': "Too Long; Didn't Read (TL;DR)",
    'HMW': 'How Might We (HMW)',
    'QA': 'Quality Assurance (QA)',
    'ORM': 'Object-Relational Mapping (ORM)',
    'MVP': 'Minimum Viable Product (MVP)',
    'UI': 'User Interface (UI)',
    'UX': 'User Experience (UX)',
    'PoC': 'Proof of Concept (PoC)',
    'SDK': 'Software Development Kit (SDK)',
    'STAR': 'Situation, Task, Action, Result (STAR)',
    'SBI': 'Situation–Behavior–Impact (SBI)',
    'BLUF': 'Bottom Line Up Front (BLUF)',
    'HR': 'Human Resources (HR)',
    'OWASP': 'Open Worldwide Application Security Project (OWASP)',
    'IAM': 'Identity and Access Management (IAM)',
    'IaC': 'Infrastructure as Code (IaC)',
    'CFN': 'AWS CloudFormation (CFN)',
    'CDK': 'Cloud Development Kit (CDK)',
    'TF': 'Terraform (TF)',
    'AWS': 'Amazon Web Services (AWS)',
    'JWT': 'JSON Web Token (JWT)',
    'JSON': 'JavaScript Object Notation (JSON)',
    'YAML': "YAML Ain't Markup Language (YAML)",
    'XML': 'Extensible Markup Language (XML)',
    'HTML': 'HyperText Markup Language (HTML)',
    'CSS': 'Cascading Style Sheets (CSS)',
    'URL': 'Uniform Resource Locator (URL)',
    'HTTP': 'HyperText Transfer Protocol (HTTP)',
    'HTTPS': 'HyperText Transfer Protocol Secure (HTTPS)',
    'REST': 'Representational State Transfer (REST)',
    'CRUD': 'Create, Read, Update, Delete (CRUD)',
    'CFG': 'Classifier-Free Guidance (CFG)',
    'I2V': 'Image-to-Video (I2V)',
    'T2V': 'Text-to-Video (T2V)',
    'V2V': 'Video-to-Video (V2V)',
    'LoRA': 'Low-Rank Adaptation (LoRA)',
    'AR': 'Aspect Ratio (AR)',
    'FPS': 'Frames Per Second (FPS)',
    'SLA': 'Service-Level Agreement (SLA)',
    'SEV': 'Severity level (SEV)',
    'SOW': 'Statement of Work (SOW)',
    'ROI': 'Return on Investment (ROI)',
    'JWKS': 'JSON Web Key Set (JWKS)',
    'ORA': 'Oracle error code (ORA)',
    'VRAM': 'Video Random-Access Memory (VRAM)',
    'LOC': 'Lines of Code (LOC)',
    'DND': 'Do Not Disturb (DND)',
    'AP': 'Associated Press (AP)',
    'C2PA': 'Coalition for Content Provenance and Authenticity (C2PA)',
};

/**
 * Replaces bare abbreviations in text with their "Full Name (ABBR)" form.
 *
 * Uses a SINGLE combined regex pass (sorted longest-first) so that expansions
 * already inserted into the string are never re-scanned. This prevents the
 * multi-pass loop bug where a longer expansion that contains a shorter key
 * (e.g. "CI/CD" → "...Continuous Delivery (CI/CD)" contains "CD") would be
 * incorrectly re-expanded on a later iteration.
 *
 * Idempotency: the negative lookbehind `(?<!\()` skips any abbreviation that
 * is already inside parentheses (i.e. already in expanded form).
 */
export function expandAbbreviations(text: string): string {
    if (!text) return text;
    const keys = Object.keys(ABBREVIATIONS)
        .sort((a, b) => b.length - a.length)
        .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`));
    const re = new RegExp(`(?<![A-Za-z(])(${keys.join('|')})(?![A-Za-z(])`, 'g');
    return text.replace(re, (_, g) => ABBREVIATIONS[g]);
}
