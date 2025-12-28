# 03: Bashコマンド実行

## 概要

Claude Agent SDKは、Bashコマンドを実行してシステム操作を行うことができる。
エージェントが自律的に適切なコマンドを選択して実行する。

## 使用可能なツール

| ツール | 機能 |
|--------|------|
| `Bash` | シェルコマンドを実行 |

## サンプルコード (`03_bash_execution.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: `
以下のタスクを実行してください：
1. 現在のディレクトリのパスを表示してください（pwd）
2. Node.jsのバージョンを確認してください
3. npmでインストールされているパッケージを一覧表示してください
4. このプロジェクトのディスク使用量を確認してください
`,
    options: {
      systemPrompt: "あなたはシステム管理タスクを実行するアシスタントです。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  for await (const message of result) {
    if (message.type === "assistant") {
      for (const block of message.message.content) {
        if (block.type === "tool_use" && block.name === "Bash") {
          console.log(`[Bash] ${block.input?.command}`);
        }
      }
    }
  }
}
```

## 実行結果

```
=== 03: Bashコマンド実行デモ ===

[ツール使用: Bash]
  コマンド: pwd

[ツール使用: Bash]
  コマンド: node --version

[ツール使用: Bash]
  コマンド: npm list --depth=0

[ツール使用: Bash]
  コマンド: du -sh . && du -sh node_modules

## システム情報レポート

### 1. 現在のディレクトリ
/Users/asira/Library/CloudStorage/Dropbox/Labo/AI/ClaudeAgentSDKTest

### 2. Node.jsのバージョン
v25.2.1

### 3. インストール済みnpmパッケージ
claudeagentsdktest@1.0.0
└── @anthropic-ai/claude-agent-sdk@0.1.76

### 4. ディスク使用量
- プロジェクト全体: 90MB
- node_modules: 90MB

--- 結果 ---
成功: true
ターン数: 6
コスト (USD): 0.0631
```

## ポイント

1. **自律的なコマンド選択**: 「ディスク使用量を確認」という指示から `du` コマンドを自動選択
2. **エラーハンドリング**: コマンドがエラーになった場合は別のアプローチを試行
3. **並列実行**: 独立したコマンドは並列で実行される可能性がある

## 注意事項

- `bypassPermissions` モードでは全てのコマンドが実行される
- 本番環境では `permissionMode: "default"` を使用し、危険なコマンドを制限すべき
- `allowedTools` オプションで使用可能なツールを制限することも可能
