# 06: 並列ツール呼び出し

## 概要

Claude 4.5モデルは、独立したタスクに対して複数のツールを並列で呼び出す能力を持つ。
これにより、処理時間を短縮できる可能性がある。

## 並列呼び出しの仕組み

モデルが1回のレスポンスで複数の `tool_use` ブロックを返すと、SDKはそれらを並列で処理する。

```javascript
// モデルが返す可能性のあるレスポンス例
message.content = [
  { type: "tool_use", name: "Bash", input: { command: "node --version" } },
  { type: "tool_use", name: "Bash", input: { command: "npm --version" } },
  { type: "tool_use", name: "Bash", input: { command: "git --version" } },
]
// → これらは並列で実行される
```

## サンプルコード (`06_parallel_tools.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const startTime = Date.now();

  const result = query({
    prompt: `
以下の情報を取得してください。これらは全て独立したタスクです：
- Node.jsのバージョン
- npmのバージョン
- gitのバージョン
- 現在の日時
`,
    options: {
      systemPrompt: `あなたは効率的なアシスタントです。
重要: 独立したタスクは必ず1回のレスポンスで複数のツールを同時に呼び出してください。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  let parallelBatches = [];

  for await (const message of result) {
    if (message.type === "assistant") {
      // 1つのメッセージ内の複数ツール呼び出しを検出
      const toolUses = message.message.content.filter(b => b.type === "tool_use");
      if (toolUses.length > 1) {
        console.log(`並列バッチ: ${toolUses.length}個のツールを同時呼び出し`);
      }
    }
  }
}
```

## 実行結果

```
=== 06: 並列ツール呼び出しデモ ===

[並列バッチ 1] 1個のツールを同時呼び出し:
  - Bash
[並列バッチ 2] 1個のツールを同時呼び出し:
  - Bash
[並列バッチ 3] 1個のツールを同時呼び出し:
  - Bash
[並列バッチ 4] 1個のツールを同時呼び出し:
  - Bash

## 結果報告
| 項目 | バージョン/情報 |
|------|----------------|
| Node.js | v25.2.1 |
| npm | 11.6.2 |
| Git | 2.50.1 |
| 現在日時 | 2025年12月28日 20:43:45 JST |

--- 結果 ---
成功: true
ターン数: 5
コスト (USD): 0.0439
```

## 観察結果

今回のテストでは、モデルはツールを**順次呼び出し**した（各バッチに1ツールのみ）。

### 並列呼び出しが発生しない理由

1. **モデルの判断**: モデルが結果を確認しながら進めることを選択した
2. **タスクの依存性**: モデルが暗黙的に依存関係があると判断した可能性
3. **安全性**: 予期しない相互作用を避けるため

### 並列呼び出しが発生しやすいケース

- 複数ファイルの同時読み込み
- 複数の独立したWeb検索
- サブエージェントの並列起動（04で確認済み）

## ポイント

1. **並列呼び出しはモデルの判断**: プロンプトで促すことはできるが、強制はできない
2. **サブエージェントでは発生しやすい**: 04のデモでは5つのcode-qualityエージェントが並列起動された
3. **コスト効率**: 並列実行しても順次実行しても、トークンコストは同程度

## 参考: 04_subagentsでの並列呼び出し

```
[ツール使用: Task]
  サブエージェント: code-quality
  説明: 00_setup.mjsのレビュー
[ツール使用: Task]
  サブエージェント: code-quality
  説明: 01_file_operations.mjsのレビュー
[ツール使用: Task]
  サブエージェント: code-quality
  説明: 02_web_search.mjsのレビュー
...
```

→ これらは1回のメッセージで同時に呼び出され、並列で実行された。
