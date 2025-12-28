import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  console.log("=== 07: プログラマティックツール呼び出しデモ ===\n");

  // デモ1: 許可ツールの制限
  console.log("--- デモ1: 許可ツールの制限（Read, Globのみ） ---\n");

  const result1 = query({
    prompt: `
以下を試してください：
1. このディレクトリのファイル一覧を取得（Glob）
2. package.json を読む（Read）
3. sample.txt を作成する（Write）← これは失敗するはず
`,
    options: {
      systemPrompt: "ファイル操作を試みてください。一部のツールは制限されています。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // 使用可能なツールを制限
      allowedTools: ["Read", "Glob"],
    },
  });

  for await (const message of result1) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`[ツール使用: ${block.name}]`);
        }
      }
    } else if (message.type === "result") {
      console.log("\n成功:", message.subtype === "success");
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }

  // デモ2: カスタム権限チェック（canUseTool）
  console.log("\n\n--- デモ2: カスタム権限チェック（canUseTool） ---\n");

  const blockedCommands = [];

  const result2 = query({
    prompt: `
以下のコマンドを実行してください：
1. pwd
2. rm -rf /tmp/test  ← 危険なコマンド
3. echo "Hello"
4. ls -la
`,
    options: {
      systemPrompt: "指示されたコマンドを実行してください。",
      permissionMode: "default",
      // カスタム権限チェック関数
      canUseTool: async (toolName, input, options) => {
        console.log(`[権限チェック] ツール: ${toolName}`);

        if (toolName === "Bash") {
          const command = input.command || "";

          // 危険なコマンドをブロック
          const dangerousPatterns = [
            /rm\s+-rf/,
            /rm\s+-r/,
            /rmdir/,
            /mkfs/,
            /dd\s+if=/,
            />\s*\/dev\//,
          ];

          for (const pattern of dangerousPatterns) {
            if (pattern.test(command)) {
              console.log(`  → ブロック: 危険なコマンド "${command}"`);
              blockedCommands.push(command);
              return {
                behavior: "deny",
                message: `セキュリティポリシーにより、このコマンドは実行できません: ${command}`,
              };
            }
          }

          console.log(`  → 許可: ${command}`);
        }

        return {
          behavior: "allow",
          updatedInput: input,
        };
      },
    },
  });

  for await (const message of result2) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`[ツール使用試行: ${block.name}]`);
        }
      }
    } else if (message.type === "result") {
      console.log("\n成功:", message.subtype === "success");
      console.log("ブロックされたコマンド:", blockedCommands);
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }

  // デモ3: 禁止ツールの指定
  console.log("\n\n--- デモ3: 禁止ツールの指定（Bashを禁止） ---\n");

  const result3 = query({
    prompt: `
Node.jsのバージョンを確認してください。
Bashコマンドは使えないので、別の方法を試してください。
`,
    options: {
      systemPrompt: "指示に従ってください。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      // 禁止ツールを指定
      disallowedTools: ["Bash"],
    },
  });

  for await (const message of result3) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "text") {
          console.log(block.text);
        } else if (block.type === "tool_use") {
          console.log(`[ツール使用: ${block.name}]`);
        }
      }
    } else if (message.type === "result") {
      console.log("\n成功:", message.subtype === "success");
      console.log("コスト (USD):", message.total_cost_usd?.toFixed(4));
    }
  }
}

main().catch(console.error);
