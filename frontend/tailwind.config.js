/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#121214",
        surface: "#1c1c22",
        surface2: "#26262e",
        stamp: "#FFD400",
        pop: "#FF4D6D",
        offwhite: "#F5F5F0",
        muted: "#8b8b93",
      },
      fontFamily: {
        display: ["'Anton'", "sans-serif"],
        body: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        stamp: "4px 4px 0px 0px rgba(255,212,0,1)",
        pop: "4px 4px 0px 0px rgba(255,77,109,1)",
      },
    },
  },
  plugins: [],
}
