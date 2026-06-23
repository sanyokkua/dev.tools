import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { SkillDef } from '../../src/common/prompts/model/types';
import SkillDetailPanel from '../../src/components/page-specific/prompts-collection/SkillDetailPanel';

// --- Mocks ---

const mockShowToast = jest.fn();
jest.mock('@/contexts/ToasterContext', () => ({ useToast: () => ({ showToast: mockShowToast }) }));

jest.mock('@/common/file-utils', () => ({
    ...jest.requireActual('@/common/file-utils'),
    saveTextFile: jest.fn(),
    downloadSkillZip: jest.fn().mockResolvedValue(undefined),
}));

// --- Fixtures ---

const FIXTURE_SKILL: SkillDef = {
    id: 'SKL-A01-code-review',
    slug: 'code-review',
    domainCode: 'A',
    title: 'Code Review',
    version: '1.0.0',
    description: 'Performs thorough code review.',
    tags: ['review', 'quality'],
    allowedTools: ['Read', 'Bash'],
    relatedSkillIds: ['skill-builder'],
    files: [
        { path: 'SKILL.md', role: 'skill', content: '# Code Review Skill\nContent here.' },
        { path: 'helper.js', role: 'reference', content: '// helper content' },
        { path: 'scripts/get-review-target.sh', role: 'script', content: '#!/bin/sh\n# get-review-target.sh\n' },
    ],
    scripts: [{ name: 'get-review-target.sh', purpose: 'Resolve the scope of a code review' }],
};

beforeEach(() => {
    mockShowToast.mockClear();
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: jest.fn().mockResolvedValue(undefined) },
        configurable: true,
    });
});

// --- Tests ---

describe('SkillDetailPanel', () => {
    test('renders "Select a skill" when skill is null', () => {
        render(<SkillDetailPanel skill={null} />);
        expect(screen.getByRole('status')).toHaveTextContent('Select a skill from the list');
    });

    test('renders title, id, version, description when skill provided', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText('Code Review')).toBeInTheDocument();
        expect(screen.getByText('SKL-A01-code-review')).toBeInTheDocument();
        expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
        expect(screen.getByText('Performs thorough code review.')).toBeInTheDocument();
    });

    test('renders tool chips for all allowedTools', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText('Read')).toBeInTheDocument();
        expect(screen.getByText('Bash')).toBeInTheDocument();
        expect(screen.getByText('Required Tools')).toBeInTheDocument();
    });

    test('renders tag chips for all tags', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText('review')).toBeInTheDocument();
        expect(screen.getByText('quality')).toBeInTheDocument();
        expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    test('renders related skill buttons and fires onSelectSkill with correct slug on click', () => {
        const onSelectSkill = jest.fn();
        render(
            <SkillDetailPanel
                skill={FIXTURE_SKILL}
                relatedSkills={[{ slug: 'skill-builder', title: 'Skill Builder' }]}
                onSelectSkill={onSelectSkill}
            />,
        );
        const relatedBtn = screen.getByRole('button', { name: 'Skill Builder' });
        expect(relatedBtn).toBeInTheDocument();
        fireEvent.click(relatedBtn);
        expect(onSelectSkill).toHaveBeenCalledWith('skill-builder');
    });

    test('renders a row for each file', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText('SKILL.md')).toBeInTheDocument();
        expect(screen.getByText('helper.js')).toBeInTheDocument();
        const fileCopyBtns = screen.getAllByRole('button', { name: /^Copy (SKILL\.md|helper\.js)$/ });
        expect(fileCopyBtns).toHaveLength(2);
    });

    test('clicking Copy calls navigator.clipboard.writeText with file content', async () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const copyBtn = screen.getByRole('button', { name: 'Copy SKILL.md' });
        fireEvent.click(copyBtn);
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Code Review Skill\nContent here.');
        });
    });

    test('clicking Download file calls saveTextFile', () => {
        const { saveTextFile } = jest.requireMock('@/common/file-utils') as { saveTextFile: jest.Mock };
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const downloadBtn = screen.getByRole('button', { name: 'Download SKILL.md' });
        fireEvent.click(downloadBtn);
        expect(saveTextFile).toHaveBeenCalled();
    });

    test('switching to Amazon Kiro changes placement to .kiro/', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const select = screen.getByRole('combobox', { name: /Install target/i });
        fireEvent.change(select, { target: { value: 'amazon-kiro' } });
        expect(screen.getByText(`.kiro/skills/${FIXTURE_SKILL.slug}/`)).toBeInTheDocument();
    });

    test('Download .zip button exists and calls downloadSkillZip on click', async () => {
        const { downloadSkillZip } = jest.requireMock('@/common/file-utils') as { downloadSkillZip: jest.Mock };
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const zipBtn = screen.getByRole('button', { name: /zip/i });
        fireEvent.click(zipBtn);
        await waitFor(() => {
            expect(downloadSkillZip).toHaveBeenCalledWith(FIXTURE_SKILL);
        });
    });

    test('skill with 0 files renders Files section without crash', () => {
        const noFilesSkill = { ...FIXTURE_SKILL, files: [] };
        render(<SkillDetailPanel skill={noFilesSkill} />);
        expect(screen.getByText('Files')).toBeInTheDocument();
    });

    test('Related Skills section absent when no relatedSkills prop passed', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.queryByText('Related Skills')).not.toBeInTheDocument();
    });

    test('Related Skills section absent when relatedSkills is empty array', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} relatedSkills={[]} />);
        expect(screen.queryByText('Related Skills')).not.toBeInTheDocument();
    });

    test('Required Tools section absent when allowedTools is empty', () => {
        const noToolsSkill = { ...FIXTURE_SKILL, allowedTools: [] };
        render(<SkillDetailPanel skill={noToolsSkill} />);
        expect(screen.queryByText('Required Tools')).not.toBeInTheDocument();
    });

    // ─── Install section: agent Select + scope SegmentedControl ───────────────

    test('renders agent Select combobox and scope SegmentedControl for install', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const agentSelect = screen.getByRole('combobox', { name: /Install target/i });
        expect(agentSelect).toBeInTheDocument();
        const scopeControl = screen.getByRole('group', { name: /Install scope/i });
        expect(scopeControl).toBeInTheDocument();
        expect(screen.getByText('Project')).toBeInTheDocument();
        expect(screen.getByText('User-global')).toBeInTheDocument();
    });

    test('claude-code + project scope shows .claude/skills/ path by default', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText(`.claude/skills/${FIXTURE_SKILL.slug}/`)).toBeInTheDocument();
    });

    test('opencode + project scope shows .opencode/skills/ path', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const select = screen.getByRole('combobox', { name: /Install target/i });
        fireEvent.change(select, { target: { value: 'opencode' } });
        expect(screen.getByText(`.opencode/skills/${FIXTURE_SKILL.slug}/`)).toBeInTheDocument();
    });

    test('copy install prompt button is present', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByRole('button', { name: /Copy install prompt/i })).toBeInTheDocument();
    });

    // ─── Invoke section ───────────────────────────────────────────────────────

    test('renders invoke section with task input and copy button', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByRole('textbox', { name: /Task description/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Copy invoke prompt/i })).toBeInTheDocument();
        expect(screen.getByText('Invoke')).toBeInTheDocument();
    });

    test('invoke prompt shows skill title without task when task is empty', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText(`Use the ${FIXTURE_SKILL.title} skill.`)).toBeInTheDocument();
    });

    test('invoke prompt updates when task text is entered', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        const input = screen.getByRole('textbox', { name: /Task description/i });
        fireEvent.change(input, { target: { value: 'review my changes' } });
        expect(screen.getByText(`Use the ${FIXTURE_SKILL.title} skill to review my changes.`)).toBeInTheDocument();
    });

    // ─── Scripts section ──────────────────────────────────────────────────────

    test('renders Scripts section with name and purpose when skill.scripts populated', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText('Scripts')).toBeInTheDocument();
        expect(screen.getByText('get-review-target.sh')).toBeInTheDocument();
        expect(screen.getByText('Resolve the scope of a code review')).toBeInTheDocument();
    });

    test('renders running-the-scripts note when scripts present', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} />);
        expect(screen.getByText(/Run via interpreter/)).toBeInTheDocument();
    });

    test('Scripts section absent when skill.scripts is undefined', () => {
        const noScriptsSkill = { ...FIXTURE_SKILL, scripts: undefined };
        render(<SkillDetailPanel skill={noScriptsSkill} />);
        expect(screen.queryByText('Scripts')).not.toBeInTheDocument();
    });

    test('Scripts section absent when skill.scripts is empty array', () => {
        const noScriptsSkill = { ...FIXTURE_SKILL, scripts: [] };
        render(<SkillDetailPanel skill={noScriptsSkill} />);
        expect(screen.queryByText('Scripts')).not.toBeInTheDocument();
    });
});
