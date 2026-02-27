import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ember: "#ff2a2a",
        flame: "#ff7a00",
        spark: "#ffc400",
        coal: "#0a0a0a",
        smoke: "#2a2a2a"
      },
      fontFamily: {
        heading: ["Orbitron", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 20px rgba(255,122,0,.45)",
        ember: "0 0 30px rgba(255,42,42,.4)"
      },
      backgroundImage: {
        "flame-gradient": "linear-gradient(135deg, #ff2a2a, #ff7a00, #ffc400)"
      }
    }
  },
  plugins: []
} satisfies Config;
