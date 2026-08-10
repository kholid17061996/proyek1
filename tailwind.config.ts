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
        emas: '#f8d21c',
        emasHover: '#d9b718',
        slate: '#04257c',
        slateHover: '#031c5e',
        terang: '#e2e8f0',
      },
    },
  },
  plugins: [],
};
export default config;
