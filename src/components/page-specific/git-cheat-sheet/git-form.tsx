'use client';
import { OSType } from '@/common/types';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import SegmentedControl, { type SegmentedOption } from '@/controls/SegmentedControl';
import Switch from '@/controls/Switch';
import React, { useState } from 'react';

export type FormData = { name: string; email: string; globalConfig: boolean; os: OSType };

interface FormProps {
    onSubmit: (formData: FormData) => void;
}

const OS_OPTIONS: SegmentedOption[] = [
    { value: 'macos', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
    { value: 'linux', label: 'Linux' },
];

const GitForm: React.FC<FormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', globalConfig: false, os: 'macos' });

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setFormData((prev) => ({ ...prev, email: e.target.value }));
    };

    const handleOsChange = (os: string): void => {
        setFormData((prev) => ({ ...prev, os: os as OSType }));
    };

    const handleGlobalChange = (checked: boolean): void => {
        setFormData((prev) => ({ ...prev, globalConfig: checked }));
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleReset = (): void => {
        const reset: FormData = { name: '', email: '', globalConfig: false, os: 'macos' };
        setFormData(reset);
        onSubmit(reset);
    };

    return (
        <form onSubmit={handleSubmit} className="git-cheat-sheet__form-card">
            <div className="git-cheat-sheet__step-label">Your details</div>
            <div className="git-cheat-sheet__field">
                <label htmlFor="git-name">Name</label>
                <Input
                    type="text"
                    id="git-name"
                    name="name"
                    value={formData.name}
                    onChangeDefault={handleNameChange}
                    required
                    size="small"
                />
            </div>
            <div className="git-cheat-sheet__field">
                <label htmlFor="git-email">Email</label>
                <Input
                    type="email"
                    id="git-email"
                    name="email"
                    value={formData.email}
                    onChangeDefault={handleEmailChange}
                    required
                    size="small"
                />
            </div>
            <div className="git-cheat-sheet__field">
                <label>OS</label>
                <SegmentedControl
                    options={OS_OPTIONS}
                    value={formData.os}
                    onChange={handleOsChange}
                    aria-label="Operating system"
                />
            </div>
            <Switch checked={formData.globalConfig} onChange={handleGlobalChange} label="Global config (--global)" />
            <div className="git-cheat-sheet__form-actions">
                <Button type="submit" text="Generate" variant="solid" colorStyle="primary-color" size="small" />
                <Button
                    type="reset"
                    text="Reset"
                    variant="text"
                    colorStyle="primary-color"
                    size="small"
                    onClick={handleReset}
                />
            </div>
        </form>
    );
};

export default GitForm;
