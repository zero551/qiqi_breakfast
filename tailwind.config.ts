import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#F0F7FF",
        butter: "#D6E8FF",
        yolk: "#4A9FFF",
        toast: "#8FB8E8",
        cocoa: "#1E3A5C",
        berry: "#FF7B89",
        leaf: "#7FB069",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        kid: ["'Baloo 2'", "'PingFang SC'", "'Microsoft YaHei'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
