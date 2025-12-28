import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 06: 並列ツール呼び出しデモ ===\n");

  // タイムスタンプを記録して並列実行を確認
  const startTime = Date.now();

  const result = query({
    prompt: `
以下の情報を取得してください。これらは全て独立したタスクです：
- Node.jsのバージョン
- npmのバージョン
- gitのバージョン
- 現在の日時

結果を簡潔に報告してください。
`,
    options: {
      systemPrompt: `あなたは効率的なアシスタントです。
重要: 独立したタスクは必ず1回のレスポンスで複数のツールを同時に呼び出してください。
これにより処理時間を大幅に短縮できます。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  let toolCallCount = 0;
  let parallelBatches = [];
  let currentBatchTools = [];

  for await (const message of result) {
    if (message.type === "assistant") {
      // 1つのメッセージ内の複数ツール呼び出しを追跡
      const toolUses = message.message.content.filter(b => b.type === "tool_use");

      if (toolUses.length > 0) {
        currentBatchTools = toolUses.map(t => t.name);
        parallelBatches.push(currentBatchTools);
        toolCallCount += toolUses.length;

        console.log(`[並列バッチ ${parallelBatches.length}] ${toolUses.length}個のツールを同時呼び出し:`);
        toolUses.forEach(t => {
          console.log(`  - ${t.name}`);
        });
        console.log("");
      }

      for (const block of message.message.content) {
        if (block.type === "text" && block.text.trim()) {
          console.log(block.text);
        }
      }
    } else if (message.type === "result") {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log("\n--- 並列実行の統計 ---");
      console.log(`総ツール呼び出し数: ${toolCallCount}`);
      console.log(`並列バッチ数: ${parallelBatches.length}`);
      console.log(`実行時間: ${elapsed}秒`);
      console.log("\n--- 結果 ---");
      console.log("成功:", message.subtype === "success");
      console.log("ターン数:", message.num_turns);
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }
}

main().catch(console.error);
