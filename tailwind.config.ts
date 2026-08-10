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
        darkTeal: '#0f3a40', // new background color
        neonGreen: '#39ff14', // new button color
        neonGreenHover: '#32e612',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-out forwards',
        'float-up': 'floatUp 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        floatUp: {
          '0%': { transform: 'translateY(100vh) scale(0)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-100px) scale(1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
