import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

/**
 * 10: Agent Skills デモ
 *
 * Skillsを使ってClaudeの能力を拡張する
 *
 * 使い方:
 *   node 10_skills.mjs
 */

// スクリプト自身の場所を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 作業ディレクトリ: スクリプトの隣に 10_skills_ws/ を作成
const workspaceDir = path.join(__dirname, "workspace");

async function main() {
  console.log("=== 10: Agent Skills デモ ===\n");

  // 作業ディレクトリを作成
  if (!existsSync(workspaceDir)) {
    mkdirSync(workspaceDir, { recursive: true });
  }
  console.log(`作業ディレクトリ: ${workspaceDir}\n`);

  // サンプルデータファイルを作成
  const sampleData = [
    { id: 1, name: "商品A", price: 1200, quantity: 5 },
    { id: 2, name: "商品B", price: 3500, quantity: 2 },
    { id: 3, name: "商品C", price: 800, quantity: 10 },
    { id: 4, name: "商品D", price: 2200, quantity: 3 },
    { id: 5, name: "商品E", price: 4500, quantity: 1 },
  ];

  const dataPath = path.join(workspaceDir, "sample_data.json");
  writeFileSync(dataPath, JSON.stringify(sampleData, null, 2));
  console.log(`サンプルデータを作成: ${dataPath}\n`);

  // Part 1: 利用可能なスキルの確認
  console.log("--- Part 1: 利用可能なスキルの確認 ---\n");

  const listResult = query({
    prompt: "利用可能なスキルを教えてください",
    options: {
      cwd: __dirname, // スクリプトのあるディレクトリ（.claude/skills/がある場所）
      settingSources: ["project"], // プロジェクトの.claude/skills/を読み込む
      allowedTools: ["Skill"],
      systemPrompt: "日本語で回答してください。",
    },
  });

  for await (const message of listResult) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`\n[ツール使用: ${block.name}]`);
          if (block.input?.skill) {
            console.log(`  スキル: ${block.input.skill}`);
          }
        }
      }
    } else if (message.type === "result") {
      console.log(`\nコスト: $${message.total_cost_usd?.toFixed(4)}`);
    }
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Part 2: スキルを使ったデータ分析（結果を.mdに出力）
  console.log("--- Part 2: スキルを使ったデータ分析 ---\n");

  const reportPath = path.join(workspaceDir, "analysis_report.md");

  const analyzeResult = query({
    prompt: `sample_data.json を分析して、統計情報をMarkdown形式でまとめてください。
結果は analysis_report.md に保存してください。

レポートには以下を含めてください：
- データ概要（レコード数、フィールド一覧）
- 数値フィールドの統計（最小、最大、平均、合計）
- 分析日時`,
    options: {
      cwd: workspaceDir, // 作業ディレクトリ（sample_data.jsonがある場所）
      settingSources: ["project"],
      allowedTools: ["Skill", "Read", "Glob", "Write"],
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      systemPrompt: `あなたはデータ分析の専門家です。
利用可能なスキルがあれば活用してください。
分析結果はMarkdown形式でファイルに保存してください。
日本語で回答してください。`,
    },
  });

  let skillUsed = false;

  for await (const message of analyzeResult) {
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
      console.log(`\nレポート出力先: ${reportPath}`);
    }
  }
}

main().catch(console.error);
