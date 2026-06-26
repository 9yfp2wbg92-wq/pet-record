/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        // 罗小黑战记 — 森林绿（主 accent，替代 Impeccable 橙色）
        forest: {
          50: '#EEF4EF',
          100: '#D8E8DB',
          200: '#A8C9AE',
          300: '#8BB894',
          400: '#7BA587',
          500: '#5C8A68',
          600: '#4A7355',
          700: '#3A5C44',
          800: '#2B4633',
          900: '#1D3023',
        },
        // 暖木棕（温暖 accent，用于 Profile/Home）
        wood: {
          50: '#F8F3EB',
          100: '#F0E6D6',
          200: '#DDCFB8',
          300: '#C4A882',
          400: '#B09068',
          500: '#9A7B54',
          600: '#7D6342',
          700: '#5F4A31',
          800: '#423322',
          900: '#2B1F14',
        },
        // 琥珀金（灵力光晕，仅用于 AI/提醒高亮）
        amber: {
          50: '#FEF9EC',
          100: '#FCEFC6',
          200: '#F5DFA0',
          300: '#E8B44F',
          400: '#D99E2E',
          500: '#B87D1E',
          600: '#935F14',
          700: '#704312',
          800: '#4A2B0E',
          900: '#2E1A09',
        },
        // 湖蓝（次要强调，用于链接/次要按钮）
        lake: {
          50: '#EEF6F9',
          100: '#D4EAF1',
          200: '#A8D4E3',
          300: '#6BA3BE',
          400: '#4A8BA8',
          500: '#38708A',
          600: '#2D5A6E',
          700: '#244757',
          800: '#1C3541',
          900: '#13242D',
        },
        // 花粉粉（logo 主色调，用于导航激活态）
        bloom: {
          50: '#FEF5F6',
          100: '#FDE8EB',
          200: '#FAD0D6',
          300: '#F5A8B4',
          400: '#F08090',
          500: '#E85D72',
          600: '#D43D55',
          700: '#B12C43',
          800: '#932738',
          900: '#7A2433',
        },
        // 宣纸/墨色（表面和文字）
        paper: {
          50: '#FDFBF7',
          100: '#FBF8F2',
          200: '#F5F0E8',
          300: '#E8E0D2',
          400: '#D4C9B5',
          500: '#B8AA92',
          600: '#968A7C',
          700: '#5C5244',
          800: '#3D3226',
          900: '#2C2416',
        },
        surface: '#FBF8F2',
        background: '#F5F0E8',
        text: {
          primary: '#2C2416',
          secondary: '#5C5244',
          muted: '#968A7C',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans SC"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Nunito"', '"Noto Sans SC"', 'sans-serif'],
        number: ['"SF Mono"', '"Monaco"', '"Inconsolata"', 'monospace'],
      },
      borderWidth: {
        '2': '2px',
        '3': '3px',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(44,36,22,0.06)',
        'card': '0 1px 3px rgba(44,36,22,0.04)',
        'float': '0 8px 32px rgba(44,36,22,0.08)',
        'glow': '0 0 24px rgba(232,180,79,0.25)',
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
