# 07: プログラマティックツール呼び出し

## 概要

Claude Agent SDKでは、使用可能なツールをプログラムで制御できる。
これにより、安全性の向上やタスクに応じたツール制限が可能。

## 3つの制御方法

| 方法 | オプション | 説明 |
|------|------------|------|
| 許可リスト | `allowedTools` | 指定したツールのみ使用可能 |
| 禁止リスト | `disallowedTools` | 指定したツールを使用不可 |
| カスタム権限 | `canUseTool` | ツール呼び出し時にカスタムロジックで判定 |

## デモ1: 許可ツールの制限

```javascript
const result = query({
  prompt: "ファイル一覧を取得し、package.jsonを読み、sample.txtを作成して",
  options: {
    // Read と Glob のみ許可、Write は使用不可
    allowedTools: ["Read", "Glob"],
  },
});
```

### 結果

| 操作 | ツール | 結果 |
|------|--------|------|
| ファイル一覧取得 | Glob | ✅ 成功 |
| package.json 読み込み | Read | ✅ 成功 |
| sample.txt 作成 | Write | ❌ 失敗（ツールが制限されている） |

## デモ2: カスタム権限チェック（canUseTool）

```javascript
const result = query({
  prompt: "pwd, rm -rf /tmp/test, echo Hello, ls -la を実行して",
  options: {
    permissionMode: "default",
    // カスタム権限チェック関数
    canUseTool: async (toolName, input, options) => {
      if (toolName === "Bash") {
        const command = input.command || "";

        // 危険なコマンドをブロック
        const dangerousPatterns = [/rm\s+-rf/, /rm\s+-r/, /mkfs/, /dd\s+if=/];

        for (const pattern of dangerousPatterns) {
          if (pattern.test(command)) {
            return {
              behavior: "deny",
              message: `セキュリティポリシーにより実行不可: ${command}`,
            };
          }
        }
      }

      return { behavior: "allow", updatedInput: input };
    },
  },
});
```

### 結果

```
[権限チェック] ツール: Bash
  → 許可: pwd
[権限チェック] ツール: Bash
  → ブロック: 危険なコマンド "rm -rf /tmp/test"
[権限チェック] ツール: Bash
  → 許可: echo "Hello"
```

## デモ3: 禁止ツールの指定

```javascript
const result = query({
  prompt: "Node.jsのバージョンを確認して",
  options: {
    // Bash を禁止
    disallowedTools: ["Bash"],
  },
});
```

### 結果

Bashが使えないため、エージェントは代替手段を模索:
1. `.nvmrc` や `.node-version` ファイルを探索
2. `package.json` の `engines` フィールドを確認
3. 依存パッケージの要件から推測

→ 直接確認できなかったが、SDK要件として「Node.js 18.0.0以上」を報告

## canUseTool の戻り値

```typescript
type PermissionResult =
  | {
      behavior: 'allow';
      updatedInput: ToolInput;  // 入力を変更することも可能
      updatedPermissions?: PermissionUpdate[];
    }
  | {
      behavior: 'deny';
      message: string;  // エージェントに伝えるエラーメッセージ
      interrupt?: boolean;  // trueで処理を中断
    }
```

## 実行結果

```
=== 07: プログラマティックツール呼び出しデモ ===

--- デモ1: 許可ツールの制限（Read, Globのみ） ---
[ツール使用: Glob] ✅
[ツール使用: Read] ✅
[ツール使用: Write] ❌ エラー

--- デモ2: カスタム権限チェック ---
[権限チェック] ツール: Bash
  → 許可: pwd
[権限チェック] ツール: Bash
  → ブロック: 危険なコマンド "rm -rf ..."

--- デモ3: 禁止ツールの指定（Bashを禁止） ---
[ツール使用: Glob] （代替手段として使用）
[ツール使用: Read] （package.jsonから情報を取得）
```

## ユースケース

| ユースケース | 設定例 |
|--------------|--------|
| 読み取り専用エージェント | `allowedTools: ["Read", "Glob", "Grep"]` |
| ファイル編集禁止 | `disallowedTools: ["Write", "Edit"]` |
| コマンド実行制限 | `canUseTool` で危険なコマンドをブロック |
| 外部アクセス禁止 | `disallowedTools: ["WebSearch", "WebFetch"]` |

## ポイント

1. **allowedTools**: ホワイトリスト方式、明示的に許可したツールのみ使用可能
2. **disallowedTools**: ブラックリスト方式、特定のツールのみ禁止
3. **canUseTool**: 最も柔軟、入力内容に応じて動的に判定可能
4. **エージェントの適応**: ツールが使えない場合、代替手段を自動的に模索する
