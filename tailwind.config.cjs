/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			// fontFamily: {
			// 	'display': ['"Poiret One"', ...defaultTheme.fontFamily.sans],
			// },
			gridTemplateRows: {
				'layout': 'auto 1fr auto',
			},
			colors: {
				'primary': '#323c73',
				'secondary': '#2d3748',
				'tertiary': '#4a5568',
				'accent': '#ed8936',
				'accent-light': '#f6ad55',
				'accent-dark': '#dd6b20',
				'page': '#ffffff',
			},
			typography: theme => ({
				DEFAULT: {
					css: {
						'code::before': {
							content: 'none',
						},
						'code::after': {
							content: 'none',
						},
						'code': {
							color: '#942d00',
							backgroundColor: '#fff2eb',
							borderRadius: '0.25rem',
						},
						blockquote: {
							quotes: "none"
						}
					}
				}
			})
		},
		fontFamily: {
			'display': ['"Poiret One"', ...defaultTheme.fontFamily.sans],
			'body': ['"Castoro"', ...defaultTheme.fontFamily.serif],
			// 'mono': ['"Martian Mono"', ...defaultTheme.fontFamily.mono],
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		function ({ addVariant }) {
			addVariant('child', '& > *');
		}
	],
}
