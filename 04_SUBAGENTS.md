# 04: サブエージェント

## 概要

Claude Agent SDKでは、専門的なタスクを実行するサブエージェントを定義できる。
メインエージェントが自動的にサブエージェントに作業を委任し、並列処理が可能。

## サブエージェントの定義

`options.agents` でカスタムサブエージェントを定義:

```javascript
agents: {
  "security-auditor": {
    description: "セキュリティの観点からコードを監査するエージェント",
    prompt: "あなたはセキュリティ専門家です。コードのセキュリティ問題を特定してください。",
    model: "haiku",  // コスト削減のため軽量モデルを使用
  },
  "code-quality": {
    description: "コード品質を評価するエージェント",
    prompt: "あなたはコード品質の専門家です。可読性、保守性の観点から評価してください。",
    model: "haiku",
  },
}
```

## サンプルコード (`04_subagents.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: `
このプロジェクトのコードをレビューしてください。
1. コード品質（可読性、構造）
2. セキュリティ（危険な設定がないか）
3. 改善提案
`,
    options: {
      systemPrompt: `あなたはシニアコードレビュアーです。
必要に応じてサブエージェント（Task tool）を使用して、
ファイルごとの詳細な分析を委任することができます。`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      agents: {
        "security-auditor": {
          description: "セキュリティ監査エージェント",
          prompt: "セキュリティ問題を特定し報告してください。",
          model: "haiku",
        },
        "code-quality": {
          description: "コード品質評価エージェント",
          prompt: "可読性、保守性を評価してください。",
          model: "haiku",
        },
      },
    },
  });

  for await (const message of result) {
    // メッセージを処理
  }
}
```

## 実行結果（抜粋）

```
=== 04: サブエージェントデモ ===

[ツール使用: Glob]

[ツール使用: Task]
  サブエージェント: code-quality
  説明: 00_setup.mjsのレビュー

[ツール使用: Task]
  サブエージェント: code-quality
  説明: 01_file_operations.mjsのレビュー

[ツール使用: Task]
  サブエージェント: security-auditor
  説明: セキュリティ監査の実行

# プロジェクト コードレビューレポート

## 重大なセキュリティ問題（全ファイル共通）
- permissionMode: "bypassPermissions" が全ファイルで使用されている
- 本番環境では危険

## 総合評価
| カテゴリ | スコア |
|----------|--------|
| コード品質 | 7/10 |
| セキュリティ | 2/10 |
| 保守性 | 6/10 |

--- 結果 ---
成功: true
ターン数: 8
コスト (USD): 0.4319
```

## ポイント

1. **並列処理**: 5つのファイルを並列でレビュー（複数のTaskツールが同時に呼び出される）
2. **専門化**: security-auditorとcode-qualityで異なる観点から分析
3. **モデル選択**: サブエージェントには `haiku` を使用してコスト削減
4. **自律的な委任**: メインエージェントが適切なタイミングでサブエージェントを呼び出す

## AgentDefinition の設定項目

| フィールド | 必須 | 説明 |
|------------|------|------|
| `description` | Yes | エージェントの用途を説明（いつ使うか） |
| `prompt` | Yes | エージェントのシステムプロンプト |
| `model` | No | 使用モデル: `sonnet`, `opus`, `haiku`, `inherit` |
| `tools` | No | 許可するツールの配列 |

## コスト比較

| 実行パターン | コスト |
|--------------|--------|
| 単一エージェント（01〜03） | $0.03〜0.23 |
| サブエージェント使用（04） | $0.43 |

サブエージェントは便利だが、コストが増加する点に注意。
