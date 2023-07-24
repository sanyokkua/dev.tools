import {Transfer} from "antd";
import React, {useEffect, useState} from "react";
import {GenericButton} from "@/components/common_controls";

export interface RecordType {
    key: string; // ID
    title: string; // Displayed name
    description: string; // Description if available
    chosen: boolean; // Default value for chosen item
}

type GenericTransferProps = {
    title: string;
    availableRecords: string[];
    onRecordsChosen: (values: string[]) => void;
};

export const GenericTransfer: React.FC<GenericTransferProps> = (props: GenericTransferProps) => {
    const [inputData, setInputData] = useState<RecordType[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);

    const getInputData = () => {
        const tempData: RecordType[] = [];
        props.availableRecords.forEach(value => {
            tempData.push({
                key: value,
                title: value,
                description: "",
                chosen: false,
            });
        });
        setInputData(tempData);
    };

    useEffect(() => {
        getInputData();
    }, []);

    const filterOption = (inputValue: string, option: RecordType) => {
        return option.key.trim().includes(inputValue);
    };
    const handleChange = (newTargetKeys: string[]) => {
        setTargetKeys(newTargetKeys);
    };

    return (
        <>
            <br/>
            <h3>{props.title}</h3>
            <Transfer
                dataSource={inputData}
                showSearch
                filterOption={filterOption}
                targetKeys={targetKeys}
                onChange={handleChange}
                oneWay={true}
                render={(item) => item.title}
                listStyle={{
                    width: 400,
                    height: 300,
                }}
            />
            <br/>
            <GenericButton label={"Submit"} type={"primary"} onClick={() => {
                props.onRecordsChosen(targetKeys);
            }}/>
            <br/>
        </>
    );
};