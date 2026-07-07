import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        blauw: { DEFAULT: "#0b1f3a", 2: "#1a4480", 3: "#2563ae" },
        rood: { DEFAULT: "#c0392b", 2: "#e74c3c" },
        geel: "#f0b429",
        paars: "#6d28d9",
        roze: "#be185d",
        groen: "#047857",
        oranje: "#c2410c",
        kamp: "#b45309",
        circuit: "#64748b",
        licht: "#f4f6fa",
        donker: "#0b1220",
        grijs: "#64748b",
        rand: "#e2e8f0",
      },
      fontFamily: {
        titel: ["var(--font-bebas)", "sans-serif"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
