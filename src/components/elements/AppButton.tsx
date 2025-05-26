import { Button } from '@chakra-ui/react';
import React, { MouseEventHandler } from 'react';

type AppButtonProps = {
    buttonText: string;
    onClick?: () => void;
    customBtnId?: string;
    variant?: 'solid' | 'subtle' | 'surface' | 'outline' | 'ghost' | 'plain';
    colorPalette?: string;
};

const AppButton: React.FC<AppButtonProps> = ({
    buttonText = '',
    onClick,
    customBtnId,
    variant = 'subtle',
    colorPalette = 'green',
}) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
        if (onClick) {
            e.preventDefault();
            onClick();
        }
    };
    const builtId = customBtnId ? customBtnId : buttonText.toLowerCase().replace(/\s/g, '-');
    return (
        <Button variant={variant} colorPalette={colorPalette} onClick={handleClick} key={builtId}>
            {buttonText}
        </Button>
    );
};

export default AppButton;
