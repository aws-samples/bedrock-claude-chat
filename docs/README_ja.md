# Bedrock Claude Chat

![](https://github.com/aws-samples/bedrock-claude-chat/actions/workflows/test.yml/badge.svg)

> [!Tip]
> 🔔**[Claude v3 (Sonnet)](https://aws.amazon.com/jp/about-aws/whats-new/2024/03/anthropics-claude-3-sonnet-model-amazon-bedrock/) による画像とテキスト両方を使ったチャットが可能になりました。** 詳細は[Release](https://github.com/aws-samples/bedrock-claude-chat/releases/tag/v0.4.2)をご確認ください。

> [!Warning]
> 現在のバージョン(v0.4.x)は、DynamoDB テーブルスキーマの変更のため、過去バージョン(~v0.3.0)とは互換性がありません。**以前のバージョンから v0.4.x へアップデートすると、既存の対話記録は全て破棄されますので注意が必要です。**

このリポジトリは、生成系 AI を提供する[Amazon Bedrock](https://aws.amazon.com/jp/bedrock/)の基盤モデルの一つである、Anthropic 社製 LLM [Claude](https://www.anthropic.com/)を利用したチャットボットのサンプルです。

### 基本的な会話

[Claude 3 Sonnet](https://www.anthropic.com/news/claude-3-family)によるテキストと画像の両方を利用したチャットが可能です。
![](./imgs/demo_ja.gif)

> [!Note]
> 現在画像は DynamoDB [アイテムサイズ制限](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html#limits-items) のため 800px jpeg へ変換されます。[Issue](https://github.com/aws-samples/bedrock-claude-chat/issues/131)

### ボットのカスタマイズ

外部のナレッジおよび具体的なインストラクションを組み合わせ、ボットをカスタマイズすることが可能です（外部のナレッジを利用した方法は[RAG](./RAG_ja.md)として知られています）。なお、作成したボットはアプリケーションのユーザー間で共有することができます。

![](./imgs/bot_creation_ja.png)
![](./imgs/bot_chat_ja.png)

## 🚀 まずはお試し

- us-east-1 リージョンにて、[Bedrock Model access](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess) > `Manage model access` > `Anthropic / Claude`, `Anthropic / Claude Instant`, `Anthropic / Claude 3 Sonnet`, `Cohere / Embed Multilingual`をチェックし、`Save changes`をクリックします
<details>
<summary>スクリーンショット</summary>

![](./imgs/model_screenshot.png)

</details>
- [CloudShell](https://console.aws.amazon.com/cloudshell/home)をデプロイしたいリージョン (ap-northeast-1など) で開きます

- 下記のコマンドでデプロイ実行します

```sh
git clone https://github.com/aws-samples/bedrock-claude-chat.git
cd bedrock-claude-chat
chmod +x bin.sh
./bin.sh
```

- 30 分ほど経過後、下記の出力が得られるのでブラウザからアクセスします

```
Frontend URL: https://xxxxxxxxx.cloudfront.net
```

![](./imgs/signin.png)

上記のようなサインアップ画面が現れますので、E メールを登録・ログインしご利用ください。

> [!Important]
> このデプロイ方法では、URL を知っている誰でもサインアップできてしまいます。本番運用で使用する場合は、セキュリティリスクを軽減するために IP アドレス制限やセルフサインアップの無効化を強くお勧めします。設定方法は、IP アドレス制限の場合は[Deploy using CDK](#deploy-using-cdk)、セルフサインアップの無効化の場合は[セルフサインアップを無効化する](#セルフサインアップを無効化する)をご覧ください。

## アーキテクチャ

AWS のマネージドサービスで構成した、インフラストラクチャ管理の不要なアーキテクチャとなっています。Amazon Bedrock の活用により、 AWS 外部の API と通信する必要がありません。スケーラブルで信頼性が高く、安全なアプリケーションをデプロイすることが可能です。

- [Amazon DynamoDB](https://aws.amazon.com/jp/dynamodb/): 会話履歴保存用の NoSQL データベース
- [Amazon API Gateway](https://aws.amazon.com/jp/api-gateway/) + [AWS Lambda](https://aws.amazon.com/jp/lambda/): バックエンド API エンドポイント ([AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter), [FastAPI](https://fastapi.tiangolo.com/))
- [Amazon CloudFront](https://aws.amazon.com/jp/cloudfront/) + [S3](https://aws.amazon.com/jp/s3/): フロントエンドアプリケーションの配信 ([React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/))
- [AWS WAF](https://aws.amazon.com/jp/waf/): IP アドレス制限
- [Amazon Cognito](https://aws.amazon.com/jp/cognito/): ユーザ認証
- [Amazon Bedrock](https://aws.amazon.com/jp/bedrock/): 基盤モデルを API 経由で利用できるマネージドサービス。Claude はチャットの応答に利用され、Cohere は RAG 用のベクトル埋め込みに利用されます
- [Amazon EventBridge Pipes](https://aws.amazon.com/eventbridge/pipes/): DynamoDB からのイベントを受け取り、後続の ECS タスクを起動することで、外部のナレッジをカスタマイズ bot に反映します
- [Amazon Elastic Container Service](https://aws.amazon.com/ecs/): ナレッジをクロール・パースし、埋め込みベクトルと共に Aurora PostgreSQL へ保存します。[Cohere Multilingual](https://txt.cohere.com/multilingual/)がベクトル計算に利用されます
- [Amazon Aurora PostgreSQL](https://aws.amazon.com/rds/aurora/): [pgvector](https://github.com/pgvector/pgvector) プラグインを利用したスケーラブルなベクトル DB

![](imgs/arch.png)

## 機能・ロードマップ

### 基本

- [x] 認証 (サインアップ・サインイン)
- [x] 会話の新規作成・保存・削除
- [x] チャットボットの返信内容のコピー
- [x] 会話の件名自動提案
- [x] コードのシンタックスハイライト
- [x] マークダウンのレンダリング
- [x] ストリーミングレスポンス
- [x] IP アドレス制限
- [x] メッセージの編集と再送
- [x] I18n
- [x] モデルの切り替え (Claude Instant / Claude)

### カスタマイズボット

- [x] カスタマイズボットの作成
- [x] カスタマイズボットのシェア

### RAG

- [x] Web (html)
- [x] テキストデータ (txt, csv, markdown and etc)
- [x] PDF
- [x] Microsoft オフィス (pptx, docx, xlsx)
- [x] Youtube 字幕

### 管理者用機能

- [ ] ユーザーの利用状況分析

## Deploy using CDK

上記 Easy Deployment は[AWS CodeBuild](https://aws.amazon.com/jp/codebuild/)を利用し、内部で CDK によるデプロイを実行しています。ここでは直接 CDK によりデプロイする手順を記載します。

- お手元に UNIX コマンドおよび Node.js, Docker 実行環境を用意してください。もし無い場合、[Cloud9](https://github.com/aws-samples/cloud9-setup-for-prototyping)をご利用いただくことも可能です。

> [!Note]
> デプロイ時にローカル環境のストレージ容量が不足すると CDK のブートストラップがエラーとなってしまう可能性があります。Cloud9 等で実行される場合は、インスタンスのボリュームサイズを拡張のうえデプロイ実施されることをお勧めします。

- このリポジトリをクローンします

```
git clone https://github.com/aws-samples/bedrock-claude-chat
```

- npm パッケージをインストールします

```
cd bedrock-claude-chat
cd cdk
npm ci
```

- [AWS CDK](https://aws.amazon.com/jp/cdk/)をインストールします

```
npm i -g aws-cdk
```

- CDK デプロイ前に、デプロイ先リージョンに対して 1 度だけ Bootstrap の作業が必要となります。ここでは東京リージョンへデプロイするものとします。なお`<account id>`はアカウント ID に置換してください。

```
cdk bootstrap aws://<account id>/ap-northeast-1
```

- 必要に応じて[cdk.json](../cdk/cdk.json)の下記項目を編集します

  - `bedrockRegion`: Bedrock が利用できるリージョン
  - `allowedIpV4AddressRanges`, `allowedIpV6AddressRanges`: 許可する IP アドレス範囲の指定

- プロジェクトをデプロイします

```
cdk deploy --require-approval never --all
```

- 下記のような出力が得られれば成功です。`BedrockChatStack.FrontendURL`に WEB アプリの URL が出力されますので、ブラウザからアクセスしてください。

```sh
 ✅  BedrockChatStack

✨  Deployment time: 78.57s

Outputs:
BedrockChatStack.AuthUserPoolClientIdXXXXX = xxxxxxx
BedrockChatStack.AuthUserPoolIdXXXXXX = ap-northeast-1_XXXX
BedrockChatStack.BackendApiBackendApiUrlXXXXX = https://xxxxx.execute-api.ap-northeast-1.amazonaws.com
BedrockChatStack.FrontendURL = https://xxxxx.cloudfront.net
```

## その他

### テキスト生成パラメータ・ベクトル埋め込みパラメータの設定

[config.py](../backend/app/config.py)を編集後、`cdk deploy`を実行してください。

```py
GENERATION_CONFIG = {
    "max_tokens_to_sample": 500,
    "temperature": 0.6,
    "top_k": 250,
    "top_p": 0.999,
    "stop_sequences": ["Human: ", "Assistant: "],
}

EMBEDDING_CONFIG = {
    "model_id": "amazon.titan-embed-text-v1",
    "chunk_size": 1000,
    "chunk_overlap": 100,
}
```

### リソースの削除

cli および CDK を利用されている場合、`cdk destroy`を実行してください。そうでない場合は[CloudFormation](https://console.aws.amazon.com/cloudformation/home)へアクセスし、手動で`BedrockChatStack`および`FrontendWafStack`を削除してください。なお`FrontendWafStack`は `us-east-1` リージョンにあります。

### 言語設定について

このアセットは、[i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) を用いて自動で言語を検出します。もし任意の言語へ変更されたい場合はアプリケーション左下のメニューから切り替えてください。なお以下のように Query String で設定することも可能です。

> `https://example.com?lng=ja`

### セルフサインアップを無効化する

このサンプルはデフォルトでセルフサインアップが有効化してあります。セルフサインアップを無効にするには、[auth.ts](./cdk/lib/constructs/auth.ts)を開き、`selfSignUpEnabled` を `false` に切り替えてから再デプロイしてください。

```ts
const userPool = new UserPool(this, "UserPool", {
  passwordPolicy: {
    requireUppercase: true,
    requireSymbols: true,
    requireDigits: true,
    minLength: 8,
  },
  // true -> false
  selfSignUpEnabled: false,
  signInAliases: {
    username: false,
    email: true,
  },
});
```

### ローカルでの開発について

- [こちら](./LOCAL_DEVELOPMENT_ja.md)を参照ください。

### Pull Request

バグ修正や機能追加など、Pull Request は大変ありがたく思っています。下記をご参考にしていただけますと幸いです。

- [ローカル環境での開発](./LOCAL_DEVELOPMENT_ja.md)
- [CONTRIBUTING](../CONTRIBUTING.md)

### RAG (Retrieval Augmented Generation, 検索拡張生成)

[こちら](./RAG_ja.md)を参照
