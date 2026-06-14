import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#251917",
        lotus: "#8b1e1e",
        oxblood: "#4d100f",
        jade: "#225d55",
        bronze: "#7b5a43",
        antique: "#c6a664",
        parchment: "#f6efe7",
        mist: "#fcfaf7",
        sand: "#e6d7c5",
        silk: "#f8fafc",
        forest: "#203e39",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(77, 16, 15, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
