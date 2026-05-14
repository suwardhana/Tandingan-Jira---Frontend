import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import aspectRatio from "@tailwindcss/aspect-ratio";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        // Jira design tokens
        jira: {
          blue: "#0052CC",
          "blue-hover": "#0747A6",
          "blue-light": "#DEEBFF",
          sidebar: "#0747A6",
          "sidebar-hover": "#1C3D6E",
          "sidebar-active": "#2A5295",
          green: "#36B37E",
          "green-dark": "#00875A",
          red: "#FF5630",
          "red-dark": "#DE350B",
          yellow: "#FFAB00",
          "yellow-dark": "#FF991F",
          teal: "#00B8D9",
          purple: "#6554C0",
        },
        // Jira surface colors
        surface: {
          DEFAULT: "#F4F5F7",
          hover: "#EBECF0",
          raised: "#FFFFFF",
          dark: "#1E293B",
        },
        // Jira text hierarchy
        text: {
          primary: "#172B4D",
          secondary: "#5E6C84",
          subtle: "#8993A4",
          link: "#0052CC",
        },
        // Preserve existing dark theme
        dark: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
        },
      },
      boxShadow: {
        card: "0 1px 1px rgba(9, 30, 66, 0.12), 0 0 1px rgba(9, 30, 66, 0.12)",
        "card-hover": "0 2px 4px rgba(9, 30, 66, 0.12), 0 0 1px rgba(9, 30, 66, 0.2)",
        "card-dragging": "0 8px 16px rgba(9, 30, 66, 0.16), 0 0 1px rgba(9, 30, 66, 0.2)",
        modal: "0 8px 32px rgba(9, 30, 66, 0.2)",
        dropdown: "0 4px 8px rgba(9, 30, 66, 0.12)",
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      spacing: {
        18: "4.5rem",
      },
      borderRadius: {
        card: "3px",
      },
    },
  },
  plugins: [forms, typography, aspectRatio],
};
