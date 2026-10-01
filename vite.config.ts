import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/AutomanagerWeb/',
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'EXPO_PUBLIC_'],
})


