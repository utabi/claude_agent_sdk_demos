import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

// スクリプト自身の場所を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 作業ディレクトリ: スクリプトの隣に workspace/ を作成
const workspaceDir = path.join(__dirname, "workspace");

async function main() {
  console.log("=== 01: ファイル操作デモ ===\n");

  // 作業ディレクトリを作成
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }
  console.log(`作業ディレクトリ: ${workspaceDir}\n`);

  const result = query({
    prompt: `
以下のタスクを順番に実行してください：

1. このディレクトリにあるファイルを一覧表示してください
2. sample.txt というファイルを作成し、「Hello from Claude Agent SDK!」と書き込んでください
3. 作成したファイルの内容を確認してください

各ステップの結果を日本語で報告してください。
`,
    options: {
      cwd: workspaceDir,
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
