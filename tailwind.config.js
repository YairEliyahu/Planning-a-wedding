const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Custom responsive breakpoints
      'mobile': {'max': '639px'},
      'tablet': {'min': '640px', 'max': '1023px'},
      'laptop-sm': {'min': '1024px', 'max': '1366px'}, // 14-inch laptops
      'laptop-md': {'min': '1367px', 'max': '1600px'}, // 15-inch laptops
      'desktop': {'min': '1024px'},
      'mobile-tablet': {'max': '1023px'},
      'tablet-desktop': {'min': '640px'},
      // Specific laptop sizes
      'laptop-14': {'min': '1280px', 'max': '1440px'},
      'laptop-15': {'min': '1441px', 'max': '1680px'},
    },
    extend: {
      fontFamily: {
        sans: ['Heebo', 'Assistant', 'sans-serif'],
        heebo: ['Heebo', 'sans-serif'],
        rubik: ['Rubik', 'sans-serif'],
        assistant: ['Assistant', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'hero-mobile': ['2rem', { lineHeight: '1.2' }],
        'hero-tablet': ['3.5rem', { lineHeight: '1.2' }],
        'hero-desktop': ['6rem', { lineHeight: '1.1' }],
        'title-mobile': ['1.5rem', { lineHeight: '1.3' }],
        'title-tablet': ['2.25rem', { lineHeight: '1.3' }],
        'title-desktop': ['3.5rem', { lineHeight: '1.2' }],
        'subtitle-mobile': ['1rem', { lineHeight: '1.4' }],
        'subtitle-tablet': ['1.25rem', { lineHeight: '1.4' }],
        'subtitle-desktop': ['1.5rem', { lineHeight: '1.5' }],
      },
      spacing: {
        'responsive-xs': 'clamp(0.25rem, 1vw, 0.5rem)',
        'responsive-sm': 'clamp(0.5rem, 2vw, 1rem)',
        'responsive-md': 'clamp(1rem, 3vw, 2rem)',
        'responsive-lg': 'clamp(1.5rem, 4vw, 3rem)',
        'responsive-xl': 'clamp(2rem, 5vw, 4rem)',
        'navbar-height': '4rem',
        'navbar-height-mobile': '3.5rem',
        // Laptop-specific spacing
        'laptop-sm': 'clamp(1rem, 2.5vw, 1.5rem)',
        'laptop-md': 'clamp(1.5rem, 3vw, 2rem)', 
        'laptop-lg': 'clamp(2rem, 4vw, 3rem)',
        'laptop-padding': 'clamp(1.5rem, 3vw, 2.5rem)',
        'laptop-margin': 'clamp(1rem, 2vw, 1.5rem)',
      },
      width: {
        'mobile': '100%',
        'tablet': '85vw',
        'desktop': '80vw',
        'content-mobile': '95vw',
        'content-tablet': '90vw',
        'content-desktop': '85vw',
      },
      maxWidth: {
        'mobile': '100%',
        'tablet': '768px',
        'desktop': '1200px',
        'content': '1400px',
      },
      height: {
        'screen-mobile': '100dvh', // Dynamic viewport height for mobile
        'screen-tablet': '100vh',
        'screen-desktop': '100vh',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'mobile': '0.5rem',
        'tablet': '0.75rem',
        'desktop': '1rem',
      },
      boxShadow: {
        'mobile': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'tablet': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'desktop': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'navbar': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.1)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#f3f4ff',
          100: '#e6e8ff',
          200: '#d1d4ff',
          300: '#a8aeff',
          400: '#7b82ff',
          500: '#4f56ff',
          600: '#2a31ff',
          700: '#0007ff',
          800: '#0006d1',
          900: '#0005a8',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ff4081', // Main pink color
          600: '#e91e63',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
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
      backdropBlur: {
        'navbar': '10px',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
        'colors-transform': 'color, background-color, border-color, text-decoration-color, fill, stroke, transform',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-custom': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-custom': 'pulse-custom 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
        'navbar': '1000',
        'modal': '2000',
        'tooltip': '3000',
      },
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for responsive utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.text-shadow': {
          textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-lg': {
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
        },
        '.text-shadow-none': {
          textShadow: 'none',
        },
        '.backdrop-blur-navbar': {
          backdropFilter: 'blur(10px)',
        },
        '.safe-area-top': {
          paddingTop: 'env(safe-area-inset-top)',
        },
        '.safe-area-bottom': {
          paddingBottom: 'env(safe-area-inset-bottom)',
        },
        '.content-auto': {
          contentVisibility: 'auto',
        },
        '.will-change-transform': {
          willChange: 'transform',
        },
        '.will-change-auto': {
          willChange: 'auto',
        },
      };
      addUtilities(newUtilities);
    }
  ],
};

