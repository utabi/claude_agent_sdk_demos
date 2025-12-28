import { query } from "@anthropic-ai/claude-agent-sdk";
import { writeFileSync } from "fs";

/**
 * 10: Agent Skills デモ
 *
 * Skillsを使ってClaudeの能力を拡張する
 *
 * 使い方:
 *   node 10_skills.mjs
 */

async function main() {
  console.log("=== 10: Agent Skills デモ ===\n");

  // サンプルデータファイルを作成
  const sampleData = [
    { id: 1, name: "商品A", price: 1200, quantity: 5 },
    { id: 2, name: "商品B", price: 3500, quantity: 2 },
    { id: 3, name: "商品C", price: 800, quantity: 10 },
    { id: 4, name: "商品D", price: 2200, quantity: 3 },
    { id: 5, name: "商品E", price: 4500, quantity: 1 },
  ];

  const dataPath = new URL("./sample_data.json", import.meta.url).pathname;
  writeFileSync(dataPath, JSON.stringify(sampleData, null, 2));
  console.log(`サンプルデータを作成: ${dataPath}\n`);

  // Part 1: 利用可能なスキルの確認
  console.log("--- Part 1: 利用可能なスキルの確認 ---\n");

  const listResult = query({
    prompt: "利用可能なスキルを教えてください",
    options: {
      cwd: process.cwd(),
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

  // Part 2: スキルを使ったデータ分析
  console.log("--- Part 2: スキルを使ったデータ分析 ---\n");

  const analyzeResult = query({
    prompt: `sample_data.json を分析して、統計情報を教えてください`,
    options: {
      cwd: process.cwd(),
      settingSources: ["project"],
      allowedTools: ["Skill", "Read", "Glob"],
      systemPrompt: `あなたはデータ分析の専門家です。
利用可能なスキルがあれば活用してください。
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
    }
  }
}

main().catch(console.error);
