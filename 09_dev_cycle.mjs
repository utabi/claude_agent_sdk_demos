import { query } from "@anthropic-ai/claude-agent-sdk";
import { mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

/**
 * 09: 開発サイクル自動化デモ
 *
 * 実装 → ビルド → テスト → 修正 を1つのプロンプトで自動実行
 *
 * 使い方:
 *   node 09_dev_cycle.mjs
 *   node 09_dev_cycle.mjs --task "電卓クラスを実装して"
 *   node 09_dev_cycle.mjs --cwd /path/to/project --task "..."
 */

// スクリプト自身の場所を取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// デフォルト作業ディレクトリ: スクリプトの隣に workspace/ を作成
const defaultWorkspaceDir = path.join(__dirname, "workspace");

// コマンドライン引数をパース
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    cwd: null, // 指定がなければ defaultWorkspaceDir を使用
    task: null,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--cwd" && args[i + 1]) {
      options.cwd = args[++i];
    } else if (args[i] === "--task" && args[i + 1]) {
      options.task = args[++i];
    }
  }

  return options;
}

async function main() {
  const options = parseArgs();

  // cwdが指定されていなければデフォルトのworkspaceを使用
  const workDir = options.cwd || defaultWorkspaceDir;

  // 作業ディレクトリを作成
  if (!existsSync(workDir)) {
    mkdirSync(workDir, { recursive: true });
  }

  console.log("=== 09: 開発サイクル自動化デモ ===\n");

  // デフォルトのタスク（指定がない場合）
  const defaultTask = `
簡単なNode.jsプロジェクトを作成してください。

要件:
1. src/calculator.mjs に Calculator クラスを実装
   - add(a, b): 足し算
   - subtract(a, b): 引き算
   - multiply(a, b): 掛け算
   - divide(a, b): 割り算（ゼロ除算エラー対応）

2. test/calculator.test.mjs にテストを実装
   - 各メソッドの正常系テスト
   - ゼロ除算のエラーテスト

3. package.json に test スクリプトを追加

実装後:
- npm test でテストを実行
- テストが失敗したら修正
- 全テストが通るまで繰り返す
`;

  const task = options.task || defaultTask;

  console.log(`作業ディレクトリ: ${workDir}`);
  console.log(`タスク: ${task.slice(0, 100)}...`);
  console.log("\n--- 実行開始 ---\n");

  const result = query({
    prompt: task,
    options: {
      cwd: workDir,
      systemPrompt: `あなたは経験豊富なソフトウェアエンジニアです。

以下のワークフローで開発を進めてください:

1. **計画**: 実装する内容を明確にする
2. **実装**: コードを書く
3. **ビルド/テスト**: テストを実行する
4. **修正**: エラーがあれば修正し、再テスト
5. **完了**: 全テストが通ったら結果を報告

重要:
- テストが失敗したら、原因を分析して修正する
- 修正後は必ず再テストする
- 全テストがパスするまで繰り返す
- 最終的な結果をサマリーとして報告する

日本語で進捗を報告してください。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // 最大ターン数を設定（無限ループ防止）
      maxTurns: 30,
    },
  });

  // 統計情報
  let stats = {
    toolCalls: {},
    testRuns: 0,
    fixes: 0,
  };

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          const toolName = block.name;
          stats.toolCalls[toolName] = (stats.toolCalls[toolName] || 0) + 1;

          // テスト実行を検出
          if (toolName === "Bash" && block.input?.command?.includes("test")) {
            stats.testRuns++;
            console.log(`\n[テスト実行 #${stats.testRuns}]`);
          }
          // ファイル修正を検出
          else if (toolName === "Edit") {
            stats.fixes++;
            console.log(`\n[コード修正 #${stats.fixes}]`);
          }
          // その他のツール
          else {
            console.log(`\n[${toolName}]`);
          }
        }
      }
    } else if (message.type === "result") {
      console.log("\n" + "=".repeat(50));
      console.log("開発サイクル完了");
      console.log("=".repeat(50));

      console.log("\n--- 統計 ---");
      console.log(`テスト実行回数: ${stats.testRuns}`);
      console.log(`コード修正回数: ${stats.fixes}`);
      console.log(`ターン数: ${message.num_turns}`);

      console.log("\nツール使用回数:");
      Object.entries(stats.toolCalls)
        .sort((a, b) => b[1] - a[1])
        .forEach(([tool, count]) => {
          console.log(`  ${tool}: ${count}回`);
        });

      console.log("\n--- 結果 ---");
      console.log("成功:", message.subtype === "success");
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }
}

main().catch(console.error);
