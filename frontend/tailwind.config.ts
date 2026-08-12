import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      /* ─── CropDoctor Design Tokens ─── */
      colors: {
        // Semantic status colors — THE color language of the app
        status: {
          healthy: {
            DEFAULT: "#22C55E",   // green-500
            light: "#DCFCE7",     // green-100
            dark: "#166534",      // green-800
          },
          caution: {
            DEFAULT: "#F59E0B",   // amber-500
            light: "#FEF3C7",     // amber-100
            dark: "#92400E",      // amber-800
          },
          danger: {
            DEFAULT: "#EF4444",   // red-500
            light: "#FEE2E2",     // red-100
            dark: "#991B1B",      // red-800
          },
          unknown: {
            DEFAULT: "#8B5CF6",   // violet-500
            light: "#EDE9FE",     // violet-100
            dark: "#5B21B6",      // violet-800
          },
        },

        // Brand
        brand: {
          50:  "#F0FDF4",
          100: "#DCFCE7",
          200: "#BBF7D0",
          300: "#86EFAC",
          400: "#4ADE80",
          500: "#22C55E",  // Primary
          600: "#16A34A",
          700: "#15803D",
          800: "#166534",
          900: "#14532D",
          950: "#052E16",
        },

        // Surface colors (dark-mode ready)
        surface: {
          DEFAULT: "#FFFFFF",
          secondary: "#F8FAFC",
          tertiary: "#F1F5F9",
          border: "#E2E8F0",
          dark: {
            DEFAULT: "#0F172A",
            secondary: "#1E293B",
            tertiary: "#334155",
            border: "#475569",
          },
        },

        // Text colors
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
          inverse: "#FFFFFF",
        },
      },

      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },

      fontSize: {
        // Farmer-friendly: larger base sizes
        "farmer-xs": ["0.875rem", { lineHeight: "1.25rem" }],     // 14px
        "farmer-sm": ["1rem", { lineHeight: "1.5rem" }],          // 16px
        "farmer-base": ["1.125rem", { lineHeight: "1.75rem" }],   // 18px
        "farmer-lg": ["1.25rem", { lineHeight: "1.875rem" }],     // 20px
        "farmer-xl": ["1.5rem", { lineHeight: "2rem" }],          // 24px
        "farmer-2xl": ["1.875rem", { lineHeight: "2.25rem" }],    // 30px
        "farmer-3xl": ["2.25rem", { lineHeight: "2.75rem" }],     // 36px
      },

      spacing: {
        // Touch-friendly spacing
        "touch": "48px",       // Minimum tap target (48dp)
        "touch-lg": "56px",    // Comfortable tap target
        "touch-xl": "64px",    // Large action buttons
      },

      borderRadius: {
        "card": "16px",
        "button": "12px",
        "badge": "999px",      // Pill shape
      },

      boxShadow: {
        "card": "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)",
        "button": "0 2px 8px rgba(34,197,94,0.3)",
        "button-hover": "0 4px 16px rgba(34,197,94,0.4)",
      },

      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
        "bounce-gentle": "bounceGentle 2s infinite",
        "scan": "scan 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceGentle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scan: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-4px) scale(1.02)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
