import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  theme: {
      extend: {
        opacity: {
         '10': '0.1',
         '20': '0.2',
         '95': '0.95',
        }
      }
    } 
})

