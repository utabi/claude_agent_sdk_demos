import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

/**
 * 10: Agent Skills デモ - frontend-design
 *
 * frontend-design スキルを使って高品質なUIコンポーネントを生成
 *
 * 使い方:
 *   node 10_skills_frontend-design.mjs
 */

// スクリプト自身の場所を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 作業ディレクトリ
const workspaceDir = path.join(__dirname, "workspace");

async function main() {
  console.log("=== 10: Agent Skills デモ - frontend-design ===\n");

  // 作業ディレクトリを作成
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }
  console.log(`作業ディレクトリ: ${workspaceDir}\n`);

  const outputPath = path.join(workspaceDir, "landing_page.html");

  const result = query({
    prompt: `
シンプルなランディングページを作成してください。

要件:
- プロダクト名: "CloudNote" (クラウドノートアプリ)
- ヒーローセクション（キャッチコピー + CTA）
- 3つの特徴セクション
- フッター

HTMLファイル1つで完結するように（CSSはインライン or <style>タグ）。
結果は ${outputPath} として保存してください。
`,
    options: {
      cwd: __dirname,
      settingSources: ["project"],
      allowedTools: ["Skill", "Write"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      systemPrompt: `あなたはフロントエンドデザインの専門家です。
frontend-design スキルを活用して、独自性のある美しいUIを作成してください。
汎用的なAIっぽいデザインは避け、記憶に残るデザインを心がけてください。`,
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
      console.log(`\n出力ファイル: ${outputPath}`);
      console.log(`\nブラウザで開く: open ${outputPath}`);
    }
  }
}

main().catch(console.error);
