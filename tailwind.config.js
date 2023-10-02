/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [require('@tailwindcss/forms')],
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      backgroundImage: {
        noise: "url('http://assets.iceable.com/img/noise-transparent.png')",
      },
      colors: {
        comet: {
          50: '#f7f7f8',
          100: '#eeeff1',
          200: '#d5d8dd',
          300: '#bcc0c8',
          400: '#8a919f',
          500: '#586276',
          600: '#4f586a',
          700: '#424a59',
          800: '#353b47',
          900: '#2b303a',
        },
        main: '#2c323c',
        primary: '#586276',
        secondary: '#424a59',
        accent: '#bbed50',
      },
      screens: {
        full: '2160px',
      },
    },
  },
  plugins: [],
}

