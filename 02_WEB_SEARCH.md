# 02: Web検索・フェッチ

## 概要

Claude Agent SDKは、Web検索とWebページの取得・解析機能を内蔵している。
最新の情報を取得したり、特定のページの内容を要約させることができる。

## 使用可能なツール

| ツール | 機能 |
|--------|------|
| `WebSearch` | Web検索を実行し、結果を取得 |
| `WebFetch` | 指定URLのページを取得して解析 |

## サンプルコード (`02_web_search.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: `
以下のタスクを実行してください：
1. 「Claude Agent SDK」についてWeb検索して、最新の情報を教えてください
2. https://platform.claude.com/docs/en/agent-sdk/overview のページを取得して、
   SDKの主な機能を要約してください
`,
    options: {
      systemPrompt: "あなたはWeb情報を収集・要約するアシスタントです。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  for await (const message of result) {
    // メッセージを処理
  }
}
```

## 実行結果

```
=== 02: Web検索・フェッチデモ ===

両方のタスクを並行して実行します。

[ツール使用: WebSearch]
[ツール使用: WebFetch]

## Claude Agent SDK まとめ

### 概要
Claude Agent SDKは、Claude Codeと同じツール、エージェントループ、
コンテキスト管理をプログラムで利用できるライブラリです。

### 主な機能
| 機能 | 説明 |
|------|------|
| 組み込みツール | Read, Write, Edit, Bash, Glob, Grep, WebSearch/WebFetch |
| Hooks | エージェントのライフサイクルでカスタムコードを実行 |
| Subagents | 専門タスク用のサブエージェントを生成 |
| MCP連携 | 外部システムに接続 |
| 権限管理 | ツールの使用権限を細かく制御 |

--- 結果 ---
成功: true
ターン数: 3
コスト (USD): 0.2260
```

## ポイント

1. **並列実行**: 複数の独立したタスク（WebSearchとWebFetch）を同時に実行
2. **情報の統合**: 検索結果とページ内容を統合して回答を生成
3. **ソースの提示**: 参照したURLをソースとして提示

## 注意事項

- Web検索・フェッチは外部APIを使用するため、コストが高くなる傾向
- この例では約$0.23のコストが発生
