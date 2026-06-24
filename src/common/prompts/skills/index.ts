import type { SkillDef } from '../model/types.ts';

import { skill as awsExpertSkill } from './aws-expert/skill.ts';
import { skill as cassandraExpertSkill } from './cassandra-expert/skill.ts';
import { skill as codeReviewSkill } from './code-review/skill.ts';
import { skill as configScanSkill } from './config-scan/skill.ts';
import { skill as drawioSkill } from './drawio/skill.ts';
import { skill as logRootCauseSkill } from './log-root-cause/skill.ts';
import { skill as mermaidSkill } from './mermaid/skill.ts';
import { skill as oracleExpertSkill } from './oracle-expert/skill.ts';
import { skill as projectDocumentationSkill } from './project-documentation/skill.ts';
import { skill as projectNavigatorSkill } from './project-navigator/skill.ts';
import { skill as securityAuditSkill } from './security-audit/skill.ts';
import { skill as skillBuilderSkill } from './skill-builder/skill.ts';
import { skill as testRunnerSkill } from './test-runner/skill.ts';

export const skills: SkillDef[] = [
    awsExpertSkill,
    cassandraExpertSkill,
    codeReviewSkill,
    configScanSkill,
    drawioSkill,
    logRootCauseSkill,
    mermaidSkill,
    oracleExpertSkill,
    projectDocumentationSkill,
    projectNavigatorSkill,
    securityAuditSkill,
    skillBuilderSkill,
    testRunnerSkill,
];
