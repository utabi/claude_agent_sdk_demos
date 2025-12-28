import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 03: Bashコマンド実行デモ ===\n");

  const result = query({
    prompt: `
以下のタスクを実行してください：

1. 現在のディレクトリのパスを表示してください（pwd）
2. Node.jsのバージョンを確認してください
3. npmでインストールされているパッケージを一覧表示してください
4. このプロジェクトのディスク使用量を確認してください（node_modules除く）

各結果を日本語で報告してください。
`,
    options: {
      systemPrompt: "あなたはシステム管理タスクを実行するアシスタントです。コマンドの結果を簡潔に日本語で報告してください。",
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
          if (block.name === "Bash" && block.input?.command) {
            console.log(`  コマンド: ${block.input.command}`);
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
