import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 02: Web検索・フェッチデモ ===\n");

  const result = query({
    prompt: `
以下のタスクを実行してください：

1. 「Claude Agent SDK」についてWeb検索して、最新の情報を教えてください
2. https://platform.claude.com/docs/en/agent-sdk/overview のページを取得して、SDKの主な機能を要約してください

結果は日本語で簡潔にまとめてください。
`,
    options: {
      systemPrompt: "あなたはWeb情報を収集・要約するアシスタントです。検索結果を簡潔に日本語でまとめてください。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[ツール使用: ${block.name}]`);
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
