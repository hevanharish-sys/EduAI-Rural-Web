const path = require("path");

module.exports = {
  content: [
    path.join(__dirname, "index.html"),
    path.join(__dirname, "src/**/*.{js,jsx,ts,tsx}")
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        accent: "#00B894",
        soft: "#F7F6FF"
      }
    }
  },
  plugins: []
};
