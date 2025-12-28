# 09: 開発サイクル自動化

## 概要

1つのプロンプトで **実装 → ビルド → テスト → 修正** のサイクルを自動化する。
エージェントがテスト結果を見て、失敗があれば自動的に修正して再テストする。

## ワークフロー

```
┌─────────────┐
│   計画      │  タスクを理解し、実装方針を決定
└──────┬──────┘
       ↓
┌─────────────┐
│   実装      │  コードを書く（Write ツール）
└──────┬──────┘
       ↓
┌─────────────┐
│  テスト     │  テストを実行（Bash ツール）
└──────┬──────┘
       ↓
   ┌───┴───┐
   │ 失敗? │
   └───┬───┘
    Yes │ No
       ↓   ↓
┌──────┴┐  └──→ 完了
│ 修正  │
└───┬───┘
    └──→ テストに戻る
```

## 使い方

```bash
# デフォルトタスク（Calculator実装）を実行
node 09_dev_cycle.mjs

# カスタムタスクを指定
node 09_dev_cycle.mjs --task "FizzBuzz関数を実装して"

# 作業ディレクトリを指定
node 09_dev_cycle.mjs --cwd /path/to/project --task "..."
```

## サンプルコード (`09_dev_cycle.mjs`)

```javascript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function main() {
  const result = query({
    prompt: `
簡単なNode.jsプロジェクトを作成してください。

要件:
1. src/calculator.mjs に Calculator クラスを実装
2. test/calculator.test.mjs にテストを実装
3. package.json に test スクリプトを追加

実装後:
- npm test でテストを実行
- テストが失敗したら修正
- 全テストが通るまで繰り返す
`,
    options: {
      cwd: "/path/to/project",
      systemPrompt: `あなたは経験豊富なソフトウェアエンジニアです。
以下のワークフローで開発を進めてください:
1. 計画: 実装する内容を明確にする
2. 実装: コードを書く
3. テスト: テストを実行する
4. 修正: エラーがあれば修正し、再テスト
5. 完了: 全テストが通ったら結果を報告`,
      permissionMode: "bypassPermissions",
      allowDangerouslySkipPermissions: true,
      maxTurns: 30,  // 無限ループ防止
    },
  });

  for await (const message of result) {
    // 進捗を表示
  }
}
```

## 実行結果

```
=== 09: 開発サイクル自動化デモ ===

作業ディレクトリ: .../demo_project
タスク: Calculator クラスを実装...

--- 実行開始 ---

[テスト実行 #1]  ← 最初のテスト（まだファイルがない）
[Write]          ← package.json 作成
[Write]          ← src/calculator.mjs 作成
[Write]          ← test/calculator.test.mjs 作成
[テスト実行 #2]  ← テスト実行

## ✅ 完了！

テスト結果:
✔ tests 13
✔ pass 13
✔ fail 0

==================================================
開発サイクル完了
==================================================

--- 統計 ---
テスト実行回数: 2
コード修正回数: 0
ターン数: 8

ツール使用回数:
  Write: 4回
  Bash: 3回

--- 結果 ---
成功: true
コスト (USD): 0.1654
```

## 生成されたファイル

```
demo_project/
├── package.json
├── src/
│   └── calculator.mjs    ← Calculatorクラス
└── test/
    └── calculator.test.mjs  ← 13個のテスト
```

### src/calculator.mjs

```javascript
export class Calculator {
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
  multiply(a, b) { return a * b; }
  divide(a, b) {
    if (b === 0) throw new Error('Cannot divide by zero');
    return a / b;
  }
}
```

## ポイント

1. **maxTurns**: 無限ループ防止のため上限を設定（デフォルト30）
2. **システムプロンプト**: ワークフローを明示的に指示
3. **自己修正**: テスト失敗時にエージェントが自動で原因分析・修正
4. **進捗表示**: ツール使用をリアルタイムで表示

## ROS2プロジェクトへの応用例

```javascript
const result = query({
  prompt: `
ROS2パッケージを作成してください。

要件:
1. パッケージ名: my_robot_controller
2. ノード: velocity_controller
   - /cmd_vel (geometry_msgs/Twist) をsubscribe
   - /motor_pwm (std_msgs/Int32MultiArray) をpublish
3. Python実装

実装後:
- colcon build でビルド
- colcon test でテスト
- エラーがあれば修正
`,
  options: {
    cwd: "/path/to/ros2_ws/src",
    maxTurns: 50,
  },
});
```

## コスト

| 項目 | 値 |
|------|-----|
| ターン数 | 8 |
| テスト実行 | 2回 |
| コード修正 | 0回（一発成功） |
| コスト | $0.17 |

修正が必要な場合はターン数・コストが増加する。
