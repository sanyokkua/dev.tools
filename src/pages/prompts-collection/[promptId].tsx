'use client';

import { Prompt } from '@/common/prompts/prompts';
import { promptsLibraryList } from '@/common/prompts/prompts-library';
import PromptView from '@/elements/prompt/PromptView';

interface Props {
    prompt: Prompt;
}

export default function PromptDetails({ prompt }: Props) {
    return <PromptView prompt={prompt} />;
}

// Fetch prompt data at build time
export async function getStaticProps({ params }: { params: { promptId: string } }) {
    const promptId = params.promptId;
    const prompt = promptsLibraryList.find((p) => p.id === promptId);
    return { props: { prompt } };
}

// Generate all dynamic paths at build time
export async function getStaticPaths() {
    const paths = promptsLibraryList.map((prompt) => ({ params: { promptId: prompt.id.toString() } }));
    return { paths, fallback: false }; // Fallback: false = 404 for missing paths
}
