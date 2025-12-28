import { query, tool, createSdkMcpServer } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// カスタムMCPツールの定義
const getCurrentTime = tool(
  "get_current_time",
  "現在の日時を取得します",
  {
    timezone: z.string().optional().describe("タイムゾーン（例: Asia/Tokyo）"),
  },
  async ({ timezone = "Asia/Tokyo" }) => {
    const now = new Date();
    const options = {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    const formatted = now.toLocaleString("ja-JP", options);
    return {
      content: [{ type: "text", text: `現在時刻（${timezone}）: ${formatted}` }],
    };
  }
);

const calculator = tool(
  "calculator",
  "数式を計算します。四則演算、累乗、平方根などに対応。",
  {
    expression: z.string().describe("計算する数式（例: 2 + 3 * 4, sqrt(16), 2^10）"),
  },
  async ({ expression }) => {
    try {
      // 安全な数式評価（基本的な演算のみ）
      const sanitized = expression
        .replace(/sqrt\(([^)]+)\)/g, "Math.sqrt($1)")
        .replace(/\^/g, "**")
        .replace(/[^0-9+\-*/().Math\s]/g, "");

      const result = eval(sanitized);
      return {
        content: [{ type: "text", text: `${expression} = ${result}` }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `計算エラー: ${error.message}` }],
        isError: true,
      };
    }
  }
);

const randomNumber = tool(
  "random_number",
  "指定範囲のランダムな整数を生成します",
  {
    min: z.number().describe("最小値"),
    max: z.number().describe("最大値"),
  },
  async ({ min, max }) => {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      content: [{ type: "text", text: `ランダム数（${min}〜${max}）: ${random}` }],
    };
  }
);

// MCPサーバーの作成
const myMcpServer = createSdkMcpServer({
  name: "my-custom-tools",
  version: "1.0.0",
  tools: [getCurrentTime, calculator, randomNumber],
});

async function main() {
  console.log("=== 05: MCPサーバー連携デモ ===\n");

  const result = query({
    prompt: `
カスタムツールを使って以下のタスクを実行してください：

1. 現在の日時を教えてください（東京時間）
2. 以下の計算をしてください：
   - 123 + 456
   - 2^10（2の10乗）
   - sqrt(144)（144の平方根）
3. 1から100までのランダムな数字を3つ生成してください

各結果を日本語で報告してください。
`,
    options: {
      systemPrompt: "あなたはカスタムツールを使用するアシスタントです。提供されたツールを活用して、ユーザーのリクエストに応えてください。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // MCPサーバーの設定
      mcpServers: {
        "my-custom-tools": myMcpServer,
      },
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[ツール使用: ${block.name}]`);
          if (block.input) {
            console.log(`  入力: ${JSON.stringify(block.input)}`);
          }
        }
      }
    } else if (message.type === "result") {
      console.log("\n--- 結果 ---");
      console.log("成功:", message.subtype === "success");
      console.log("ターン数:", message.num_turns);
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }
}

main().catch(console.error);
