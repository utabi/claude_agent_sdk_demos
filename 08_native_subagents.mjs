import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 08: Claude 4.5 ネイティブサブエージェントデモ ===\n");

  // Claude 4.5のネイティブサブエージェント機能をテスト
  // agents オプションを定義せずに、Task toolの使用を観察

  const result = query({
    prompt: `
このプロジェクトについて、以下の分析を行ってください：

1. プロジェクト構造の分析
2. 依存パッケージの調査
3. コードパターンの特定

各タスクは独立しているので、効率的に処理してください。
最終的に、プロジェクトの概要レポートを作成してください。
`,
    options: {
      systemPrompt: `あなたはプロジェクト分析のエキスパートです。
複雑なタスクは、Taskツールを使って専門的なサブエージェントに委任できます。
サブエージェントタイプには以下があります:
- Explore: コードベース探索用
- Plan: 実装計画立案用
- general-purpose: 汎用的なタスク用

効率的に分析を進めてください。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // モデルはデフォルト（SDKが適切なモデルを選択）
    },
  });

  let taskToolCalls = [];

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[ツール使用: ${block.name}]`);

          if (block.name === "Task") {
            const taskInfo = {
              subagent_type: block.input?.subagent_type,
              description: block.input?.description,
            };
            taskToolCalls.push(taskInfo);
            console.log(`  タイプ: ${taskInfo.subagent_type}`);
            console.log(`  説明: ${taskInfo.description}`);
          }
        }
      }
    } else if (message.type === "result") {
      console.log("\n--- サブエージェント使用統計 ---");
      console.log(`Taskツール呼び出し回数: ${taskToolCalls.length}`);

      if (taskToolCalls.length > 0) {
        console.log("\n使用されたサブエージェント:");
        const typeCount = {};
        taskToolCalls.forEach((t) => {
          typeCount[t.subagent_type] = (typeCount[t.subagent_type] || 0) + 1;
        });
        Object.entries(typeCount).forEach(([type, count]) => {
          console.log(`  - ${type}: ${count}回`);
        });
      }

      console.log("\n--- 結果 ---");
      console.log("成功:", message.subtype === "success");
      console.log("ターン数:", message.num_turns);
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }
}

main().catch(console.error);
