/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

/** Semantic colours are driven by CSS variables (see GlobalStyles.astro) so a
 *  single class toggle flips the entire palette between light and dark. The
 *  variables hold space-separated RGB channels so Tailwind's <alpha-value>
 *  opacity modifiers keep working. */
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;
/** Solid colour reference (no alpha placeholder) for arbitrary CSS values. */
const solid = (name) => `rgb(var(${name}))`;

const sans = ['"Inter"', ...defaultTheme.fontFamily.sans].join(', ');
const display = ['"Space Grotesk"', ...defaultTheme.fontFamily.sans].join(', ');

module.exports = {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			gridTemplateRows: {
				'layout': 'auto 1fr auto',
			},
			colors: {
				'bg': withVar('--bg'),
				'surface': withVar('--surface'),
				'elevated': withVar('--elevated'),
				'ink': withVar('--ink'),
				'muted': withVar('--muted'),
				'faint': withVar('--faint'),
				'line': withVar('--line'),
				'accent': withVar('--accent'),
				'accent-soft': withVar('--accent-soft'),
				// legacy aliases kept mapped so stray references don't break
				'page': withVar('--bg'),
				'primary': withVar('--ink'),
			},
			fontFamily: {
				'display': ['"Space Grotesk"', ...defaultTheme.fontFamily.sans],
				'sans': ['"Inter"', ...defaultTheme.fontFamily.sans],
				'body': ['"Inter"', ...defaultTheme.fontFamily.sans],
				'mono': ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
			},
			letterSpacing: {
				'tightest': '-0.04em',
			},
			maxWidth: {
				'content': '72rem',
			},
			keyframes: {
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(14px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'blink': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0' },
				},
				'float-slow': {
					'0%, 100%': { transform: 'translate(0, 0)' },
					'50%': { transform: 'translate(0, -10px)' },
				},
			},
			animation: {
				'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
				'blink': 'blink 1.1s step-end infinite',
				'float-slow': 'float-slow 7s ease-in-out infinite',
			},
			typography: () => ({
				mioi: {
					css: {
						'--tw-prose-body': solid('--ink'),
						'--tw-prose-headings': solid('--ink'),
						'--tw-prose-links': solid('--accent'),
						'--tw-prose-bold': solid('--ink'),
						'--tw-prose-counters': solid('--muted'),
						'--tw-prose-bullets': solid('--line'),
						'--tw-prose-hr': solid('--line'),
						'--tw-prose-quotes': solid('--muted'),
						'--tw-prose-quote-borders': solid('--accent'),
						'--tw-prose-captions': solid('--muted'),
						'--tw-prose-code': solid('--ink'),
						'--tw-prose-pre-code': '#e6e6e6',
						'--tw-prose-pre-bg': '#161618',
						'--tw-prose-th-borders': solid('--line'),
						'--tw-prose-td-borders': solid('--line'),
						maxWidth: 'none',
						fontFamily: sans,
						h1: { fontFamily: display, letterSpacing: '-0.03em', fontWeight: '600' },
						h2: { fontFamily: display, letterSpacing: '-0.02em', fontWeight: '600' },
						h3: { fontFamily: display, letterSpacing: '-0.01em', fontWeight: '600' },
						h4: { fontFamily: display, fontWeight: '600' },
						a: {
							textDecoration: 'none',
							borderBottom: `1px solid ${solid('--accent-soft')}`,
							transition: 'border-color 0.2s ease',
						},
						'a:hover': { borderBottomColor: solid('--accent') },
						'code::before': { content: 'none' },
						'code::after': { content: 'none' },
						code: {
							color: solid('--accent'),
							backgroundColor: solid('--accent-wash'),
							borderRadius: '0.3rem',
							padding: '0.15em 0.4em',
							fontWeight: '500',
							fontSize: '0.875em',
						},
						pre: {
							borderRadius: '0.6rem',
							border: `1px solid ${solid('--line')}`,
						},
						blockquote: {
							quotes: 'none',
							fontStyle: 'normal',
							fontWeight: '400',
							borderLeftWidth: '2px',
							paddingLeft: '1.25rem',
						},
					},
				},
			}),
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		function ({ addVariant }) {
			addVariant('child', '& > *');
		},
	],
};
