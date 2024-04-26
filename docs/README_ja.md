# Bedrock Claude Chat

> [!Tip]
> 🔔**Claude3 Opus をサポートしました。** 2024/04/17 現在、Bedrock は`us-west-2`のみサポートしています。このリポジトリでは Bedrock はデフォルトで`us-east-1`リージョンを利用します。このため、ご利用される場合はデプロイ前に`bedrockRegion`の値を変更してください。詳細は[こちら](#deploy-using-cdk)

> [!Warning]
> 現在のバージョン(v0.4.x)は、DynamoDB テーブルスキーマの変更のため、過去バージョン(~v0.3.0)とは互換性がありません。**以前のバージョンから v0.4.x へアップデートすると、既存の対話記録は全て破棄されますので注意が必要です。**

このリポジトリは、生成系 AI を提供する[Amazon Bedrock](https://aws.amazon.com/jp/bedrock/)の基盤モデルの一つである、Anthropic 社製 LLM [Claude](https://www.anthropic.com/)を利用したチャットボットのサンプルです。

### 基本的な会話

[Claude 3](https://www.anthropic.com/news/claude-3-family)によるテキストと画像の両方を利用したチャットが可能です。現在`Haiku`および`Sonnet`、まだは`Opus`をサポートしています。
![](./imgs/demo_ja.gif)

### ボットのカスタマイズ

外部のナレッジおよび具体的なインストラクションを組み合わせ、ボットをカスタマイズすることが可能です（外部のナレッジを利用した方法は[RAG](./RAG_ja.md)として知られています）。なお、作成したボットはアプリケーションのユーザー間で共有することができます。カスタマイズされたボットはスタンドアロンの API として公開できます (詳細は[こちら](./docs/PUBLISH_API.md)をご覧ください)。

![](./imgs/bot_creation_ja.png)
![](./imgs/bot_chat_ja.png)
![](./imgs/bot_api_publish_screenshot3.png)

### 管理者ダッシュボード

管理者ダッシュボードで各ユーザー/ボットの使用状況を分析できます。[詳細](./docs/ADMINISTRATOR.md)

![](./imgs/admin_bot_analytics.png)

## 🚀 まずはお試し

- us-east-1 リージョンにて、[Bedrock Model access](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess) > `Manage model access` > `Anthropic / Claude 3 Haiku`, `Anthropic / Claude 3 Sonnet` `Cohere / Embed Multilingual`をチェックし、`Save changes`をクリックします

<details>
<summary>スクリーンショット</summary>

![](./imgs/model_screenshot.png)

</details>

- [CloudShell](https://console.aws.amazon.com/cloudshell/home)をデプロイしたいリージョン (ap-northeast-1 など) で開きます

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
- [Amazon Athena](https://aws.amazon.com/athena/): S3 バケット内のデータを分析するクエリサービス

![](imgs/arch.png)

## 機能・ロードマップ

<details>
<summary>基本的なチャット機能</summary>

- [x] 認証 (サインアップ、サインイン)
- [x] 会話の作成、保存、削除
- [x] チャットボットの返答のコピー
- [x] 会話のための自動的なトピックの提案
- [x] コードの構文強調表示
- [x] Markdown の表示
- [x] ストリーミング応答
- [x] IP アドレスの制限
- [x] メッセージの編集と再送信
- [x] 国際化
- [x] モデルの切り替え
</details>

<details>
<summary>カスタマイズされたボットの機能</summary>

- [x] カスタマイズされたボットの作成
- [x] カスタマイズされたボットの共有
- [x] 独立した API として公開
</details>

<details>
<summary>RAG機能</summary>

- [x] Web (html)
- [x] テキストデータ (txt、csv、markdown など)
- [x] PDF
- [x] Microsoft Office ファイル (pptx、docx、xlsx)
- [x] YouTube の字幕
- [ ] S3 バケットからのインポート
- [ ] 既存の Kendra / OpenSearch / KnowledgeBase からのインポート
</details>

<details>
<summary>管理者機能</summary>

- [x] ボットごとの使用料の追跡
- [x] 公開されたボットの一覧表示
</details>

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

### Mistral を利用する

cdk.json 内の`enableMistral`を`true`に更新し、`cdk deploy`を実行します。

```json
...
  "enableMistral": true,
```

> [!Important]
> このプロジェクトは Anthropic の Claude モデルを中心としており、Mistral モデルはサポートが限定的です。例えば、プロンプトの例は Claude モデルを基準としています。これは Mistral モデル専用のオプションです。一度 Mistral モデルを有効にすると、すべてのチャット機能で Mistral モデルのみを使用できます。Claude モデルと Mistral モデルの両方を使用することはできません。

### テキスト生成パラメータの設定

[config.py](../backend/app/config.py)を編集後、`cdk deploy`を実行してください。

```py
GENERATION_CONFIG = {
    "max_tokens_to_sample": 500,
    "temperature": 0.6,
    "top_k": 250,
    "top_p": 0.999,
    "stop_sequences": ["Human: ", "Assistant: "],
}
```

### サインアップ可能なメールアドレスのドメインを制限

このサンプルはデフォルトではサインアップ可能なメールアドレスのドメインに制限がありません。特定のドメインのみに限定してサインアップを可能にするには、 `cdk.json` を開き、`allowedSignUpEmailDomains` にリスト形式でドメインを指定してください。

```
"allowedSignUpEmailDomains": ["example.com"],
```

### リソースの削除

cli および CDK を利用されている場合、`cdk destroy`を実行してください。そうでない場合は[CloudFormation](https://console.aws.amazon.com/cloudformation/home)へアクセスし、手動で`BedrockChatStack`および`FrontendWafStack`を削除してください。なお`FrontendWafStack`は `us-east-1` リージョンにあります。

### RAG 用ベクトル DB の停止

[cdk.json](../cdk/cdk.json) を以下のように CRON 形式で設定することで、[VectorStore コンストラクト](../cdk/lib/constructs/vectorstore.ts)で作成される Aurora Serverless リソースを停止・再起動できます。この設定を適用することで運用コストの削減が見込めます。なお、デフォルト設定で Aurora Serverless は常時起動状態になっています。なお UTC で実行される点に留意ください。

```json
...
"rdbSchedules": {
  "stop": {
    "minute": "50",
    "hour": "10",
    "day": "*",
    "month": "*",
    "year": "*"
  },
  "start": {
    "minute": "40",
    "hour": "2",
    "day": "*",
    "month": "*",
    "year": "*"
  }
}
```

### 言語設定について

このアセットは、[i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector) を用いて自動で言語を検出します。もし任意の言語へ変更されたい場合はアプリケーション左下のメニューから切り替えてください。なお以下のように Query String で設定することも可能です。

> `https://example.com?lng=ja`

### セルフサインアップを無効化する

このサンプルはデフォルトでセルフサインアップが有効化してあります。セルフサインアップを無効にするには、[auth.ts](./cdk/lib/constructs/auth.ts)を開き、`selfSignUpEnabled` を `false` に変更してから再デプロイしてください。

```ts
const userPool = new UserPool(this, "UserPool", {
  passwordPolicy: {
    requireUppercase: true,
    requireSymbols: true,
    requireDigits: true,
    minLength: 8,
  },
  // Set to false
  selfSignUpEnabled: false,
  signInAliases: {
    username: false,
    email: true,
  },
});
```

### 外部のアイデンティティプロバイダー

このサンプルは外部のアイデンティティプロバイダーをサポートしています。現在、[Google](./idp/SET_UP_GOOGLE_ja.md)および[カスタム OIDC プロバイダー](./idp/SET_UP_CUSTOM_OIDC.md)をサポートしています。

### ローカルでの開発について

- [こちら](./LOCAL_DEVELOPMENT_ja.md)を参照ください。

### Pull Request

コントリビュートを検討していただきありがとうございます！バグ修正、言語翻訳（i18n）、機能拡張、その他の改善を歓迎しています。

機能拡張やその他の改善については、**プルリクエストを作成する前に、実装方法や詳細について議論するために、Feature Request Issue を作成いただくようお願いいたします。**

バグ修正については、直接プルリクエストを作成してください。

コントリビュートする前に、以下のガイドラインもご確認ください。

- [ローカル環境での開発](./LOCAL_DEVELOPMENT_ja.md)
- [CONTRIBUTING](../CONTRIBUTING.md)

### RAG (Retrieval Augmented Generation, 検索拡張生成)

[こちら](./RAG_ja.md)を参照
