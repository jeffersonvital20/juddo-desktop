/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        judoo: {
          blue: '#0052cc',
          blueDark: '#0747a6',
          white: '#ffffff',
          red: '#de350b',
          gold: '#ffab00',
        }
      }
    },
  },
  plugins: [],
}
