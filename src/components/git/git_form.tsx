import {Button, Checkbox, Form, Input, Space} from "antd";
import React from "react";

type GitFormProps = {
    onSubmit: (result: GitFormResult) => void;
    onReset: () => void;
    isGlobal: boolean;
};

export type GitFormResult = {
    username: string;
    userEmail: string;
    isGlobalConfig: boolean;
};

export const GitForm: React.FC<GitFormProps> = (props: GitFormProps) => {
    const [form] = Form.useForm();
    const onFinish = (values: any): void => {
        const result: GitFormResult = {
            username: values["username"],
            userEmail: values["email"],
            isGlobalConfig: values["global_config"],
        };
        props.onSubmit(result);
    };
    const onReset = () => {
        form.resetFields();
        props.onReset();
    };

    return (
        <Form form={form} onFinish={onFinish} initialValues={{username: "", email: "", global_config: props.isGlobal}}
              labelCol={{span: 2}}
              wrapperCol={{span: 8}}>
            <Form.Item label="Username" name="username"
                       rules={[{required: true, message: "Please input your username!"}]}>
                <Input/>
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{required: true, message: "Please input your email!"}]}>
                <Input/>
            </Form.Item>

            <Form.Item name="global_config" valuePropName="checked">
                <Checkbox>Global config</Checkbox>
            </Form.Item>

            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        Generate commands
                    </Button>
                    <Button htmlType="button" onClick={onReset}>
                        Reset
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};