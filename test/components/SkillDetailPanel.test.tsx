import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Skill, SkillsData } from '../../src/common/prompts/types';
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

const FIXTURE_SKILL: Skill = {
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
    ],
};

const FIXTURE_SKILLS_DATA: SkillsData = {
    skills: [
        FIXTURE_SKILL,
        {
            id: 'SKL-A02-skill-builder',
            slug: 'skill-builder',
            domainCode: 'A',
            title: 'Skill Builder',
            version: '1.0.0',
            description: 'Builds skills.',
            tags: [],
            allowedTools: [],
            relatedSkillIds: [],
            files: [],
        },
    ],
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
        render(<SkillDetailPanel skill={null} skillsData={null} />);
        expect(screen.getByRole('status')).toHaveTextContent('Select a skill from the list');
    });

    test('renders title, id, version, description when skill provided', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.getByText('Code Review')).toBeInTheDocument();
        expect(screen.getByText('SKL-A01-code-review')).toBeInTheDocument();
        expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
        expect(screen.getByText('Performs thorough code review.')).toBeInTheDocument();
    });

    test('renders tool chips for all allowedTools', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.getByText('Read')).toBeInTheDocument();
        expect(screen.getByText('Bash')).toBeInTheDocument();
        expect(screen.getByText('Required Tools')).toBeInTheDocument();
    });

    test('renders tag chips for all tags', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.getByText('review')).toBeInTheDocument();
        expect(screen.getByText('quality')).toBeInTheDocument();
        expect(screen.getByText('Tags')).toBeInTheDocument();
    });

    test('renders related skill buttons and fires onSelectSkill with correct slug on click', () => {
        const onSelectSkill = jest.fn();
        render(
            <SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} onSelectSkill={onSelectSkill} />,
        );
        const relatedBtn = screen.getByRole('button', { name: 'Skill Builder' });
        expect(relatedBtn).toBeInTheDocument();
        fireEvent.click(relatedBtn);
        expect(onSelectSkill).toHaveBeenCalledWith('skill-builder');
    });

    test('renders a row for each file', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.getByText('SKILL.md')).toBeInTheDocument();
        expect(screen.getByText('helper.js')).toBeInTheDocument();
        const copyBtns = screen.getAllByRole('button', { name: /Copy/ });
        expect(copyBtns).toHaveLength(2);
    });

    test('clicking Copy calls navigator.clipboard.writeText with file content', async () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        const copyBtn = screen.getByRole('button', { name: 'Copy SKILL.md' });
        fireEvent.click(copyBtn);
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('# Code Review Skill\nContent here.');
        });
    });

    test('clicking Download file calls saveTextFile', () => {
        const { saveTextFile } = jest.requireMock('@/common/file-utils') as { saveTextFile: jest.Mock };
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        const downloadBtn = screen.getByRole('button', { name: 'Download SKILL.md' });
        fireEvent.click(downloadBtn);
        expect(saveTextFile).toHaveBeenCalled();
    });

    test('switching to Kiro CLI changes placement to .kiro/', () => {
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        const kiroBtn = screen.getByRole('button', { name: 'Kiro CLI' });
        fireEvent.click(kiroBtn);
        expect(screen.getByText('.kiro/steering/')).toBeInTheDocument();
    });

    test('Download .zip button exists and calls downloadSkillZip on click', async () => {
        const { downloadSkillZip } = jest.requireMock('@/common/file-utils') as { downloadSkillZip: jest.Mock };
        render(<SkillDetailPanel skill={FIXTURE_SKILL} skillsData={FIXTURE_SKILLS_DATA} />);
        const zipBtn = screen.getByRole('button', { name: /zip/i });
        fireEvent.click(zipBtn);
        await waitFor(() => {
            expect(downloadSkillZip).toHaveBeenCalledWith(FIXTURE_SKILL);
        });
    });

    test('skill with 0 files renders Files section without crash', () => {
        const noFilesSkill = { ...FIXTURE_SKILL, files: [] };
        render(<SkillDetailPanel skill={noFilesSkill} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.getByText('Files')).toBeInTheDocument();
    });

    test('Related Skills section absent when relatedSkillIds is empty', () => {
        const noRelatedSkill = { ...FIXTURE_SKILL, relatedSkillIds: [] };
        render(<SkillDetailPanel skill={noRelatedSkill} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.queryByText('Related Skills')).not.toBeInTheDocument();
    });

    test('Required Tools section absent when allowedTools is empty', () => {
        const noToolsSkill = { ...FIXTURE_SKILL, allowedTools: [] };
        render(<SkillDetailPanel skill={noToolsSkill} skillsData={FIXTURE_SKILLS_DATA} />);
        expect(screen.queryByText('Required Tools')).not.toBeInTheDocument();
    });
});
