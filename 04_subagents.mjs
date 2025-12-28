import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 04: サブエージェントデモ ===\n");

  const result = query({
    prompt: `
このプロジェクトのコードをレビューしてください。

以下の観点でレビューを行い、レポートを作成してください：
1. コード品質（可読性、構造）
2. セキュリティ（危険な設定がないか）
3. 改善提案

各.mjsファイルを分析してください。
`,
    options: {
      systemPrompt: `あなたはシニアコードレビュアーです。
コードを分析し、問題点と改善案を日本語で報告してください。
必要に応じてサブエージェント（Task tool）を使用して、
ファイルごとの詳細な分析を委任することができます。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // サブエージェントの定義
      agents: {
        "security-auditor": {
          description: "セキュリティの観点からコードを監査するエージェント",
          prompt: "あなたはセキュリティ専門家です。コードのセキュリティ問題を特定し、日本語で報告してください。",
          model: "haiku",
        },
        "code-quality": {
          description: "コード品質を評価するエージェント",
          prompt: "あなたはコード品質の専門家です。可読性、保守性、ベストプラクティスの観点から評価し、日本語で報告してください。",
          model: "haiku",
        },
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
          if (block.name === "Task") {
            console.log(`  サブエージェント: ${block.input?.subagent_type}`);
            console.log(`  説明: ${block.input?.description}`);
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
