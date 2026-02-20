/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",           // ルート直下のファイルも含める
    "./components/**/*.{js,ts,jsx,tsx}" // components 配下も含める
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
