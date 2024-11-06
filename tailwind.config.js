/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	content: [
	  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		fontFamily: {
		  sans: ["Trip Sans"],
		  serif: ["ui-serif", "Georgia"],
		  mono: ["ui-monospace", "SFMono-Regular"],
		  display: ["Trip Sans Ultra"],
		  body: ["Trip Sans"],
		},
		colors: {
		  // Additional colors here if needed
		},
	  },
	},
	plugins: [require("tailwindcss-animate"), require("daisyui")],
	daisyui: {
	  themes: [
		{
		  customtheme: {
			primary: "#00deb6", // --brand-green
			secondary: "#1f233a", // --brand-purple
			accent: "#ff5d5d", // --brand-red
			neutral: "#e8edf4", // --gray-80
			"base-100": "#f8f6f4", // --white
			info: "#fee39a", // --yellow-80
			success: "#57a773", // --green-30
			warning: "#f19953", // --yellow-70
			error: "#ed6a5e", // --red-50
		  },
		},
	  ],
	},
  };
  