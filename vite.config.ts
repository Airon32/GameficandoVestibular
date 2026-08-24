import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            const moduleId = id.replace(/\\/g, '/');
            if (moduleId.includes('/node_modules/@firebase/firestore')) return 'firebase-firestore';
            if (moduleId.includes('/node_modules/@firebase/auth')) return 'firebase-auth';
            if (moduleId.includes('/node_modules/firebase/')) return 'firebase-core';
            if (moduleId.includes('/node_modules/react') || moduleId.includes('/node_modules/scheduler')) return 'react-vendor';
            if (moduleId.includes('/node_modules/motion') || moduleId.includes('/node_modules/framer-motion')) return 'motion-vendor';
            if (moduleId.includes('/node_modules/lucide-react')) return 'icons';
            if (moduleId.includes('/node_modules/katex')) return 'math-renderer';
            if (moduleId.includes('/src/config/rankVisualConfig')) return 'rank-visuals';
            if (moduleId.includes('/src/data/questionBank') || moduleId.includes('/src/data/studyGuidesData')) return 'learning-content';
            if (moduleId.includes('/src/components/SocialHub') || moduleId.includes('/src/components/UserProfileModal')) return 'social-ui';
            if (moduleId.includes('/src/components/StudyGuidesScreen') || moduleId.includes('/src/components/EducationalGameScreen')) return 'learning-ui';
            if (moduleId.includes('/src/components/InfiniteTrainingScreen') || moduleId.includes('/src/components/SimuladoScreen')) return 'training-ui';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
