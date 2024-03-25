import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import style from "./Account.module.scss";

export default function ThemeSwitchButton() {
    const { resolvedTheme, setTheme } = useTheme();
    const [ isLoaded, setLoaded ] = useState(false);

    useEffect(() => setLoaded(true), []);

    if (!isLoaded)
        return null;

    function toggleTheme() {
        setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
    }

    return <button className={style.themeSwitchButton} onClick={toggleTheme}></button>
}