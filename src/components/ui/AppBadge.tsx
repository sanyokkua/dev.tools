import React from 'react';

type BadgeProps = { text: string };

const AppBadge: React.FC<BadgeProps> = (props) => {
    return <div className="badge">{props.text}</div>;
};

export default AppBadge;
