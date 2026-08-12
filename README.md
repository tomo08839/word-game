# 早押しワードゲーム

Vite + React で動く早押しワードゲームのプロトタイプです。
単語の実在判定は `/api/check-word` という Vercel サーバー関数を経由して
Jisho.org / Wiktionary に問い合わせます（ブラウザから直接叩くとCORSで
失敗しやすいため、サーバー経由にしています）。

## ローカルで動かす

`npm run dev`（Viteだけ）では `/api/check-word` が存在しないため、
単語判定は常にオフライン（ローカル辞書のみ）になります。
API込みで動作確認したい場合は Vercel CLI を使ってください。

```bash
npm install
npm i -g vercel      # 未インストールの場合
vercel dev           # /api も含めてローカルで再現できる
```

## ビルド

```bash
npm run build
npm run preview
```

## デプロイ

GitHubにpushしてVercelでリポジトリをImportするだけで、
`/api/check-word.js` は自動的にサーバー関数として認識されます。
