# 01: ファイル操作

## 概要

Claude Agent SDKは、ファイル操作のための組み込みツールを提供している。
エージェントに指示を与えるだけで、自動的に適切なツールを選択して実行する。

## 使用可能なツール

| ツール | 機能 |
|--------|------|
| `Glob` | パターンでファイルを検索 |
| `Read` | ファイルの内容を読み取り |
| `Write` | ファイルを作成・上書き |
| `Edit` | ファイルの一部を編集 |
| `Grep` | ファイル内容を正規表現で検索 |
| `Bash` | シェルコマンド実行（ls等） |

## サンプルコード (`01_file_operations.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: `
以下のタスクを順番に実行してください：
1. このプロジェクトにあるファイルを一覧表示してください
2. package.json の内容を読んで、プロジェクト名とバージョンを教えてください
3. sample.txt というファイルを作成し、「Hello from Claude Agent SDK!」と書き込んでください
4. 作成したファイルの内容を確認してください
`,
    options: {
      systemPrompt: "あなたはファイル操作を行うアシスタントです。",
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
    },
  });

  for await (const message of result) {
    // メッセージを処理
  }
}
```

## 実行結果

```
=== 01: ファイル操作デモ ===

## タスク完了報告

### ステップ1: ファイル一覧表示
プロジェクト内のファイル：
- 00_SETUP.md
- 00_setup.mjs
- 01_file_operations.mjs
- node_modules/
- package-lock.json
- package.json
- workspace.code-workspace

### ステップ2: package.json の情報
- プロジェクト名: claudeagentsdktest
- バージョン: 1.0.0

### ステップ3: sample.txt の作成
sample.txt ファイルを正常に作成

### ステップ4: ファイル内容の確認
Hello from Claude Agent SDK!

--- 結果 ---
成功: true
ターン数: 6
コスト (USD): 0.1050
```

## ポイント

1. **自律的なツール選択**: プロンプトで「ファイル一覧を表示」と指示するだけで、エージェントが `Bash` の `ls` や `Glob` を自動選択
2. **複数ステップの実行**: 1つのプロンプトで複数のタスクを順番に実行
3. **ターン数**: 各ツール使用が1ターンとしてカウントされる（この例では6ターン）
