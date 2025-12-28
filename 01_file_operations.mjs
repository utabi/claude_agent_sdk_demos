import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 01: ファイル操作デモ ===\n");

  const result = query({
    prompt: `
以下のタスクを順番に実行してください：

1. このプロジェクトにあるファイルを一覧表示してください
2. package.json の内容を読んで、プロジェクト名とバージョンを教えてください
3. sample.txt というファイルを作成し、「Hello from Claude Agent SDK!」と書き込んでください
4. 作成したファイルの内容を確認してください

各ステップの結果を日本語で報告してください。
`,
    options: {
      systemPrompt: "あなたはファイル操作を行うアシスタントです。各操作の結果を簡潔に日本語で報告してください。",
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
