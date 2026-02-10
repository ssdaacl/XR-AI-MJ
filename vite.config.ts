
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // base를 './'로 설정하면 깃허브 페이지의 서브 디렉토리 문제를 피할 수 있습니다.
  base: './',
  define: {
    // 빌드 시점에 환경 변수를 주입합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // 빌드 결과물이 깨지지 않도록 함
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
