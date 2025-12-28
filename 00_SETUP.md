# Claude Agent SDK テスト

## セットアップ

マイグレーションガイド: https://platform.claude.com/docs/en/agent-sdk/migration-guide

### インストール

```bash
npm init -y
npm install @anthropic-ai/claude-agent-sdk
```

## .mjs ファイルについて

`.mjs` は JavaScript の ES Modules 形式のファイル拡張子。

| 拡張子 | モジュール形式 | import/export |
|--------|---------------|---------------|
| `.js`  | CommonJS (デフォルト) | `require()` / `module.exports` |
| `.mjs` | ES Modules | `import` / `export` |
| `.cjs` | CommonJS (明示的) | `require()` / `module.exports` |

`.mjs` を使うことで、`package.json` に `"type": "module"` を追加せずに ES Modules の `import` 構文が使える。

## デモ一覧

以下の記事を参考に、Claude Agent SDKで実現できることを順番に試していく。

**参考**: https://qiita.com/akira_papa_AI/items/f6b342f7d67e097287eb

| No | ファイル | 内容 | コスト目安 |
|----|----------|------|------------|
| 00 | 00_setup.mjs | 基本セットアップ・日本語デモ | $0.03 |
| 01 | 01_file_operations.mjs | ファイル操作（Glob, Read, Write） | $0.11 |
| 02 | 02_web_search.mjs | Web検索・フェッチ | $0.23 |
| 03 | 03_bash_execution.mjs | Bashコマンド実行 | $0.06 |
| 04 | 04_subagents.mjs | サブエージェント（カスタム定義） | $0.43 |
| 05 | 05_mcp_server.mjs | MCPサーバー（カスタムツール） | $0.07 |
| 06 | 06_parallel_tools.mjs | 並列ツール呼び出し | $0.04 |
| 07 | 07_programmatic_tools.mjs | プログラマティックツール制御 | $0.24 |
| 08 | 08_native_subagents.mjs | ネイティブサブエージェント | $0.43 |
| 09 | 09_dev_cycle.mjs | 開発サイクル自動化 | $0.17 |
| 10 | 10_skills.mjs | Agent Skills（能力拡張） | $0.12 |

各デモは `node XX_xxx.mjs` で実行可能。

### デモの分類

**基本機能**
- 00: SDK基本（query関数、ストリーミング応答）
- 01-03: 組み込みツール（ファイル、Web、Bash）

**エージェント機能**
- 04: カスタムサブエージェント（agents オプションで定義）
- 08: ネイティブサブエージェント（組み込みExplore/Plan/general-purpose）

**拡張機能**
- 05: MCPサーバー（カスタムツール追加）
- 06: 並列ツール呼び出し
- 07: プログラマティックツール制御（allowedTools, canUseTool）
- 10: Agent Skills（SKILL.mdで能力拡張）

**実践的なワークフロー**
- 09: 開発サイクル自動化（実装→ビルド→テスト→修正）
