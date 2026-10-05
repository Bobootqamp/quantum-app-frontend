# Quantum App（ハンズオン用テンプレート）

[`@qamposer/react`](https://github.com/QAMP-62/qamposer-react) の量子回路エディタを組み込んだフロントエンドのテンプレートです。
画面は回路エディタと、アプリを作るための空きスペースだけのシンプルな構成です。エディタで起きる量子操作やシミュレーション結果を使って、**自分なりの可視化やゲーム**を足して、量子のイメージを形にしていきましょう。

## はじめかた

必要なもの: Node.js 22.22.2 以上（推奨は 24 LTS）、pnpm 9 以上

```sh
pnpm install
pnpm dev          # http://localhost:5173
```

## 自分のアイデアを足す

`src/Experience.tsx` が自分のアプリを作る場所です。この中で `useQamposer()` を呼ぶと、回路エディタと同じ状態（今の回路、シミュレーション結果など）を読んだり、回路を操作したり（お題回路のセット、ゲートの挿入、測定の実行、undo など）できます。

ゲートの配置・移動・削除やシミュレーションの完了など「何かが起きた瞬間」は、`src/App.tsx` のコールバックに届きます。開発中はブラウザのコンソールに `[qamposer] circuit edit` のように表示されるので、まずは DevTools を開いて回路をいじってみてください。

使える情報と操作の一覧は [AGENTS.md](./AGENTS.md#qamposer-で使える情報と操作) にあります（IBM Bob などの Coding Agent もこのファイルを参照します）。

## Qiskit backend につなぐ（任意）

[quantum-app-backend](https://github.com/QAMP-62/quantum-app-backend) を起動したら、次のようにします。

```sh
cp .env.example .env.local   # VITE_QISKIT_BACKEND_URL=http://localhost:8080
pnpm dev                     # 起動中なら再起動する
```

「Set up and run」が Qiskit で実行されるようになります（ヘッダー右上のバッジが「Qiskit backend」になります）。

- `.env.local` を変えたら、`pnpm dev` を再起動してください。
- アプリを `http://localhost:5173` 以外で開くときは、バックエンド側の `CORS_ORIGINS` にそのアドレスを追加してください。

## チェック

```sh
pnpm check                    # lint + typecheck + test
```
