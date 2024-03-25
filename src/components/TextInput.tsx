import { ChangeEvent, KeyboardEvent, SyntheticEvent, useEffect, useRef, useState } from "react"

interface TextInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
    onEnterPress?(ev: KeyboardEvent, content: string): void;
    valueProvider?: string;
    valueSetter?(value: string): void;
}

export default function TextInput(props: TextInputProps) {
    const [value, setValue] = useState(props.value);
    const [cursor, setCursor] = useState<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => setValue(props.valueProvider), [props.valueProvider]);
    useEffect(() => {
        inputRef.current?.setSelectionRange(cursor, cursor);
    }, [ inputRef, cursor, value ]);

    function handleInput(e: SyntheticEvent) {
        const event = e.nativeEvent as InputEvent;
        if (props.valueSetter) {
            // setValue((event.target as HTMLInputElement).value);
            setCursor((event.target as HTMLInputElement).selectionStart);
            props.valueSetter((event.target as HTMLInputElement).value);
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

    return <input {...props} ref={inputRef} value={value} onChange={handleChange} onKeyDown={handleKeyDown} onInput={handleInput} />
}