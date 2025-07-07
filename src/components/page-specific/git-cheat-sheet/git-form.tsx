'use client';
import { OSType } from '@/common/types';
import Button from '@/controls/Button';
import Input from '@/controls/Input';
import React, { useState } from 'react';
import PaperContainer from '../../layouts/PaperContainer';

export type FormData = { name: string; email: string; globalConfig: boolean; os: OSType };

interface FormProps {
    onSubmit: (formData: FormData) => void;
}

const ConfigForm: React.FC<FormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<FormData>({ name: '', email: '', globalConfig: false, os: 'macos' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    function handleReset() {
        const formContent: FormData = { name: '', email: '', globalConfig: false, os: 'macos' };
        setFormData(formContent);
        onSubmit(formContent);
    }

    return (
        <PaperContainer elevation={1}>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name: </label>
                    <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChangeDefault={handleChange}
                        required
                        size={'small'}
                    />
                </div>
                <div>
                    <label htmlFor="email">Email: </label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChangeDefault={handleChange}
                        required
                        size={'small'}
                    />
                </div>
                <br />
                <div>
                    <label htmlFor="globalConfig">Global Config:</label>
                    <Input
                        type="checkbox"
                        id="globalConfig"
                        name="globalConfig"
                        checked={formData.globalConfig}
                        onChangeDefault={handleChange}
                    />
                </div>
                <br />
                <div>
                    <label>OS:</label>
                    <label>
                        <Input
                            type="radio"
                            value="windows"
                            name="os"
                            checked={formData.os === 'windows'}
                            onChangeDefault={handleChange}
                        />
                        Windows
                    </label>
                    <label>
                        <Input
                            type="radio"
                            value="macos"
                            name="os"
                            checked={formData.os === 'macos'}
                            onChangeDefault={handleChange}
                        />
                        MacOS
                    </label>
                    <label>
                        <Input
                            type="radio"
                            value="linux"
                            name="os"
                            checked={formData.os === 'linux'}
                            onChangeDefault={handleChange}
                        />
                        Linux
                    </label>
                </div>
                <br />
                <Button type="submit" text={'Submit'} variant={'solid'} colorStyle={'primary-color'} size={'small'} />
                <Button
                    type="reset"
                    text={'Reset'}
                    variant={'text'}
                    colorStyle={'primary-color'}
                    size={'small'}
                    onClick={handleReset}
                />
            </form>
        </PaperContainer>
    );
};

export default ConfigForm;
