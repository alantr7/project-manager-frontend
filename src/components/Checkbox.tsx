import { CSSProperties, useState } from 'react';
import style from '../components/Checkbox.module.scss';

type CheckboxAlignment = "top" | "center" | "bottom";

interface CheckboxProps {
    checked?: boolean,
    className?: string,
    style?: CSSProperties,
    disabled?: boolean,
    align?: CheckboxAlignment,
    setChecked?(checked: boolean): void
}

export default function Checkbox(props: CheckboxProps) {

    const { checked, setChecked, disabled } = props;
    const alignmentClass = props.align === "top" ? style.top : props.align === "bottom" ? style.bottom : "";

    function toggle() {
        if (props.disabled)
            return;

        if (setChecked) {
            setChecked(!checked);
        }
    }

    return <div className={`${style.checkbox} ${checked ? style.checked : ''} ${alignmentClass} ${props.className} ${disabled ? style.disabled : ''}`} style={props.style} onClick={toggle}></div>;

}