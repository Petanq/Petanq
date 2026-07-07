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
        // PetanQ-huisstijl. De token-namen (blauw/geel) zijn historisch van
        // het vorige "Le Bouliste.be"-ontwerp en zijn bewust niet hernoemd
        // om niet alle 45+ gebruiksplekken te moeten aanpassen — enkel de
        // hex-waarden zijn vervangen door de PetanQ-kleuren.
        blauw: { DEFAULT: "#1F1F1F", 2: "#2E2E2E", 3: "#3D3D3D" }, // PetanQ zwart
        rood: { DEFAULT: "#D62828", 2: "#E15252" }, // PetanQ rood
        geel: "#F4C430", // PetanQ goud
        paars: "#6d28d9",
        roze: "#be185d",
        groen: "#047857",
        oranje: "#c2410c",
        kamp: "#b45309",
        circuit: "#555555",
        licht: "#F5F5F5",
        donker: "#1F1F1F",
        grijs: "#555555",
        rand: "#e5e5e5",
      },
      fontFamily: {
        titel: ["var(--font-montserrat)", "sans-serif"],
        body: ["var(--font-montserrat)", "sans-serif"],
      },
      borderRadius: {
        kaart: "18px",
        knop: "10px",
        invoer: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
