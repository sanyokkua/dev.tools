import React from 'react';

interface ButtonProps {
    name: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    style?: React.CSSProperties;
    className?: string;
    disabled?: boolean;
}

const AppButton: React.FC<ButtonProps> = ({ name, onClick, style, disabled = false, className = '' }) => {
    return (
        <button onClick={onClick} style={style} disabled={disabled} className={className}>
            {name}
        </button>
    );
};

export default AppButton;
