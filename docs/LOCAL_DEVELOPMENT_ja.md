# ローカル環境での開発

## バックエンド

[backend/README](../backend/README.md)を参照下さい。

## フロントエンド

現在このサンプルでは、`cdk deploy` された AWS リソース（API Gateway、Cognito など）を使用してローカルでフロントを立ち上げながら改変作業を加えることができます。

1. [Deploy using CDK](./README_ja.md#deploy-using-cdk) を参考に AWS 環境上にデプロイを行う
2. `frontend/.env.template` 複製し `frontend/.env.local` という名前で保存する。
3. `.env.local` の中身を `cdk deploy` の出力結果（`BedrockChatStack.AuthUserPoolClientIdXXXXX` など）を見ながら穴埋めしていく
4. 下記コマンドを実行する

```zsh
cd frontend && npm ci && npm run dev
```

### ストリーミングの利用

現在、環境変数として `VITE_APP_USE_STREAMING` というのをフロントエンド側で指定しています。バックエンドをローカルで動かす場合は `false` に指定してただき、AWS で動かす場合は `true` にすることを推奨します。  
Streaming を有効化すると文章生成結果がストリーミングされるためリアルタイムで文字列が生成されていきます。
