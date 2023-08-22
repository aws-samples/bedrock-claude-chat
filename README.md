# Bedrock Claude Chat

このリポジトリは、生成系 AI を提供する[Amazon Bedrock](https://aws.amazon.com/jp/bedrock/)の基盤モデルの一つである、Anthropic 社製 LLM [Claude 2](https://www.anthropic.com/index/claude-2)を利用したチャットボットのサンプルです。**2023/8 月現在、Bedrock はプレビュー中です。ご利用の際は申請が必要です。**

![](./docs/imgs/demo1.gif)
![](./docs/imgs/demo2.gif)

## アーキテクチャ

AWS のマネージドサービスで構成した、インフラストラクチャ管理の不要なアーキテクチャとなっています。Amazon Bedrock の活用により、 AWS 外部の API と通信する必要がありません。スケーラブルで信頼性が高く、安全なアプリケーションをデプロイすることが可能です。

- [Amazon DynamoDB](https://aws.amazon.com/jp/dynamodb/): 会話履歴保存用の NoSQL データベース
- [Amazon API Gateway](https://aws.amazon.com/jp/api-gateway/) + [AWS Lambda](https://aws.amazon.com/jp/lambda/): バックエンド API エンドポイント ([AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter), [FastAPI](https://fastapi.tiangolo.com/))
- [Amazon CloudFront](https://aws.amazon.com/jp/cloudfront/) + [S3](https://aws.amazon.com/jp/s3/): フロントエンドアプリケーションの配信 ([React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/))
- [Amazon Cognito](https://aws.amazon.com/jp/cognito/): ユーザ認証
- [Amazon Bedrock](https://aws.amazon.com/jp/bedrock/): 基盤モデルを API 経由で利用できるマネージドサービス

![](docs/imgs/arch.png)

## 機能

- 認証 (サインアップ・サインイン)
- 会話の新規作成・保存・削除
- チャットボットの返信内容のコピー
- 会話の件名自動提案
- コードのシンタックスハイライト
- マークダウンのレンダリング

## プロジェクトのデプロイ

### 前提条件

- **2023/8 月現在、Bedrock はプレビュー中です。ご利用の際は申請が必要です。**

### 🚀 Easy Deployment

- [CloudShell](https://console.aws.amazon.com/cloudshell/home)を開きます
- 下記のコマンドでリポジトリをクローンします

```sh
git clone https://github.com/aws-samples/bedrock-claude-chat.git
```

- 下記のコマンドでデプロイ実行します

```sh
cd bedrock-claude-chat
./bin.sh
```

- 10 分ほど経過後、下記の出力が得られるのでブラウザからアクセスします

```
Frontend URL: https://xxxxxxxxx.cloudfront.net
```

![](./docs/imgs/signin.png)

上記のようなサインアップ画面が現れますので、E メールを登録・ログインしご利用ください。

### Deploy using CDK

上記 Easy Deployment は[AWS CodeBuild](https://aws.amazon.com/jp/codebuild/)を利用し、内部で CDK によるデプロイを実行しています。ここでは直接 CDK によりデプロイする手順を記載します。

- お手元に UNIX コマンドおよび Node.js 実行環境を用意してください。もし無い場合、[Cloud9](https://github.com/aws-samples/cloud9-setup-for-prototyping)をご利用いただくことも可能です

- このリポジトリをクローンします

```
git clone https://github.com/aws-samples/bedrock-claude-chat
```

- npm パッケージをインストールします

```
cd bedrock-claude-chat
npm ci
```

- [AWS CDK](https://aws.amazon.com/jp/cdk/)をインストールします

```
npm i -g aws-cdk
```

- CDK デプロイ前に、デプロイ先リージョンに対して 1 度だけ Bootstrap の作業が必要となります。ここでは東京リージョンへデプロイするものとします

```
cd cdk
cdk bootstrap ap-northeast-1
```

- 必要に応じて[cdk.json](./cdk/cdk.json)の下記項目を編集します

  - `bedrockRegion`: Bedrock が利用できるリージョン
  - `bedrockEndpointUrl`: Bedrock エンドポイントの URL

- プロジェクトをデプロイします

```
cdk deploy --require-approval never
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

### テキスト生成パラメータの設定

[config.py](./backend/config.py)を編集後、`cdk deploy`を実行してください。

```py
GENERATION_CONFIG = {
    "max_tokens_to_sample": 500,
    "temperature": 0.0,
    "top_k": 250,
    "top_p": 0.999,
    "stop_sequences": ["Human: ", "Assistant: "],
}
```
