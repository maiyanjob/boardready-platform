/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      colors: {
        tremor: {
          brand: {
            faint: '#06b6d4',
            muted: '#0891b2',
            subtle: '#0e7490',
            DEFAULT: '#0369a1',
            emphasis: '#075985',
            inverted: '#ffffff',
          },
          background: {
            muted: '#0f172a',
            subtle: '#1e293b',
            DEFAULT: '#0f172a',
            emphasis: '#334155',
          },
          border: {
            DEFAULT: '#334155',
          },
          ring: {
            DEFAULT: '#06b6d4',
          },
          content: {
            subtle: '#64748b',
            DEFAULT: '#cbd5e1',
            emphasis: '#f1f5f9',
            strong: '#ffffff',
            inverted: '#0f172a',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
