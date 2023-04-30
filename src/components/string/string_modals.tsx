import React, {useState} from "react";
import {Input, Modal} from "antd";

type SubmitResult = {
    splitSymbol: string | null;
}

type SplitModalProps = {
    showModal: boolean;
    onSubmit: (submitResult: SubmitResult) => void;
}


export const SplitModal: React.FC<SplitModalProps> = (props: SplitModalProps) => {
    const [value, setValue] = useState("");
    const handleOk = () => {
        props.onSubmit({
            splitSymbol: value,
        });
    };

    const handleCancel = () => {
        props.onSubmit({
            splitSymbol: null,
        });
    };

    return (
        <Modal title="Type split symbol" open={props.showModal} onOk={handleOk} onCancel={handleCancel}>
            <Input placeholder="Basic usage" onChange={(e) => setValue(e.target.value)}/>
        </Modal>
    );
};

export default SplitModal;