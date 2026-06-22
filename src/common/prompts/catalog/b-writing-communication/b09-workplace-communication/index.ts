import type { LogicalPromptDef } from '../../../model/types';

import { prompt as contextArticlePrompt } from './context-article.prompt.ts';
import { prompt as contextCodeReviewPrompt } from './context-code-review.prompt.ts';
import { prompt as contextCommunityPrompt } from './context-community.prompt.ts';
import { prompt as contextCustomerPrompt } from './context-customer.prompt.ts';
import { prompt as contextDisagreementPrompt } from './context-disagreement.prompt.ts';
import { prompt as contextFamilyPrompt } from './context-family.prompt.ts';
import { prompt as contextForumPrompt } from './context-forum.prompt.ts';
import { prompt as contextFriendPrompt } from './context-friend.prompt.ts';
import { prompt as contextGovernmentPrompt } from './context-government.prompt.ts';
import { prompt as contextHrPrompt } from './context-hr.prompt.ts';
import { prompt as contextJiraPrompt } from './context-jira.prompt.ts';
import { prompt as contextJuniorFeedbackPrompt } from './context-junior-feedback.prompt.ts';
import { prompt as contextLandlordPrompt } from './context-landlord.prompt.ts';
import { prompt as contextLinkedinPrompt } from './context-linkedin.prompt.ts';
import { prompt as contextManagerPrompt } from './context-manager.prompt.ts';
import { prompt as contextNeighborPrompt } from './context-neighbor.prompt.ts';
import { prompt as contextPolicePrompt } from './context-police.prompt.ts';
import { prompt as contextPrDescriptionPrompt } from './context-pr-description.prompt.ts';
import { prompt as contextPublicAnnouncementPrompt } from './context-public-announcement.prompt.ts';
import { prompt as contextReceivingCriticismPrompt } from './context-receiving-criticism.prompt.ts';
import { prompt as contextRecruiterPrompt } from './context-recruiter.prompt.ts';
import { prompt as contextSeniorEngineerPrompt } from './context-senior-engineer.prompt.ts';
import { prompt as contextSensitivePrompt } from './context-sensitive.prompt.ts';
import { prompt as contextServiceProviderPrompt } from './context-service-provider.prompt.ts';
import { prompt as contextSlackPrompt } from './context-slack.prompt.ts';
import { prompt as contextStakeholderPrompt } from './context-stakeholder.prompt.ts';
import { prompt as contextStandupPrompt } from './context-standup.prompt.ts';
import { prompt as contextUrgentPrompt } from './context-urgent.prompt.ts';
import { prompt as contextWritePrompt } from './context-write.prompt.ts';
import { prompt as contextXThreadsPrompt } from './context-x-threads.prompt.ts';
import { prompt as sysPrompt } from './sys.prompt.ts';
import { prompt as workAskForHelpPrompt } from './work-askForHelp.prompt.ts';
import { prompt as workCustomerReplyPrompt } from './work-customerReply.prompt.ts';
import { prompt as workEscalationPrompt } from './work-escalation.prompt.ts';
import { prompt as workMeetingAgendaPrompt } from './work-meetingAgenda.prompt.ts';
import { prompt as workStandupPrompt } from './work-standup.prompt.ts';
import { prompt as workStatusUpdatePrompt } from './work-statusUpdate.prompt.ts';
import { prompt as workTaskExplanationPrompt } from './work-taskExplanation.prompt.ts';

export const prompts: LogicalPromptDef[] = [
    contextManagerPrompt,
    contextSeniorEngineerPrompt,
    contextJuniorFeedbackPrompt,
    contextCodeReviewPrompt,
    contextPrDescriptionPrompt,
    contextCustomerPrompt,
    contextStakeholderPrompt,
    contextSlackPrompt,
    contextStandupPrompt,
    contextRecruiterPrompt,
    contextHrPrompt,
    contextLinkedinPrompt,
    contextXThreadsPrompt,
    contextForumPrompt,
    contextJiraPrompt,
    contextFriendPrompt,
    contextFamilyPrompt,
    contextNeighborPrompt,
    contextLandlordPrompt,
    contextServiceProviderPrompt,
    contextGovernmentPrompt,
    contextPolicePrompt,
    contextCommunityPrompt,
    contextArticlePrompt,
    contextDisagreementPrompt,
    contextSensitivePrompt,
    contextReceivingCriticismPrompt,
    contextUrgentPrompt,
    contextPublicAnnouncementPrompt,
    contextWritePrompt,
    sysPrompt,
    workStatusUpdatePrompt,
    workStandupPrompt,
    workEscalationPrompt,
    workCustomerReplyPrompt,
    workTaskExplanationPrompt,
    workAskForHelpPrompt,
    workMeetingAgendaPrompt,
];
