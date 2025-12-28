import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

/**
 * 10: Agent Skills デモ - prompt-engineering-patterns
 *
 * prompt-engineering-patterns スキルを使ってプロンプトを最適化
 *
 * 使い方:
 *   node 10_skills_prompt-engineering-patterns.mjs
 */

// スクリプト自身の場所を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 作業ディレクトリ
const workspaceDir = path.join(__dirname, "workspace");

async function main() {
  console.log("=== 10: Agent Skills デモ - prompt-engineering-patterns ===\n");

  // 作業ディレクトリを作成
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }
  console.log(`作業ディレクトリ: ${workspaceDir}\n`);

  // 最適化したい元のプロンプトを保存
  const originalPrompt = `
ユーザーの質問に答えて。
データベースから情報を取得して回答する。
`;

  const inputPath = path.join(workspaceDir, "original_prompt.txt");
  writeFileSync(inputPath, originalPrompt);
  console.log(`元のプロンプトを保存: ${inputPath}\n`);

  const outputPath = path.join(workspaceDir, "optimized_prompt.md");

  const result = query({
    prompt: `
以下のプロンプトを最適化してください:

---
${originalPrompt}
---

要件:
- カスタマーサポートBot用のシステムプロンプト
- RAGシステムと連携（コンテキストが注入される想定）
- 回答の一貫性と正確性を重視
- Few-Shot例を2つ含める

最適化されたプロンプトを ${outputPath} に保存してください。
改善ポイントの解説も含めてください。
`,
    options: {
      cwd: __dirname,
      settingSources: ["project"],
      allowedTools: ["Skill", "Read", "Write"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      systemPrompt: `あなたはプロンプトエンジニアリングの専門家です。
prompt-engineering-patterns スキルを活用して、プロダクション品質のプロンプトを設計してください。
ベストプラクティスに従い、具体的で実用的な改善を行ってください。`,
    },
  });

  let skillUsed = false;

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[ツール使用: ${block.name}]`);
          if (block.name === "Skill") {
            skillUsed = true;
            console.log(`  スキル: ${block.input?.skill}`);
          } else if (block.name === "Write") {
            console.log(`  ファイル: ${block.input?.file_path}`);
          }
        }
      }
    } else if (message.type === "result") {
      console.log("\n" + "=".repeat(50));
      console.log("デモ完了");
      console.log("=".repeat(50));
      console.log(`\nスキル使用: ${skillUsed ? "あり" : "なし"}`);
      console.log(`成功: ${message.subtype === "success"}`);
      console.log(`ターン数: ${message.num_turns}`);
      console.log(`コスト (USD): ${message.total_cost_usd?.toFixed(4)}`);
      console.log(`\n入力: ${inputPath}`);
      console.log(`出力: ${outputPath}`);
    }
  }
}

main().catch(console.error);
