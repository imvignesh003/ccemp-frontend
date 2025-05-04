
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				// New color palette
				raisin_black: {
					DEFAULT: '#262322',
					100: '#080707',
					200: '#0f0e0d',
					300: '#171514',
					400: '#1e1c1b',
					500: '#262322',
					600: '#544d4b',
					700: '#837874',
					800: '#ada5a2',
					900: '#d6d2d1'
				},
				caput_mortuum: {
					DEFAULT: '#63372c',
					100: '#140b09',
					200: '#271612',
					300: '#3b211b',
					400: '#4f2c23',
					500: '#63372c',
					600: '#955343',
					700: '#bb7867',
					800: '#d1a59a',
					900: '#e8d2cc'
				},
				burnt_sienna: {
					DEFAULT: '#c97d60',
					100: '#2c170f',
					200: '#582f1e',
					300: '#84462d',
					400: '#b05d3c',
					500: '#c97d60',
					600: '#d3977f',
					700: '#deb19f',
					800: '#e9cbbf',
					900: '#f4e5df'
				},
				melon: {
					DEFAULT: '#ffbcb5',
					100: '#570900',
					200: '#ad1100',
					300: '#ff1e05',
					400: '#ff6c5c',
					500: '#ffbcb5',
					600: '#ffc8c2',
					700: '#ffd6d1',
					800: '#ffe3e0',
					900: '#fff1f0'
				},
				almond: {
					DEFAULT: '#f2e5d7',
					100: '#452f16',
					200: '#8b5d2d',
					300: '#c68c4e',
					400: '#dcb993',
					500: '#f2e5d7',
					600: '#f5ebe0',
					700: '#f8f0e8',
					800: '#faf5f0',
					900: '#fdfaf7'
				},

				// Original theme colors
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				ccem: {
					purple: '#6E59A5',
					'light-purple': '#9b87f5',
					'soft-blue': '#D3E4FD',
					'soft-peach': '#FDE1D3',
					'neutral-gray': '#8E9196',
					'light-gray': '#f3f3f3',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					"0%": {
						opacity: "0",
						transform: "translateY(10px)"
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)"
					}
				},
				'fade-out': {
					"0%": {
						opacity: "1",
						transform: "translateY(0)"
					},
					"100%": {
						opacity: "0",
						transform: "translateY(10px)"
					}
				},
				'scale-in': {
					"0%": {
						transform: "scale(0.95)",
						opacity: "0"
					},
					"100%": {
						transform: "scale(1)",
						opacity: "1"
					}
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
