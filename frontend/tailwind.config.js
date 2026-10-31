/** @type {import('tailwindcss').Config} */
// Tailwind 3. Requiere "type": "module" en package.json (proyecto Vite estándar).
export default {
  content: ['./index.html', './src/**/*.{vue,ts,js}'],
  // El modo oscuro se activa con la clase "dark" en <html>, no con la preferencia del sistema.
  darkMode: 'class',
  theme: {
    extend: {
      // Cada color apunta a una variable CSS definida en src/assets/main.css.
      // <alpha-value> permite usar opacidad, por ejemplo bg-primary/20.
      colors: {
        app: 'rgb(var(--color-app) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-alt': 'rgb(var(--color-surface-alt) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        fg: 'rgb(var(--color-fg) / <alpha-value>)',
        'fg-muted': 'rgb(var(--color-fg-muted) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        // texto sobre fondos primary, success, warning o danger
        'on-accent': 'rgb(var(--color-on-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
