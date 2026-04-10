/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#FAF9F6',      // Warm Off-White (Professional, calm)
                primary: '#7ACB7A',         // Primary Green
                secondary: '#4CAF50',       // Secondary Green
                accent: '#2F6B3F',          // Dark Green Text (used for emphasis)
                surface: '#FFFFFF',          // White surface for cards
                eco: {
                    light: '#E8F5E9',         // Very light green for subtle backgrounds
                    dark: '#1B5E20',          // Deep green for contrasts
                },
                text: {
                    primary: '#1F2937',       // Primary Text
                    secondary: '#6B7280',     // Secondary Text
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
            },
            borderRadius: {
                'card': '1.5rem',           // Consistent card rounding
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'leaf-sway': 'sway 3s ease-in-out infinite alternate',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                sway: {
                    '0%': { transform: 'rotate(-5deg)' },
                    '100%': { transform: 'rotate(5deg)' },
                }
            }
        },
    },
    plugins: [],
}
