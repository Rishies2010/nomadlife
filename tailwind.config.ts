import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./pages/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}","./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg:"#07070f",bg1:"#0d0d1f",bg2:"#12122a",bg3:"#1a1a3a",
        purple:"#7c3aed",violet:"#a78bfa",lavender:"#c4b5fd",pink:"#e879f9",neon:"#8b5cf6",
        nmtext:"#f0edff",muted:"#a09cc0",subtle:"#6b6890",success:"#34d399",warning:"#fbbf24",
      },
      fontFamily: {
        sans:    ["Inter","sans-serif"],
        display: ["Space Grotesk","sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
