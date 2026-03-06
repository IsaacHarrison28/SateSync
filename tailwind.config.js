/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F2F2F7",
          dark: "#121212",
        },
        foreground: {
          DEFAULT: "#111827",
          dark: "#e5e7eb",
        },
        primary: {
          DEFAULT: "#2563eb",
          dark: "#60a5fa",
        },
        muted: {
          DEFAULT: "#8E8E93",
          dark: "#A0A0A0",
        },
        text: {
          DEFAULT: "#000000",
          dark: "#ffffff",
        },
        card: {
          DEFAULT: "#FFFFFF",
          dark: "#1F1F1F",
        },
      },
    },
  },
  plugins: [],
};
