/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./options/**/*.tsx"],
  theme: {
    extend: {}
  },
  plugins: [require("@tailwindcss/forms")]
}
