import React from 'react';

type InputType =
    | 'button'
    | 'checkbox'
    | 'color'
    | 'date'
    | 'datetime-local'
    | 'email'
    | 'file'
    | 'hidden'
    | 'image'
    | 'month'
    | 'number'
    | 'password'
    | 'radio'
    | 'range'
    | 'reset'
    | 'search'
    | 'submit'
    | 'tel'
    | 'text'
    | 'time'
    | 'url'
    | 'week';

interface InputProps {
    defaultValue: string;
    type?: InputType;
    onChange: (text: string) => void;
    disabled?: boolean;
    readOnly?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

const Input: React.FC<InputProps> = ({
    defaultValue,
    type = 'text',
    onChange,
    disabled = false,
    readOnly = false,
    style,
    className = '',
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        onChange(event.target.value);
    };

    return (
        <input
            type={type}
            value={defaultValue}
            onChange={handleChange}
            disabled={disabled}
            readOnly={readOnly}
            style={style}
            className={className}
        />
    );
};

export default Input;
