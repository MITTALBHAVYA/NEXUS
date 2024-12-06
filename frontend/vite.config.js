import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port:5173,
    proxy:{
      '/api':{
        target:'http://13.232.79.28:8000/',
        changeOrigin:true,
        secure:false
      }
    }
  }
})
