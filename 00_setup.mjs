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
      // アシスタントのメッセージを表示
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
