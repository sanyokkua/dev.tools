import type { SkillDef } from '@/common/prompts/model/types';
import { skill as awsExpert } from '@/common/prompts/skills/aws-expert/skill';
import { skill as cassandraExpert } from '@/common/prompts/skills/cassandra-expert/skill';
import { skill as codeReview } from '@/common/prompts/skills/code-review/skill';
import { skill as configScan } from '@/common/prompts/skills/config-scan/skill';
import { skill as drawio } from '@/common/prompts/skills/drawio/skill';
import { skill as logRootCause } from '@/common/prompts/skills/log-root-cause/skill';
import { skill as mermaid } from '@/common/prompts/skills/mermaid/skill';
import { skill as oracleExpert } from '@/common/prompts/skills/oracle-expert/skill';
import { skill as projectDocumentation } from '@/common/prompts/skills/project-documentation/skill';
import { skill as projectNavigator } from '@/common/prompts/skills/project-navigator/skill';
import { skill as securityAudit } from '@/common/prompts/skills/security-audit/skill';
import { skill as skillBuilder } from '@/common/prompts/skills/skill-builder/skill';
import { skill as testRunner } from '@/common/prompts/skills/test-runner/skill';

const ALL_SKILLS: SkillDef[] = [
    awsExpert,
    cassandraExpert,
    codeReview,
    configScan,
    drawio,
    logRootCause,
    mermaid,
    oracleExpert,
    projectDocumentation,
    projectNavigator,
    securityAudit,
    skillBuilder,
    testRunner,
];

describe('Skill completeness — all 13 authored skills', () => {
    it('has exactly 13 skills', () => {
        expect(ALL_SKILLS).toHaveLength(13);
    });

    it.each(ALL_SKILLS)('$slug: has a non-empty files array', (skill) => {
        expect(skill.files.length).toBeGreaterThan(0);
    });

    it.each(ALL_SKILLS)('$slug: has exactly one SKILL.md with role "skill"', (skill) => {
        const skillFiles = skill.files.filter((f) => f.role === 'skill');
        expect(skillFiles).toHaveLength(1);
        expect(skillFiles[0].path).toBe('SKILL.md');
    });

    it.each(ALL_SKILLS)('$slug: all files have non-empty content', (skill) => {
        for (const file of skill.files) {
            expect(file.content.length).toBeGreaterThan(0);
        }
    });

    it.each(ALL_SKILLS)('$slug: skills with script files have scripts descriptors populated', (skill) => {
        const hasScriptFiles = skill.files.some((f) => f.role === 'script');
        if (hasScriptFiles) {
            expect(skill.scripts).toBeDefined();
            expect(skill.scripts!.length).toBeGreaterThan(0);
        }
    });

    it.each(ALL_SKILLS)('$slug: script descriptors reference actual script files', (skill) => {
        if (!skill.scripts || skill.scripts.length === 0) return;
        const scriptPaths = new Set(skill.files.filter((f) => f.role === 'script').map((f) => f.path));
        for (const descriptor of skill.scripts) {
            expect(scriptPaths.has(`scripts/${descriptor.name}`)).toBe(true);
        }
    });
});
