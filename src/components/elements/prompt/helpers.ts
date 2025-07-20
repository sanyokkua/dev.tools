import { PromptCategories, PromptTypes } from '@/common/prompts/prompts';
import { CaseUtils } from 'coreutilsts';

export const PromptTypesSelectList = PromptTypes.map((type) => ({
    itemId: type,
    displayText: CaseUtils.toSentenceCase(type),
}));
export const DEFAULT_PROMPT_TYPE = PromptTypesSelectList[0];
export const PromptCategoriesSelectList = PromptCategories.map((category) => ({
    itemId: category,
    displayText: CaseUtils.toSentenceCase(category),
}));
export const DEFAULT_PROMPT_CATEGORY = PromptCategoriesSelectList[0];
