import useAutosizedTextArea from "@/hooks/useAutosizedTextarea";
import { ChangeEvent, KeyboardEvent, SyntheticEvent, useEffect, useRef, useState } from "react"

interface TextFieldProps extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
    onEnterPress?(ev: KeyboardEvent, content: string): void;
    valueProvider?: string;
    valueSetter?(value: string): void;
    autoResize?: boolean;
    maxLength?: number;
    maxRows?: number;
}

export default function TextField(props: TextFieldProps) {
    const [value, setValue] = useState(props.value);
    const [cursor, setCursor] = useState<number | null>(((value || '') as string).length - 1);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => setValue(props.valueProvider), [props.valueProvider]);
    useEffect(() => {
        inputRef.current?.setSelectionRange(cursor, cursor);
    }, [inputRef, cursor, value]);

    useAutosizedTextArea(inputRef.current, [inputRef, value], !props.autoResize);

    useEffect(() => {
        if (!props.autoFocus)
            return;

        setTimeout(() => {
            inputRef.current?.focus();
        }, 1);
    }, []);

    function handleInput(e: SyntheticEvent) {
        const event = e.nativeEvent as InputEvent;
        if (props.maxLength) {
            const value = (event.target as HTMLTextAreaElement).value;
            (event.target as HTMLTextAreaElement).value = value.substring(0, props.maxLength);
        }

        if (props.maxRows) {
            const value = (event.target as HTMLTextAreaElement).value;
            for (let i = 0, counter = 0; i < value.length; i++) {
                if (value[i] === '\n')
                    counter++;

                if (counter === props.maxRows) {
                    e.preventDefault();
                    return;
                }
            }
        }

        if (props.valueSetter) {
            // setValue((event.target as HTMLTextAreaElement).value);
            setCursor((event.target as HTMLTextAreaElement).selectionStart);
            props.valueSetter((event.target as HTMLTextAreaElement).value);
        }
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter" && props.onEnterPress)
            props.onEnterPress(e, value as string);
    }

    function handleChange(e: ChangeEvent) {
        // @ts-ignore
        setCursor(e.target.selectionStart);
    }

    return <textarea {...props} ref={inputRef} value={value} onChange={handleChange} onKeyDown={handleKeyDown} onInput={handleInput} />
}