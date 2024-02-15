import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  // プロジェクトのルートディレクトリを指定 (オプショナル)
  root: path.resolve(__dirname, './'),

  // ビルドオプション
  build: {
    // 出力ディレクトリを指定
    outDir: path.resolve(__dirname, 'dist'),
    // 静的アセットの取り扱い
    assetsDir: 'assets',
    // Rollup オプション
    rollupOptions: {
      // エントリーポイントを指定
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      // 出力設定
      output: {
        // 依存関係のチャンク分割を行うか
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },

  // プラグイン設定 (必要に応じて)
  plugins: []
});
