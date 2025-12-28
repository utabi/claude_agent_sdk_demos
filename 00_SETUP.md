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

## query() のオプション解説

```javascript
const result = query({
  prompt: "タスクの指示",
  options: {
    cwd: __dirname,                    // 作業ディレクトリ
    systemPrompt: "役割の設定",         // Claudeの振る舞い
    settingSources: ["project"],        // スキル読み込み元
    allowedTools: ["Read", "Write"],    // 使用可能ツール
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
  },
});
```

### prompt vs systemPrompt

| 項目 | prompt | systemPrompt |
|------|--------|--------------|
| 役割 | 具体的な指示・質問 | 振る舞い・役割の設定 |
| 優先度 | 高（直接的なタスク） | 低（背景的な指針） |
| 用途 | 「何をするか」 | 「どのように振る舞うか」 |

スキル使用を確実にしたい場合は **prompt** に明示的に書く。

### allowedTools 一覧

| ツール名 | 用途 | デモ |
|----------|------|------|
| `Read` | ファイル読み込み | 01 |
| `Write` | ファイル書き込み | 01 |
| `Edit` | ファイル編集 | 01 |
| `Glob` | ファイル検索（パターン） | 01 |
| `Grep` | ファイル内検索 | 01 |
| `Bash` | シェルコマンド実行 | 03 |
| `WebSearch` | Web検索 | 02 |
| `WebFetch` | Webページ取得 | 02 |
| `Task` | サブエージェント起動 | 04, 08 |
| `Skill` | スキル実行 | 10 |
| `TodoWrite` | タスク管理 | - |
| `NotebookEdit` | Jupyter編集 | - |

### settingSources 一覧

| 値 | 読み込み対象 |
|----|-------------|
| `"project"` | `.claude/skills/` （プロジェクト） |
| `"user"` | `~/.claude/skills/` （ユーザー） |

### permissionMode 一覧

| 値 | 説明 |
|----|------|
| `"default"` | 通常（権限確認あり） |
| `"bypassPermissions"` | 権限確認をスキップ（要 `allowDangerouslySkipPermissions: true`） |

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
