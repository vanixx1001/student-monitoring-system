import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme") as Theme | null;
            if (saved) return saved;
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return "dark";
    });

    useEffect(() => {
        const root = document.documentElement;

        // I-apply ang active class sa <html>
        if (theme === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);

        // Makinig sa pagbabago mula sa ibang pages o tabs
        const handleStorageChange = (e: StorageEvent) => {
            if (
                e.key === "theme" &&
                (e.newValue === "light" || e.newValue === "dark")
            ) {
                setTheme(e.newValue);
            }
        };

        const handleCustomThemeChange = (e: CustomEvent<Theme>) => {
            setTheme(e.detail);
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("theme-change" as any, handleCustomThemeChange);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "theme-change" as any,
                handleCustomThemeChange,
            );
        };
    }, [theme]);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("theme", nextTheme);

        // I-broadcast sa buong application
        window.dispatchEvent(
            new CustomEvent("theme-change", { detail: nextTheme }),
        );
    };

    return { theme, toggleTheme };
}
