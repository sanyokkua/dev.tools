import { ChangeEvent, FC, FormEvent, useCallback, useMemo, useState } from 'react';

export enum ValueType {
    String = 'string',
    Number = 'number',
    Boolean = 'boolean',
}

export type FormItemType = 'text' | 'email' | 'number' | 'checkbox';

export interface FormItem {
    itemKey: string; // unique identifier
    itemName: string; // label text
    itemType: FormItemType; // HTML <input> type
    isRequired?: boolean; // mark as required
}

export interface SubmittedField {
    itemKey: string;
    itemValue: string | number | boolean;
    itemType: ValueType;
}

export interface DynamicFormProps {
    items: FormItem[];
    submitLabel: string;
    onSubmit: (fields: SubmittedField[]) => void;
}

const AppGenericForm: FC<DynamicFormProps> = ({ items, submitLabel, onSubmit }) => {
    const initialValues = useMemo(
        () =>
            items.reduce<Record<string, string | boolean>>((acc, item) => {
                acc[item.itemKey] = item.itemType === 'checkbox' ? false : '';
                return acc;
            }, {}),
        [items],
    );

    const [values, setValues] = useState(initialValues);

    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, type, value, checked } = e.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }, []);

    const isFormValid = useMemo(() => {
        return items.every((item) => {
            if (!item.isRequired) {
                return true;
            }
            const val = values[item.itemKey];
            return item.itemType === 'checkbox' ? val === true : String(val).trim() !== '';
        });
    }, [items, values]);

    const handleSubmit = useCallback(
        (e: FormEvent) => {
            e.preventDefault();
            const payload: SubmittedField[] = items.map((item) => {
                const raw = values[item.itemKey];
                let itemType: ValueType;
                let itemValue: string | number | boolean;

                switch (item.itemType) {
                    case 'checkbox':
                        itemType = ValueType.Boolean;
                        itemValue = Boolean(raw);
                        break;
                    case 'number':
                        itemType = ValueType.Number;
                        itemValue = Number(raw);
                        break;
                    default:
                        itemType = ValueType.String;
                        itemValue = String(raw);
                }

                return { itemKey: item.itemKey, itemValue, itemType };
            });

            onSubmit(payload);
        },
        [items, values, onSubmit],
    );

    return (
        <form onSubmit={handleSubmit}>
            {items.map(({ itemKey, itemName, itemType, isRequired }) => (
                <div key={itemKey} style={{ marginBottom: 12 }}>
                    <label htmlFor={itemKey} style={{ display: 'block', fontWeight: 500 }}>
                        {itemName}
                        {isRequired && <span style={{ color: 'red' }}> *</span>}
                    </label>

                    {itemType === 'checkbox' ? (
                        <input
                            id={itemKey}
                            name={itemKey}
                            type="checkbox"
                            checked={Boolean(values[itemKey])}
                            onChange={handleChange}
                        />
                    ) : (
                        <input
                            id={itemKey}
                            name={itemKey}
                            type={itemType}
                            value={String(values[itemKey])}
                            onChange={handleChange}
                            required={isRequired}
                            style={{ padding: 6, width: '100%' }}
                        />
                    )}
                </div>
            ))}

            <button type="submit" disabled={!isFormValid}>
                {submitLabel}
            </button>
        </form>
    );
};

export default AppGenericForm;
