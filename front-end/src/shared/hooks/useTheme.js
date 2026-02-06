import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem("fyd_theme") || "dark";
    });

    useEffect(() => {
        if (theme === "light") {
            document.body.classList.add("light");
        } else {
            document.body.classList.remove("light");
        }
        localStorage.setItem("fyd_theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return { theme, toggleTheme, setTheme };
}
