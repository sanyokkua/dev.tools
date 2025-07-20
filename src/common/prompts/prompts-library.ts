import { userConversationPrompts } from '@/common/prompts/dev-chat-user-prompts';
import { Prompt } from '@/common/prompts/prompts';
import { systemPrompts } from '@/common/prompts/system-prompts';
import { userPrompts } from '@/common/prompts/user-prompts';

const sortById = (a: Prompt, b: Prompt) => a.id.localeCompare(b.id);

export const promptsLibraryList: Prompt[] = [
    ...systemPrompts.sort(sortById),
    ...userPrompts.sort(sortById),
    ...userConversationPrompts.sort(sortById),
].sort(sortById);
