# AGENTS.md

AI エージェント（および人間の開発者）が本リポジトリで作業する際のガイドです。

## プロジェクト概要

量子コンピュータのハンズオン用テンプレートです。参加者はこれを出発点に、[`@qamposer/react`](https://github.com/QAMP-62/qamposer-react) の回路エディタで起きる量子操作やシミュレーション結果を使って、自分のアイデアのゲームや Web アプリを作ります。

- React 19 + TypeScript + Vite、量子回路エディタは `@qamposer/react` 0.3 系
- Node.js 22.22.2 以上（推奨は 24 LTS、`.node-version` 参照）、パッケージマネージャは **pnpm のみ**（npm / yarn は使わない）

## Git 操作について（重要）

**エージェントは `git add` / `git commit` / `git push` などの書き込み操作を行わないこと。** ステージとコミットはすべてユーザーが行います。変更後は作業ツリーをそのままにして、何を変えたかを報告してください（`git status` / `git diff` など読み取りだけの操作は可）。

## ディレクトリ構成

```
src/
  main.tsx               エントリポイント（index.html から読み込み）
  App.tsx                QamposerProvider・画面レイアウト・イベントのコールバック
  Experience.tsx         ★参加者のアプリ本体（ここを置き換えて作る）
  App.css                レイアウト。色は Qamposer のテーマ変数 --qamposer-* に追従
  qamposer/adapters.ts   シミュレーション方式の選択（ブラウザ / Qiskit backend）
  lib/probabilities.ts   counts → 確率 の変換ユーティリティ
tests/                   Vitest（*.test.ts / *.test.tsx、jsdom 環境）
  qamposer.test.tsx      このテンプレートが前提にしている @qamposer/react の挙動（ライブラリ更新時の確認用）
```

## 仕組み

`App.tsx` が画面全体を `<QamposerProvider>` で包み、その中に `<Experience />`（参加者のアプリ）と `<QamposerMicro />`（回路エディタ）を並べています。エディタと参加者のコンポーネントは**同じ状態を共有**しています。

- **今の状態を画面に出したい・回路を操作したい** → `Experience` などのコンポーネントの中で `useQamposer()` を使う
- **何かが起きた瞬間に反応したい**（効果音、スコア加算、チュートリアルの進行など） → `App.tsx` のコールバック（`handleCircuitEdit` など）に書く。`useState` の setter を呼びたい場合は、コールバックをコンポーネントの中で定義してかまいません（Qamposer は常に最新の関数を呼びます）

開発モードでは、すべてのイベントがブラウザのコンソールに `[qamposer] circuit edit` などと出力されます。DevTools で中身を確認しながら実装してください。

## Qamposer で使える情報と操作

### `useQamposer()` で読める状態

| 値 | 内容 |
| --- | --- |
| `circuit` | 現在の回路 `{ qubits, gates: Gate[] }` |
| `result` | 最新のシミュレーション結果 `{ counts, execution_time, qsphere? }`。回路が空なら `null` |
| `resultSource` | `result` を作ったのが `"realtime"`（編集のたびの自動実行）か `"run"`（ボタン / `simulate()`）か |
| `status` / `error` | `"idle"` / `"simulating"` / `"error"` と、そのときのエラー |
| `qasmCode` / `exportQasm()` | 回路の OpenQASM 2.0 ソース |
| `canUndo` / `canRedo` | undo / redo できるか |
| `canSimulate` / `adapterStatus` | シミュレーションを実行できるか（`"checking"` / `"available"` / `"unavailable"`） |
| `config` | `{ maxQubits, maxGates, maxShots, realtimeShots }` |

### `useQamposer()` で呼べる操作

| 操作 | 内容 |
| --- | --- |
| `setCircuit(circuit)` | 回路をまるごと置き換える（お題の出題、ステージの読み込み、リセット） |
| `insertGate({ type, qubit / control, target, parameter }, column)` | 指定した列にゲートを挿入する（重なるゲートは右にずれる）。新しいゲートの id を返す |
| `moveGate(id, { row, column })` / `removeGate(id)` / `updateGate(id, updates)` | ゲートの移動・削除・変更 |
| `addQubit()` / `removeQubit(index?)` / `setQubits(n)` / `clearCircuit()` | 量子ビット数の変更、回路のクリア |
| `undo()` / `redo()` | 元に戻す / やり直し |
| `importQasm(code)` | OpenQASM 2.0 から回路を読み込む |
| `simulate(shots?)` | 好きなタイミングでシミュレーションを実行する（「測定」ボタンなど）。結果は Promise で返り、`result` にも入る |

### コールバック（`App.tsx` の `QamposerProvider` に渡しているもの）

| コールバック | いつ | 主なペイロード |
| --- | --- | --- |
| `onCircuitEdit` | 編集のたびに1回 | `action`（`add` / `move` / `remove` / `update` / `undo` / `redo` / `add-qubit` / `remove-qubit` / `clear` / `set` / `import` / `code`）、`origin`（`pointer` / `keyboard` / `code` / `api`）、`gateId`、`from` / `to`、`displaced`（押し出されたゲート）、`reverts`、`changes`（`added` / `removed` / `updated` / `qubits`）、`before` / `after` |
| `onSimulationStart` | シミュレーション開始 | `source`、`circuit`、`qasm` |
| `onSimulationComplete` | シミュレーション完了 | `result`、`source`、`circuit`、`qasm` |
| `onSimulationError` | シミュレーション失敗（backend に接続できない等） | `error`、`source`、`circuit`、`qasm` |
| `onResultChange` | 表示中の結果が変わったとき（クリアも含む） | `result`（または `null`）、`source`、`reason`（`simulation` / `empty-circuit` / `clear` / `remove-qubit`） |

### データの形

- `Gate` は `{ id, type: 'H'|'X'|'Y'|'Z'|'CNOT'|'RX'|'RY'|'RZ', qubit?, control?, target?, parameter?, position }` です。1量子ビットゲートは `qubit` を、CNOT は `control` / `target` を、回転ゲートは `parameter`（ラジアン）を使います。`position` は列番号です。
- `result.counts` は測定結果のビット列ごとの回数です。ビット列は**右端が q0**（Qiskit と同じリトルエンディアン）。確率にしたいときは `countsToProbabilities(result.counts)`（`src/lib/probabilities.ts`）が使えます。
- `result.qsphere` は各基底状態の `{ state, x, y, z, probability, phase }`（Q スフィア上の座標・確率・位相）です。**ブラウザ内シミュレーションで 5 量子ビット以下のとき**だけ入ります。
- 自動シミュレーション（`realtime`）は理想シミュレーション（ノイズなし）で、既定は 1024 shots です（`config.realtimeShots` で変更可）。回路が空のときは実行されません。
- 回路を組み立てるときは `createDefaultCircuit(qubits)`、`qasmToCircuit(code)`、`circuitToQasm(circuit)`、`generateGateId()`、`diffCircuits(before, after)` も使えます。

### 実装パターンの例

- **お題回路を出す・リセットする**: `setCircuit({ qubits: 2, gates: [...] })` または `importQasm(qasm)`。各ゲートの `id` は `generateGateId()` で作る
- **結果に応じて表示を変える**: `const { result } = useQamposer();` から `result.counts` を見て描画する
- **自分のボタンで測定する**: `await simulate(100)` の戻り値を使う（「Set up and run」と同じく `source: "run"` として扱われる）
- **ゲームのルール**: `onCircuitEdit` で `action === "add"` の `changes.added` を見てスコアを付ける
- **許可しない操作を取り消す**: `onCircuitEdit` の中で `setCircuit(event.before)` を呼ぶ。この取り消し自体も `action: "set"`, `origin: "api"` の編集として再び通知されるので、**必ず `if (event.origin === "api") return;` を先頭に入れてループを防ぐ**こと（`tests/qamposer.test.tsx` 参照）。`undo()` でも戻せますが、redo で戻せてしまいます

### ライブラリでできないこと（無理に実装しない）

- 使えるゲートは H / X / Y / Z / RX / RY / RZ / CNOT の 8 種類で固定です。パレットの一部を隠したり、独自のゲートを追加したりする API はありません（制限したい場合は上の `undo()` などで対応する）。
- 状態ベクトル（複素振幅）は取得できません。位相を含む情報は `qsphere`（5 量子ビット以下）が上限です。
- 量子ビット数の既定の上限は 5 です（`QamposerProvider` の `config={{ maxQubits }}` で変更可）。
- テーマ（ライト / ダーク）は `<html>` の CSS 変数と `localStorage` の `qamposer-theme` で管理されます。
- Run ダイアログに表示される「Real Hardware（Coming soon）」は、まだ使えません。

## @qamposer/react の主なコンポーネント

| API | 用途 |
| --- | --- |
| `QamposerProvider` | 状態の本体。コールバックや `config` はここに渡す |
| `QamposerMicro` | 軽量な回路エディタ（本テンプレートで使用）。Provider の中では Provider の状態を使い、Provider 向けの props は無視される（警告が出る） |
| `Qamposer`（`@qamposer/react/visualization`） | ヒストグラム・Q スフィア付きのフル版（plotly が必要。追加する場合は `plotly.js-basic-dist-min@^3` と `react-plotly.js@^2.6` を入れる） |
| `CircuitEditor` / `Operations` / `SimulationControls` / `CodeEditor` | エディタの部品。Provider の中に好きなレイアウトで置ける |
| `localAdapter()` / `qiskitAdapter(url)` / `noopAdapter` | シミュレーションの実行先 |

型定義の実体は `node_modules/@qamposer/react/dist/*.d.ts` にあります。迷ったらここを読んでください。

## Qiskit backend への接続（任意）

既定では、すべてのシミュレーションがブラウザ内（`localAdapter`）で動きます。[quantum-app-backend](https://github.com/QAMP-62/quantum-app-backend) を起動して `.env.local` に URL を書くと、「Set up and run」と `simulate()` が Qiskit で実行されます（編集のたびの自動シミュレーションは引き続きブラウザ内）。

```sh
# quantum-app-backend 側
uv sync
uv run uvicorn backend.main:app --host 0.0.0.0 --port 8080 --reload

# このアプリ側
cp .env.example .env.local   # VITE_QISKIT_BACKEND_URL=http://localhost:8080
pnpm dev                     # 起動中なら再起動する
```

- **`.env.local` を変えたら `pnpm dev` を再起動する**こと。Vite は環境変数を起動時にしか読みません。
- **CORS**: ブラウザから直接バックエンドにリクエストするため、バックエンドの `CORS_ORIGINS`（既定値 `["http://localhost:5173"]`）にこのアプリのオリジンが含まれている必要があります。5173 番が使用中で別のポートで起動した場合や、別ホストで公開する場合は、バックエンド側に追加してください。許可されていないと Run が失敗し、`onSimulationError` が呼ばれます。
- URL 末尾の `/` は `src/qamposer/adapters.ts` で取り除いているので、付けても付けなくてもかまいません。
- ヘッダー右上のバッジ（Browser simulator / Qiskit backend）で、現在のモードを確認できます。

## 必須チェック（変更後に必ず実行）

コードを変更したら、作業完了を報告する前に以下をすべて実行し、成功することを確認してください。

```sh
pnpm biome check --write .   # lint + format + import 整理（自動修正）
pnpm tsc --noEmit            # 型チェック
pnpm vitest run              # テスト
```

まとめて実行する場合は `pnpm check`（lint + typecheck + test）を使えます。
失敗したチェックを無視・スキップしないでください。`biome-ignore` や `@ts-expect-error` での回避は、理由をコメントで明記できる場合に限ります。

## 主なスクリプト

| コマンド | 内容 |
| --- | --- |
| `pnpm dev` | Vite 開発サーバー起動 |
| `pnpm build` | 型チェック後に Vite で本番ビルド（`dist/`） |
| `pnpm test` / `pnpm test:ui` / `pnpm test:coverage` | テスト実行 / UI / カバレッジ |
| `pnpm lint` / `pnpm lint:fix` | Biome lint / 自動修正 |
| `pnpm format` | Biome フォーマット |
| `pnpm typecheck` | `tsc --noEmit` |

## 開発ルール

- TypeScript は `strict` 有効。`any` は避け、未使用の変数・引数を残さない（`noUnusedLocals` / `noUnusedParameters`）。
- フォーマットは Biome に従う（スペース 2、行幅 100）。手動で整形ルールを変えない。
- 新しいロジックには `tests/` にテストを追加する。

## 依存関係とサプライチェーンセキュリティ

pnpm 11 では `.npmrc` のセキュリティ設定が読まれないため、**有効な設定は `pnpm-workspace.yaml`** にあります（`.npmrc` は pnpm 9/10 向けの互換用）。変更する場合は両方を揃えてください。

- `minimumReleaseAge: 20160` … 公開から 14 日未満のバージョンはインストールしない（単位は分）
- `blockExoticSubdeps: true` … サブ依存での git / tarball URL 等をブロック
- `strictDepBuilds: true` … 未承認の install スクリプトがあるとインストールを失敗させる
- `trustPolicy: no-downgrade` … 信頼レベルが下がったバージョンを拒否
- `allowBuilds` … install スクリプトの許可リスト。追加する前に、そのスクリプトの内容を確認すること。

`@qamposer/react` だけは `minimumReleaseAgeExclude` で 14 日ルールの対象外にしています（このプロジェクトの作者が開発しているパッケージで、修正をすぐ取り込むため）。

依存を追加するときは `pnpm add -D <pkg>`（開発用）/ `pnpm add <pkg>` を使ってください（`pnpm-lock.yaml` も更新されます。コミットはユーザーが行います）。peer dependency の範囲に注意すること（例: qamposer は plotly `^2.35 || ^3` を要求するので、最新メジャーの 4 系は不可）。

## セットアップ（クローン直後）

```sh
pnpm install
pnpm dev                     # http://localhost:5173
```
