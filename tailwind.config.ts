import type { Config } from "tailwindcss";

const config = {
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
  			// Trust Blue Sistema (cores primárias Venlo)
  			'trust-blue': {
  				50: '#f8fafc',
  				100: '#f1f5f9',
  				200: '#e2e8f0',
  				300: '#cbd5e1',
  				400: '#94a3b8',
  				500: '#415A77',
  				600: '#334860',
  				700: '#1B263B',
  				800: '#12192a',
  				900: '#0D1B2A',
  			},
  			// Venlo Orange (ação e destaques)
  			'venlo-orange': {
  				50: '#fff7ed',
  				100: '#FFE6D5',
  				200: '#ffcc99',
  				300: '#ffb366',
  				400: '#ff9933',
  				500: '#FF6600',
  				600: '#cc5200',
  				700: '#993d00',
  				800: '#662900',
  				900: '#331400',
  			},
  			// Sistema Semântico
  			success: {
  				DEFAULT: '#10B981',
  				light: '#6EE7B7',
  				dark: '#047857',
  			},
  			warning: {
  				DEFAULT: '#F59E0B',
  				light: '#FCD34D',
  				dark: '#D97706',
  			},
  			error: {
  				DEFAULT: '#EF4444',
  				light: '#FCA5A5',
  				dark: '#DC2626',
  			},
  			info: {
  				DEFAULT: '#3B82F6',
  				light: '#93C5FD',
  				dark: '#2563EB',
  			},
  			// Gamificação
  			gold: '#FFD700',
  			silver: '#C0C0C0',
  			bronze: '#CD7F32',
  			// Shadcn UI Base
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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)',
  			'venlo': '8px',
  			'venlo-lg': '12px',
  			'2xl': '18px'
  		},
  		fontFamily: {
  			sans: ['Inter', 'system-ui', 'sans-serif'],
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem'
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
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
