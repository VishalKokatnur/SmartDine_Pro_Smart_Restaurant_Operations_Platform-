import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("smartdine-theme");

    return savedTheme === "dark" || savedTheme === "light"
      ? savedTheme
      : "light";
  });

  useEffect(() => {
    // Apply theme to the entire HTML document
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    // Also apply directly to body
    document.body.setAttribute(
      "data-theme",
      theme
    );

    // Save selected theme
    localStorage.setItem(
      "smartdine-theme",
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      return currentTheme === "dark"
        ? "light"
        : "dark";
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}