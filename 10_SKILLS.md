# 10: Agent Skills

## 概要

Agent Skills は、Claudeの能力を「特定のタスクに特化して拡張」する仕組み。
サブエージェント（別の専門家に委任）とは異なり、スキルは「自分自身の能力を拡張する」アプローチ。

## Claude Plugins（コミュニティスキル集）

[claude-plugins.dev](https://claude-plugins.dev/skills/) は、Agent Skills のコミュニティマーケットプレイス。
約46,000以上のスキルが公開されており、検索・インストールして利用できる。

GitHub上の公開スキルが自動的にインデックス化され、すぐに利用可能。

### 人気のスキル

| スキル | 作者 | 説明 |
|--------|------|------|
| **frontend-design** | @anthropics | 高品質なフロントエンドUIを作成 |
| **prompt-engineering-patterns** | @wshobson | LLMパフォーマンス最適化のプロンプト技法 |
| **brainstorming** | @obra | 創造的作業前のアイデア探索・要件整理 |
| **skill-writer** | @pytorch | Agent Skills自体を作成するガイド |
| **systematic-debugging** | @obra | バグ修正前の体系的デバッグ手法 |

### スキルのインストール

```bash
# Claude Code CLI でインストール
claude plugins install @anthropics/frontend-design

# または手動でダウンロードして配置
~/.claude/skills/frontend-design/SKILL.md
```

## サブエージェントとの違い

| 項目 | サブエージェント (04, 08) | スキル (10) |
|------|---------------------------|-------------|
| 定義方法 | コード内 or 組み込み | ファイルシステム（SKILL.md） |
| 実行方式 | 別プロセスとして委任 | 自身の能力として実行 |
| 呼び出し | Task ツール | Skill ツール |
| ユースケース | 複雑な独立タスク | 専門知識の追加 |

## スキルの配置場所

```
プロジェクトスキル（チーム共有）:
  .claude/skills/<skill-name>/SKILL.md

ユーザースキル（個人用）:
  ~/.claude/skills/<skill-name>/SKILL.md
```

## SKILL.md の書き方

```markdown
---
name: data-analyzer
description: JSONやCSVなどのデータファイルを分析するスキル
---

# Data Analyzer Skill

## 説明
このスキルが何をするか

## いつ使用するか
- どんな要求のときに使うか
- キーワードや条件

## 手順
1. 具体的な手順
2. ステップバイステップで

## 出力例
期待される出力のサンプル
```

## 重要なポイント

### 1. settingSources の設定が必須

スキルを使用するには `settingSources` を明示的に設定する必要がある：

```javascript
const result = query({
  prompt: "データを分析して",
  options: {
    settingSources: ["project"],  // ← これが必須！
    allowedTools: ["Skill", "Read"],
  },
});
```

| 値 | 読み込み対象 |
|----|-------------|
| `"project"` | `.claude/skills/` |
| `"user"` | `~/.claude/skills/` |

### 2. allowedTools に "Skill" を含める

```javascript
allowedTools: ["Skill", "Read", "Write", "Bash"]
```

### 3. description がトリガー

Claudeは `description` フィールドを見て、スキルを使うかどうかを判断する。
具体的で関連キーワードを含む説明を書くことが重要。

## サンプルコード (`10_skills.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  // 利用可能なスキルを確認
  const result = query({
    prompt: "利用可能なスキルを教えてください",
    options: {
      cwd: process.cwd(),
      settingSources: ["project"],  // プロジェクトのスキルを読み込む
      allowedTools: ["Skill"],
    },
  });

  for await (const message of result) {
    // 結果を処理
  }
}
```

## ビルトインスキル

Agent SDKには以下のビルトインスキルが含まれている：

| スキル | 用途 |
|--------|------|
| PowerPoint | プレゼンテーション作成 |
| Excel | スプレッドシート操作 |
| Word | ドキュメント作成 |
| PDF | PDF処理 |

これらは `settingSources` を設定すると自動的に利用可能になる。

## 実行結果

```
=== 10: Agent Skills デモ ===

サンプルデータを作成: /path/to/sample_data.json

--- Part 1: 利用可能なスキルの確認 ---

利用可能なスキル:
- data-analyzer: JSONやCSVなどのデータファイルを分析するスキル

コスト: $0.0312

==================================================

--- Part 2: スキルを使ったデータ分析 ---

[ツール使用: Read]
[ツール使用: Skill]
  スキル: data-analyzer

## データ分析結果

ファイル: sample_data.json
形式: JSON配列
レコード数: 5

### 数値フィールドの統計
| フィールド | 最小 | 最大 | 平均 | 合計 |
|-----------|------|------|------|------|
| price     | 800  | 4500 | 2440 | 12200 |
| quantity  | 1    | 10   | 4.2  | 21 |

==================================================
デモ完了
==================================================

スキル使用: あり
成功: true
ターン数: 3
コスト (USD): 0.0856
```

## ユースケース

| ケース | 推奨 |
|--------|------|
| 特定ドメインの専門知識を追加 | スキル |
| チーム共通のワークフロー定義 | スキル（.claude/skills/） |
| 複雑な独立タスクの委任 | サブエージェント |
| 外部ツール連携 | MCPサーバー |

## トラブルシューティング

### スキルが見つからない

1. `settingSources` を確認:
   ```javascript
   // NG - スキルは読み込まれない
   options: { allowedTools: ["Skill"] }

   // OK - スキルが読み込まれる
   options: {
     settingSources: ["project"],
     allowedTools: ["Skill"]
   }
   ```

2. ディレクトリ構造を確認:
   ```bash
   ls .claude/skills/*/SKILL.md
   ```

### スキルが使用されない

1. `allowedTools` に `"Skill"` が含まれているか確認
2. SKILL.md の `description` が適切か確認
3. プロンプトがスキルの説明と関連しているか確認

## コスト目安

| 項目 | 値 |
|------|------|
| スキル一覧取得 | $0.03 |
| スキル使用（データ分析） | $0.09 |
| **合計** | **$0.12** |

## 参考

- [Agent Skills 概要](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- [Agent Skills ドキュメント (SDK)](https://platform.claude.com/docs/en/agent-sdk/skills)
- [Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Claude Plugins (Skills集)](https://claude-plugins.dev/skills/)
- [Skills Cookbook](https://github.com/anthropics/claude-cookbooks/tree/main/skills)
