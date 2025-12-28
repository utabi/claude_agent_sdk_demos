# Claude Agent SDK Demos

Claude Agent SDK の機能を試すデモ集。

## セットアップ

```bash
npm install
```

## デモ一覧

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

## 実行方法

```bash
# 基本デモ
node 00_setup.mjs

# ファイル操作
node 01_file_operations.mjs

# 開発サイクル自動化（カスタムタスク指定可）
node 09_dev_cycle.mjs
node 09_dev_cycle.mjs --task "FizzBuzz関数を実装して"
```

## デモの分類

### 基本機能
- **00**: SDK基本（query関数、ストリーミング応答）
- **01-03**: 組み込みツール（ファイル、Web、Bash）

### エージェント機能
- **04**: カスタムサブエージェント（`agents` オプションで定義）
- **08**: ネイティブサブエージェント（組み込みExplore/Plan/general-purpose）

### 拡張機能
- **05**: MCPサーバー（カスタムツール追加）
- **06**: 並列ツール呼び出し
- **07**: プログラマティックツール制御（allowedTools, canUseTool）
- **10**: Agent Skills（SKILL.mdで能力拡張）

### 実践的なワークフロー
- **09**: 開発サイクル自動化（実装→ビルド→テスト→修正）

## 認証

### 方法1: Claude Code CLI（推奨）

Claude Code CLIで認証済みの場合、API KEYなしで利用可能。

```bash
# Claude Code をインストール（npxで直接実行も可）
npx @anthropic-ai/claude-code

# 認証（ブラウザが開く）
claude login

# これでSDKも認証情報を自動的に使用する
node 00_setup.mjs
```

### 方法2: API KEY

```bash
export ANTHROPIC_API_KEY=your-api-key
```

## 参考

- [Claude Agent SDK ドキュメント](https://platform.claude.com/docs/en/agent-sdk/overview)
- [マイグレーションガイド](https://platform.claude.com/docs/en/agent-sdk/migration-guide)
- [参考記事](https://qiita.com/akira_papa_AI/items/f6b342f7d67e097287eb)

## License

MIT
