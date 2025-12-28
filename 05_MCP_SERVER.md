# 05: MCPサーバー連携

## 概要

MCP (Model Context Protocol) を使用すると、カスタムツールを定義してエージェントに提供できる。
データベース接続、外部API呼び出し、独自のビジネスロジックなどを実装可能。

## 必要なパッケージ

```bash
npm install zod  # スキーマ定義用
```

## カスタムツールの定義

`tool()` 関数でツールを定義:

```javascript
import { tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const myTool = tool(
  "tool_name",           // ツール名
  "ツールの説明",         // 説明（エージェントがいつ使うか判断する材料）
  {                       // 入力スキーマ（Zod）
    param1: z.string().describe("パラメータ1の説明"),
    param2: z.number().optional().describe("パラメータ2"),
  },
  async ({ param1, param2 }) => {  // ハンドラー
    // 処理を実行
    return {
      content: [{ type: "text", text: "結果" }],
    };
  }
);
```

## MCPサーバーの作成

```javascript
import { createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";

const myMcpServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [tool1, tool2, tool3],
});
```

## サンプルコード (`05_mcp_server.mjs`)

```javascript
import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// ツール定義
const getCurrentTime = tool(
  "get_current_time",
  "現在の日時を取得します",
  { timezone: z.string().optional().describe("タイムゾーン") },
  async ({ timezone = "Asia/Tokyo" }) => {
    const now = new Date().toLocaleString("ja-JP", { timeZone: timezone });
    return { content: [{ type: "text", text: `現在時刻: ${now}` }] };
  }
);

const calculator = tool(
  "calculator",
  "数式を計算します",
  { expression: z.string().describe("計算する数式") },
  async ({ expression }) => {
    const result = eval(expression.replace(/\^/g, "**"));
    return { content: [{ type: "text", text: `${expression} = ${result}` }] };
  }
);

// MCPサーバー作成
const myMcpServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [getCurrentTime, calculator],
});

// クエリ実行
const result = query({
  prompt: "現在時刻と2^10の計算結果を教えて",
  options: {
    mcpServers: {
      "my-custom-tools": myMcpServer,
    },
  },
});
```

## 実行結果

```
=== 05: MCPサーバー連携デモ ===

[ツール使用: mcp__my-custom-tools__get_current_time]
  入力: {"timezone":"Asia/Tokyo"}

[ツール使用: mcp__my-custom-tools__calculator]
  入力: {"expression":"123 + 456"}

[ツール使用: mcp__my-custom-tools__calculator]
  入力: {"expression":"2^10"}

[ツール使用: mcp__my-custom-tools__random_number]
  入力: {"min":1,"max":100}

## 結果報告

### 1. 現在の日時（東京時間）
2025年12月28日 20時37分31秒

### 2. 計算結果
| 計算式 | 結果 |
|--------|------|
| 123 + 456 | 579 |
| 2^10 | 1024 |
| sqrt(144) | 12 |

### 3. ランダムな数字
36, 12, 10

--- 結果 ---
成功: true
ターン数: 8
コスト (USD): 0.0654
```

## ポイント

1. **ツール名の形式**: MCPツールは `mcp__{サーバー名}__{ツール名}` として呼び出される
2. **並列実行**: 独立した複数のツール呼び出しは並列で実行される
3. **型安全**: Zodスキーマで入力パラメータの型を定義・検証
4. **エラーハンドリング**: `isError: true` でエラーを返却可能

## MCPサーバーの種類

| タイプ | 説明 |
|--------|------|
| `sdk` | 同一プロセス内で動作（この例） |
| `stdio` | 別プロセスとしてコマンドを実行 |
| `sse` | SSE (Server-Sent Events) 接続 |
| `http` | HTTP接続 |

## 活用例

- **データベース連携**: SQLクエリの実行
- **外部API**: Slack通知、GitHub操作など
- **ビジネスロジック**: 承認ワークフロー、計算処理
- **ファイル変換**: PDF生成、画像処理など
