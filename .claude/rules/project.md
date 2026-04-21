# Firebase Access Viewer Project Rules

## Overview

Firebase(Firestore/Storage)へのネットワークリクエストをChrome DevToolsから観測し、Popupで可視化するChrome拡張機能（Manifest V3）。

## Architecture

- 3つのコンテキストで構成（`manifest.json`で定義）:
  - **background**: `src/background.ts`（service_worker）— バッジ表示の更新を担当
  - **devtools**: `src/devtools.ts` + `devtools.html` — `chrome.devtools.network.onRequestFinished`でリクエストを捕捉し、Firebaseサービス宛のものだけ保持（最新100件）
  - **popup**: `src/popup.tsx` + `popup.html` — React製のUIで履歴を表示
- ビルドは`@crxjs/vite-plugin`でViteに`manifest.json`を読み込ませて生成
- パッケージリリースは`pnpm zip`で`releases/firebase-access-viewer.zip`を作成
- Node版は`.node-version`で固定（プロジェクト標準）
- パッケージマネージャはpnpm v10（`package.json`の`packageManager`フィールドで版数pin、`yarn`/`npm`は使わない）
- pnpm v10はpostinstallスクリプトがデフォルト無効のため、必要な依存は`pnpm.onlyBuiltDependencies`に列挙して許可（例: `esbuild`）
- pnpmの`minimumReleaseAge: 10080`（7日）を`pnpm-workspace.yaml`に設定（サプライチェーン攻撃対策として、公開直後のパッケージは自動的に導入しない）
- `.claude/`配下のうち `.gitignore` 対象は `*.local.md` / `plans/` / `settings.local.json` のみ。ルール本体（`rules/**/*.md`）・ワークフロー設定（`dev-workflow.md`, `settings.json`）・共有スキル（`skills/`）は追跡してチームで共有する
- 依存更新の作業ログ・報告書（`docs/dependency-update-*.md` 等）はリポジトリにコミットしない（ローカル参照専用、`.claude/plans/` と同じ扱い）

## Principles

- コンテキスト間通信は`chrome.runtime.sendMessage({ msg, data })`形式に統一（`msg`は文字列リテラル、`data`は任意）
- メッセージディスパッチはオブジェクトマップで実装（`switch`/`if-else`を使わない、ハンドラを`msg`名でルックアップ）
- Firebaseサービスの判定は`firebaseServices`配列の`match(url)`経由（URL文字列処理を呼び出し側に書かない）
- Firebaseサービス名のunion型は`firebaseServices` (`as const`)から派生させる（`FirebaseServiceName = (typeof firebaseServices)[number]['name']`、stringly-typedを避け、サービス追加時に`Record`や`switch`が自動追従）
- リクエスト履歴は配列の先頭追加＋`slice(0, 99)`で最大100件に制限（mutableなpushは使わない）
- DevToolsリクエスト解析はサービスごとに関数分離（`firestorePaths` / `storagePaths`）
- 外部由来データ（`decodeURIComponent(JSON.stringify)`経由のFirestore req params等）のパースはbest-effort方針：`JSON.parse`は`try/catch`でparam単位スキップ＋`console.warn`、深いnarrowは各フィールドで`typeof === 'string'`ガード＋外側try/catchで`undefined`フォールバック（1件の壊れたentryが全件をthrowで落とさない）
- Dark mode は Tailwind `darkMode: 'media'`（OS設定連動）。利用側は`dark:` variantを併記、JSライブラリは`window.matchMedia('(prefers-color-scheme: dark)')`を購読する`usePrefersDark`フックで同期
- `react-json-view-lite`等、独自CSSを要求するライブラリは利用コンポーネントのモジュール冒頭で`import 'pkg/dist/index.css'`（README指定のimportは必ず明記）

## Examples
When in doubt: ./project.examples.md
