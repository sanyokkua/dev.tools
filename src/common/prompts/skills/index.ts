import type { SkillDef } from '../model/types.js';

import { skill as awsExpertSkill } from './aws-expert/skill.js';
import { skill as cassandraExpertSkill } from './cassandra-expert/skill.js';
import { skill as codeReviewSkill } from './code-review/skill.js';
import { skill as configScanSkill } from './config-scan/skill.js';
import { skill as drawioSkill } from './drawio/skill.js';
import { skill as logRootCauseSkill } from './log-root-cause/skill.js';
import { skill as mermaidSkill } from './mermaid/skill.js';
import { skill as oracleExpertSkill } from './oracle-expert/skill.js';
import { skill as projectDocumentationSkill } from './project-documentation/skill.js';
import { skill as projectNavigatorSkill } from './project-navigator/skill.js';
import { skill as securityAuditSkill } from './security-audit/skill.js';
import { skill as skillBuilderSkill } from './skill-builder/skill.js';
import { skill as testRunnerSkill } from './test-runner/skill.js';

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
