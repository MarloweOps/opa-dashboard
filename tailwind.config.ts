import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:     "#134611",
        "forest-dark": "#0d3a0b",
        "forest-light": "#1a5c15",
        ink:        "#0D1B2A",
        porcelain:  "#FAF9F5",
        sage:       "#839788",
        "sage-light": "#A8B5AB",
        moss:       "#DEE3DC",
        terracotta: "#C4725F",
        honey:      "#D4A855",
      },
      fontFamily: {
        sans:  ["Inter", "sans-serif"],
        serif: ["Source Serif 4", "serif"],
        mono:  ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
