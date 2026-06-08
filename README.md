# G.trans Cinematic Manager

シネマティック体験（9シーンの没入型 WebGL デモ）のプレビューとコンテンツ管理ツールです。

## 起動

```bash
npm install
npm run dev
```

| URL | 用途 |
|-----|------|
| http://localhost:3000/ | シネマティック体験（プレビュー） |
| http://localhost:3000/#/admin | 管理画面 |

## 管理画面でできること

- **9シーン**のタイトル・本文・バッジ・CTA を編集
- シーンの**有効/無効**切り替え
- ビジネス文書・ゲームチャット・看板・グローバル接続データの編集
- 最終 CTA・デフォルト設定（パーティクル数など）
- 設定の **Export / Import**（JSON）
- **バックアップ**（JSON ダウンロード + ブラウザ内履歴 10 件）
- Reset 前に自動バックアップ
- 変更は **localStorage** に自動保存 → プレビューに即反映

## バックアップ

### 管理画面から（編集中の設定）

1. http://localhost:3000/#/admin を開く
2. ヘッダーの **バックアップ** をクリック
3. JSON ファイルがダウンロードされ、左サイドバーの **バックアップ履歴** に保存される

### コマンドから（初期設定のスナップショット）

```bash
npm run backup
```

`backups/gtrans-cinematic-YYYY-MM-DDTHH-mm-ss.json` に保存されます。

## ショートカット

- 体験画面右下の **Manage** から管理画面へ
- 管理画面の **プレビュー** から体験へ戻る

## ビルド

```bash
npm run build
npm run preview
```
