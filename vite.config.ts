
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages 배포 시 레포지토리 이름이 URL에 포함되므로 베이스 경로 설정이 필요할 수 있습니다.
  // 예: https://user.github.io/repo-name/ 인 경우 '/repo-name/'
  // 여기서는 상대 경로로 설정하여 어디서든 작동하게 합니다.
  base: './',
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
