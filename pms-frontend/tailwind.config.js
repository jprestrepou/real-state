/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './*.html',
        './pages/**/*.html',
        './assets/js/**/*.js',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0f4ff',
                    100: '#dbe4ff',
                    200: '#bac8ff',
                    300: '#91a7ff',
                    400: '#748ffc',
                    500: '#5c7cfa',
                    600: '#4c6ef5',
                    700: '#4263eb',
                    800: '#3b5bdb',
                    900: '#364fc7',
                },
                accent: {
                    50: '#e6fcf5',
                    100: '#c3fae8',
                    200: '#96f2d7',
                    300: '#63e6be',
                    400: '#38d9a9',
                    500: '#20c997',
                    600: '#12b886',
                    700: '#0ca678',
                    800: '#099268',
                    900: '#087f5b',
                },
                surface: {
                    50: '#f8f9fa',
                    100: '#f1f3f5',
                    200: '#e9ecef',
                    300: '#dee2e6',
                    400: '#ced4da',
                    500: '#adb5bd',
                    600: '#868e96',
                    700: '#495057',
                    800: '#343a40',
                    900: '#212529',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'card': '0 4px 24px 0 rgba(0, 0, 0, 0.06)',
                'card-hover': '0 8px 40px 0 rgba(0, 0, 0, 0.12)',
            },
            backdropBlur: {
                'glass': '10px',
            },
        },
    },
    plugins: [],
};
