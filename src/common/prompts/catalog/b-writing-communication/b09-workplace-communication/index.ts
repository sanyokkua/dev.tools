import type { LogicalPromptDef } from '../../../model/types';

import { prompt as contextArticlePrompt } from './context-article.prompt.js';
import { prompt as contextCodeReviewPrompt } from './context-code-review.prompt.js';
import { prompt as contextCommunityPrompt } from './context-community.prompt.js';
import { prompt as contextCustomerPrompt } from './context-customer.prompt.js';
import { prompt as contextDisagreementPrompt } from './context-disagreement.prompt.js';
import { prompt as contextFamilyPrompt } from './context-family.prompt.js';
import { prompt as contextForumPrompt } from './context-forum.prompt.js';
import { prompt as contextFriendPrompt } from './context-friend.prompt.js';
import { prompt as contextGovernmentPrompt } from './context-government.prompt.js';
import { prompt as contextHrPrompt } from './context-hr.prompt.js';
import { prompt as contextJiraPrompt } from './context-jira.prompt.js';
import { prompt as contextJuniorFeedbackPrompt } from './context-junior-feedback.prompt.js';
import { prompt as contextLandlordPrompt } from './context-landlord.prompt.js';
import { prompt as contextLinkedinPrompt } from './context-linkedin.prompt.js';
import { prompt as contextManagerPrompt } from './context-manager.prompt.js';
import { prompt as contextNeighborPrompt } from './context-neighbor.prompt.js';
import { prompt as contextPolicePrompt } from './context-police.prompt.js';
import { prompt as contextPrDescriptionPrompt } from './context-pr-description.prompt.js';
import { prompt as contextPublicAnnouncementPrompt } from './context-public-announcement.prompt.js';
import { prompt as contextReceivingCriticismPrompt } from './context-receiving-criticism.prompt.js';
import { prompt as contextRecruiterPrompt } from './context-recruiter.prompt.js';
import { prompt as contextSeniorEngineerPrompt } from './context-senior-engineer.prompt.js';
import { prompt as contextSensitivePrompt } from './context-sensitive.prompt.js';
import { prompt as contextServiceProviderPrompt } from './context-service-provider.prompt.js';
import { prompt as contextSlackPrompt } from './context-slack.prompt.js';
import { prompt as contextStakeholderPrompt } from './context-stakeholder.prompt.js';
import { prompt as contextStandupPrompt } from './context-standup.prompt.js';
import { prompt as contextUrgentPrompt } from './context-urgent.prompt.js';
import { prompt as contextWritePrompt } from './context-write.prompt.js';
import { prompt as contextXThreadsPrompt } from './context-x-threads.prompt.js';
import { prompt as sysPrompt } from './sys.prompt.js';
import { prompt as workAskForHelpPrompt } from './work-askForHelp.prompt.js';
import { prompt as workCustomerReplyPrompt } from './work-customerReply.prompt.js';
import { prompt as workEscalationPrompt } from './work-escalation.prompt.js';
import { prompt as workMeetingAgendaPrompt } from './work-meetingAgenda.prompt.js';
import { prompt as workStandupPrompt } from './work-standup.prompt.js';
import { prompt as workStatusUpdatePrompt } from './work-statusUpdate.prompt.js';
import { prompt as workTaskExplanationPrompt } from './work-taskExplanation.prompt.js';

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
