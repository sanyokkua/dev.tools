import React, { ChangeEvent, useLayoutEffect, useRef } from 'react';

interface AutoTextareaProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    id?: string;
}

const AutoTextarea: React.FC<AutoTextareaProps> = ({ value, onChange, placeholder, id }) => {
    const ref = useRef<HTMLTextAreaElement>(null);

    useLayoutEffect(() => {
        if (ref.current) {
            ref.current.style.height = 'auto';
            ref.current.style.height = `${ref.current.scrollHeight}px`;
        }
    }, [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        onChange(e.target.value);
    };

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            id={id}
            rows={1}
            className="textarea-auto"
        />
    );
};

AutoTextarea.displayName = 'AutoTextarea';
export default AutoTextarea;
