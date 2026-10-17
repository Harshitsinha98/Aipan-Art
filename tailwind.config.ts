import type { Config } from "tailwindcss";

/**
 * Palette is taken from the craft itself, not a trend board:
 *  geru    – the red-ochre clay wash Aipan is drawn on
 *  biswar  – the rice-paste white the lines are drawn with
 *  kajal   – lamp-black ink
 *  pine    – deodar forest green (the yarn in the green/cream beanie)
 *  haldi   – turmeric yellow (sunshine tote)
 *  himal   – Himalayan winter blue (the blue rib beanie)
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        geru: {
          50: "#FBEDE8",
          100: "#F3D2C7",
          300: "#D7826B",
          500: "#B03E26",
          600: "#9B2D20",
          700: "#7E2218",
          900: "#4A130D",
        },
        biswar: {
          DEFAULT: "#F4ECDF",
          50: "#FBF8F2",
          200: "#EADFCB",
          300: "#DCCDB2",
        },
        kajal: { DEFAULT: "#1C1916", 600: "#3A342E", 400: "#6B625A", 300: "#958B80" },
        pine: { DEFAULT: "#1E3A2C", 300: "#5B7A66", 700: "#132619" },
        haldi: { DEFAULT: "#E6A92C", 200: "#F6DFA6" },
        himal: { DEFAULT: "#8EA8C3", 700: "#3F5E80" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        deva: ["var(--font-deva)", "serif"],
      },
      fontSize: {
        "mega": ["clamp(3.4rem, 10vw, 9.5rem)", { lineHeight: "0.88", letterSpacing: "-0.035em" }],
        "huge": ["clamp(2.5rem, 6vw, 5.25rem)", { lineHeight: "0.95", letterSpacing: "-0.03em" }],
      },
      borderRadius: { blob: "46% 54% 52% 48% / 55% 45% 55% 45%" },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        sway: { "0%,100%": { transform: "rotate(-3deg)" }, "50%": { transform: "rotate(3deg)" } },
      },
      animation: {
        marquee: "marquee 38s linear infinite",
        sway: "sway 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
