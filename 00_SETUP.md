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

## 実行ログ

### 2024-12-28: 初回テスト

#### サンプルコード (`index.mjs`)

**コードの解説:**

```javascript
// 1. SDKから query 関数をインポート
import { query } from "@anthropic-ai/claude-agent-sdk";

// 2. メイン関数（async/await を使用）
async function main() {
  // 3. query() でClaudeに問い合わせを開始
  //    - prompt: Claudeへの質問・指示
  //    - options: 各種設定
  const result = query({
    prompt: "こんにちは！あなたは誰ですか？...",
    options: {
      systemPrompt: "あなたは親切なアシスタントです...",  // Claudeの振る舞いを指定
      permissionMode: "bypassPermissions",  // 権限チェックをスキップ
      allowDangerouslySkipPermissions: true, // 上記を有効にするフラグ
    },
  });

  // 4. for await...of でストリーミング応答を受信
  //    query() は AsyncGenerator を返すため、メッセージが順次届く
  for await (const message of result) {
    // 5. メッセージタイプに応じて処理
    if (message.type === "assistant") {
      // アシスタントの応答テキストを表示
    } else if (message.type === "result") {
      // 最終結果（成功/失敗、コスト、トークン数など）を表示
    }
  }
}
```

**実際のコード:**

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("Claude Agent SDK テスト開始...\n");

  const result = query({
    prompt: "こんにちは！あなたは誰ですか？簡単に自己紹介してください。",
    options: {
      systemPrompt: "あなたは親切なアシスタントです。簡潔に日本語で回答してください。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log("Assistant:", block.text);
        }
      }
    } else if (message.type === "result") {
      console.log("\n--- 結果 ---");
      console.log("成功:", message.subtype === "success");
      console.log("ターン数:", message.num_turns);
      console.log("コスト (USD):", message.total_cost_usd);
      console.log("使用トークン:", message.usage);
    }
  }
}

main().catch(console.error);
```

#### 実行結果

```
Claude Agent SDK テスト開始...

A: こんにちは！

私は**Claude**です。Anthropic社が開発したAIアシスタントです。

主にできることは：
- **コードの作成・編集・デバッグ** - 様々なプログラミング言語に対応
- **ファイルの読み書き** - プロジェクト内のファイル操作
- **コマンド実行** - ターミナルコマンドの実行
- **Web検索** - 最新情報の調査
- **質問への回答** - 技術的な質問から一般的な質問まで

何かお手伝いできることはありますか？

--- 結果 ---
成功: true
ターン数: 1
コスト (USD): 0.02828825
使用トークン: {
  input_tokens: 3,
  cache_creation_input_tokens: 2533,
  cache_read_input_tokens: 12832,
  output_tokens: 185,
  server_tool_use: { web_search_requests: 0, web_fetch_requests: 0 },
  service_tier: 'standard',
  cache_creation: { ephemeral_1h_input_tokens: 0, ephemeral_5m_input_tokens: 2533 }
}
```

#### 備考

- SDKはClaude Codeの内部システムプロンプトを使用するため、カスタムシステムプロンプトを指定しても完全には反映されない場合がある
- `bypassPermissions`モードを使用するには`allowDangerouslySkipPermissions: true`が必要
- v0.1.0からはデフォルトでシステムプロンプトや設定ファイルを読み込まないため、明示的に設定が必要

---

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
