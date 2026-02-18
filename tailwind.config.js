/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-primary": "#64CCC5",
        "brand-dark": "#04364A",
        "brand-secondary": "#176B87",
      },
    },
  },
  plugins: [],
};
