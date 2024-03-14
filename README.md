# Bedrock Claude Chat

![](https://github.com/aws-samples/bedrock-claude-chat/actions/workflows/test.yml/badge.svg)

> [!Tip]
> 🔔**Multi-modal chat by [Claude v3 (Haiku, Sonnet)](https://aws.amazon.com/jp/about-aws/whats-new/2024/03/anthropics-claude-3-sonnet-model-amazon-bedrock/) is available for now**. See [Release](https://github.com/aws-samples/bedrock-claude-chat/releases/tag/v0.4.4) for the detail.

> [!Warning]
> The current version (`v0.4.x`) has no compatibility with ex version (~`v0.3.0`) due to the change of DynamoDB table schema. **Please note that UPDATE (i.e. `cdk deploy`) FROM EX VERSION TO `v0.4.x` WILL DESTROY ALL OF EXISTING CONVERSATIONS.**

This repository is a sample chatbot using the Anthropic company's LLM [Claude](https://www.anthropic.com/), one of the foundational models provided by [Amazon Bedrock](https://aws.amazon.com/bedrock/) for generative AI.

### Basic Conversation

Not only text but also images are available with [Anthropic's Claude 3](https://www.anthropic.com/news/claude-3-family). Currently we support `Haiku` and `Sonnet`.

![](./docs/imgs/demo.gif)

> [!Note]
> Currently the image will be compressed into 800px jpeg due to DynamoDB [item size limitation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/ServiceQuotas.html#limits-items). [Issue](https://github.com/aws-samples/bedrock-claude-chat/issues/131)

### Bot Personalization

Add your own instruction and give external knowledge as URL or files (a.k.a [RAG](./docs/RAG.md)). The bot can be shared among application users.

![](./docs/imgs/bot_creation.png)
![](./docs/imgs/bot_chat.png)

## 📚 Supported Languages

- English 💬
- 日本語 💬 (ドキュメントは[こちら](./docs/README_ja.md))
- 한국어 💬
- 中文 💬

## 🚀 Super-easy Deployment

- On us-east-1 region, open [Bedrock Model access](https://us-east-1.console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess) > `Manage model access` > Check `Anthropic / Claude 3 Haiku`, `Anthropic / Claude 3 Sonnet` and `Cohere / Embed Multilingual` then `Save changes`.

<details>
<summary>Screenshot</summary>

![](./docs/imgs/model_screenshot.png)

</details>

- Open [CloudShell](https://console.aws.amazon.com/cloudshell/home) at the region where you want to deploy
- Run deployment via following commands

```sh
git clone https://github.com/aws-samples/bedrock-claude-chat.git
cd bedrock-claude-chat
chmod +x bin.sh
./bin.sh
```

- After about 30 minutes, you will get the following output, which you can access from your browser

```
Frontend URL: https://xxxxxxxxx.cloudfront.net
```

![](./docs/imgs/signin.png)

The sign-up screen will appear as shown above, where you can register your email and log in.

> [!Important]
> This deployment method allows anyone with the URL to sign up. For production use, we strongly recommend adding IP address restrictions or disabling self-signup to mitigate security risks. To set up, [Deploy using CDK](#deploy-using-cdk) for IP address restrictions or [Disable self sign up](#disable-self-sign-up).

## Architecture

It's an architecture built on AWS managed services, eliminating the need for infrastructure management. Utilizing Amazon Bedrock, there's no need to communicate with APIs outside of AWS. This enables deploying scalable, reliable, and secure applications.

- [Amazon DynamoDB](https://aws.amazon.com/dynamodb/): NoSQL database for conversation history storage
- [Amazon API Gateway](https://aws.amazon.com/api-gateway/) + [AWS Lambda](https://aws.amazon.com/lambda/): Backend API endpoint ([AWS Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter), [FastAPI](https://fastapi.tiangolo.com/))
- [Amazon CloudFront](https://aws.amazon.com/cloudfront/) + [S3](https://aws.amazon.com/s3/): Frontend application delivery ([React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/))
- [AWS WAF](https://aws.amazon.com/waf/): IP address restriction
- [Amazon Cognito](https://aws.amazon.com/cognito/): User authentication
- [Amazon Bedrock](https://aws.amazon.com/bedrock/): Managed service to utilize foundational models via APIs. Claude is used for chat response and Cohere for vector embedding
- [Amazon EventBridge Pipes](https://aws.amazon.com/eventbridge/pipes/): Receiving event from DynamoDB stream and launching ECS task to embed external knowledge
- [Amazon Elastic Container Service](https://aws.amazon.com/ecs/): Run crawling, parsing and embedding tasks. [Cohere Multilingual](https://txt.cohere.com/multilingual/) is the model used for embedding.
- [Amazon Aurora PostgreSQL](https://aws.amazon.com/rds/aurora/): Scalable vector store with [pgvector](https://github.com/pgvector/pgvector) plugin

![](docs/imgs/arch.png)

## Features and Roadmap

### Basic chat features

- [x] Authentication (Sign-up, Sign-in)
- [x] Creation, storage, and deletion of conversations
- [x] Copying of chatbot replies
- [x] Automatic subject suggestion for conversations
- [x] Syntax highlighting for code
- [x] Rendering of Markdown
- [x] Streaming Response
- [x] IP address restriction
- [x] Edit message & re-send
- [x] I18n
- [x] Model switch (Claude Instant / Claude)

### Customized bot features

- [x] Customized bot creation
- [x] Customized bot sharing

### RAG features

- [x] Web (html)
- [x] Text data (txt, csv, markdown and etc)
- [x] PDF
- [x] Microsoft office files (pptx, docx, xlsx)
- [x] Youtube transcript

### Admin features

- [ ] Admin console to analyze user usage

## Deploy using CDK

Super-easy Deployment uses [AWS CodeBuild](https://aws.amazon.com/codebuild/) to perform deployment by CDK internally. This section describes the procedure for deploying directly with CDK.

- Please have UNIX, Docker and a Node.js runtime environment. If not, you can also use [Cloud9](https://github.com/aws-samples/cloud9-setup-for-prototyping)

> [!Important]
> If there is insufficient storage space in the local environment during deployment, CDK bootstrapping may result in an error. If you are running in Cloud9 etc., we recommend expanding the volume size of the instance before deploying.

- Clone this repository

```
git clone https://github.com/aws-samples/bedrock-claude-chat
```

- Install npm packages

```
cd bedrock-claude-chat
cd cdk
npm ci
```

- Install [AWS CDK](https://aws.amazon.com/cdk/)

```
npm i -g aws-cdk
```

- Before deploying the CDK, you will need to work with Bootstrap once for the region you are deploying to. In this example, we will deploy to the us-east-1 region. Please replace your account id into `<account id>`.

```
cdk bootstrap aws://<account id>/us-east-1
```

- If necessary, edit the following entries in [cdk.json](./cdk/cdk.json) if necessary.

  - `bedrockRegion`: Region where Bedrock is available. **NOTE: Bedrock does NOT support all regions for now.**
  - `allowedIpV4AddressRanges`, `allowedIpV6AddressRanges`: Allowed IP Address range.

- Deploy this sample project

```
cdk deploy --require-approval never --all
```

- You will get output similar to the following. The URL of the web app will be output in `BedrockChatStack.FrontendURL`, so please access it from your browser.

```sh
 ✅  BedrockChatStack

✨  Deployment time: 78.57s

Outputs:
BedrockChatStack.AuthUserPoolClientIdXXXXX = xxxxxxx
BedrockChatStack.AuthUserPoolIdXXXXXX = ap-northeast-1_XXXX
BedrockChatStack.BackendApiBackendApiUrlXXXXX = https://xxxxx.execute-api.ap-northeast-1.amazonaws.com
BedrockChatStack.FrontendURL = https://xxxxx.cloudfront.net
```

## Others

### Configure text generation / embedding parameters

Edit [config.py](./backend/app/config.py) and run `cdk deploy`.

```py
# See: https://docs.anthropic.com/claude/reference/complete_post
GENERATION_CONFIG = {
    "max_tokens": 2000,
    "top_k": 250,
    "top_p": 0.999,
    "temperature": 0.6,
    "stop_sequences": ["Human: ", "Assistant: "],
}

EMBEDDING_CONFIG = {
    "model_id": "cohere.embed-multilingual-v3",
    "chunk_size": 1000,
    "chunk_overlap": 200,
}
```

### Remove resources

If using cli and CDK, please `cdk destroy`. If not, access to [CloudFormation](https://console.aws.amazon.com/cloudformation/home) then delete `BedrockChatStack` and `FrontendWafStack` manually. Please note that `FrontendWafStack` is on `us-east-1` region.

### Language Settings

This asset automatically detects the language using [i18next-browser-languageDetector](https://github.com/i18next/i18next-browser-languageDetector). You can switch languages from the application menu. Alternatively, you can use Query String to set the language as shown below.

> `https://example.com?lng=ja`

### Disable self sign up

This sample has self sign up enabled by default. To disable self sign up, open [auth.ts](./cdk/lib/constructs/auth.ts) and switch `selfSignUpEnabled` as `false`, then re-deploy.

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

### Local Development

See [LOCAL DEVELOPMENT](./docs/LOCAL_DEVELOPMENT.md).

### Contribution

Thank you for considering contribution on this repository! We welcome for bug fixes, language translation, feature enhancements, and other improvements. Please see following:

- [Local Development](./docs/LOCAL_DEVELOPMENT.md)
- [CONTRIBUTING](./CONTRIBUTING.md)

### RAG (Retrieval Augmented Generation)

See [here](./docs/RAG.md).

## Authors

- [Takehiro Suzuki](https://github.com/statefb)
- [Yusuke Wada](https://github.com/wadabee)

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
