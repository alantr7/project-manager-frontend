import ReactDropdown from 'react-dropdown';
import style from './FilterDropdown.module.scss';
import { useEffect, useState } from 'react';
import { Option } from 'react-dropdown';
import { conditional } from '@/utils/conditional';

type FilterDropdownOptionType = string | FilterDropdownOption;

interface FilterDropdownOption {
    text: string,
    value?: string,
    onSelect?(): void
}

interface FilterDropdownProps<T extends FilterDropdownOptionType> {
    marginRight?: number,
    isTogglable?: boolean,
    disabled?: boolean,
    text: string,
    options?: T[],
    defaultValue?: T,
    onSelect?(opt: T): void,
    onDropdownRequest?(): void
}

export default function FilterDropdown<T extends FilterDropdownOptionType>(props: FilterDropdownProps<T>) {
    const [isActive, setActive] = useState(props.defaultValue !== undefined);

    useEffect(() => {
        setActive(props.defaultValue !== undefined);
    }, [props.defaultValue]);

    function handleChange(opt: Option) {
        if (props.isTogglable !== false) {
            setActive(true);
        }
        const result = props.options?.find(it => {
            if (typeof it === 'string')
                return it === opt.value;

            return (it.value !== undefined ? it.value : it.text) === opt.value;
        });

        (result as any).onSelect && (result as any).onSelect();
        props.onSelect && props.onSelect(result as T);
    }

    const options = props.options?.map<Option>(item => {
        if (typeof item === 'string')
            return {
                label: item,
                value: item
            }

        return {
            label: item.text,
            value: item.value !== undefined ? item.value : item.text
        };
    });



    return <ReactDropdown disabled={props.disabled || props.options === undefined} onChange={handleChange}
        className={`${style.dropdown} ${props.marginRight ? style.marginRight : ''} ${conditional(props.disabled, style.disabled)}`}
        placeholderClassName={`${style.selectButton} ${isActive ? style.active : ''}`}
        menuClassName={style.dropdownMenu} options={options || []}
        arrowClassName={style.arrow}
        onFocus={props.onDropdownRequest}
        value={`${props.text}`}
    />
}