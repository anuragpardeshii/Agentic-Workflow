/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "node_modules/flowbite-react/lib/esm/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          950: "#10002B",
          900: "#240046",
          800: "#3C096C",
          700: "#5A189A",
          600: "#7B2CBF",
          500: "#9D4EDD",
          400: "#C77DFF",
          300: "#E0AAFF",
        },
      },
      backgroundImage: {
        "dot-pattern":
          "radial-gradient(rgba(192, 132, 252, 0.15) 2px, transparent 2px)",
      },
      backgroundSize: {
        "dot-spacing": "24px 24px",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
