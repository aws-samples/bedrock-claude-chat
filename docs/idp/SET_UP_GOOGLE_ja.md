# 外部アイデンティティプロバイダー (Google) の設定

## ステップ 1: Google OAuth 2.0 クライアントを作成する

1. Google Developer Console へ移動します。
2. 新しいプロジェクトを作成するか、既存のプロジェクトを選択します。
3. 「認証情報」に移動し、「認証情報を作成」をクリックして「OAuth クライアント ID」を選択します。
4. 促された場合、同意画面を設定します。
5. アプリケーションタイプとして「Web アプリケーション」を選択します。
6. リダイレクト URI は後に設定するため空欄にして一旦保存します。[Step5 を参照](#ステップ-5-cognito-リダイレクト-uri-で-google-oauth-クライアントを更新する)
7. 作成されたら、クライアント ID とクライアント シークレットをメモしてください。

詳細については、[Google の公式ドキュメント](https://support.google.com/cloud/answer/6158849?hl=ja)をご覧ください。

## ステップ 2: AWS Secrets Manager に Google OAuth 資格情報を保存する

1. AWS 管理コンソールへ移動します。
2. Secrets Manager に移動し、「新しいシークレットを保存」を選択します。
3. 「他のタイプのシークレット」を選択します。
4. Google OAuth clientId と clientSecret をキーと値のペアとして入力します。

   1. キー: clientId, 値: <YOUR_GOOGLE_CLIENT_ID>
   2. キー: clientSecret, 値: <YOUR_GOOGLE_CLIENT_SECRET>

5. シークレットの名前と説明を入力して進んでください。CDK コードで必要になるので、シークレット名を控えておいてください。例：googleOAuthCredentials (ステップ 3 の変数名<YOUR_SECRET_NAME>で使用します)
6. シークレットを確認して保存します。

### 注意

キー名は、文字列 'clientId' および 'clientSecret' と完全に一致する必要があります。

## ステップ 3: cdk.json を更新する

cdk.json ファイルに、あなたのアイデンティティプロバイダーと SecretName の設定を追加します。

以下のようにします：

```json
{
  "context": {
    // ...
    "identityProviders": [
      {
        "service": "google",
        "secretName": "<YOUR_SECRET_NAME>"
      }
    ],
    "userPoolDomainPrefix": "<UNIQUE_DOMAIN_PREFIX_FOR_YOUR_USER_POOL>"
  }
}
```

### 注意

#### ユニークさ

userPoolDomainPrefix は、すべての Amazon Cognito ユーザー間でグローバルにユニークでなければなりません。他の AWS アカウントですでに使用されているプレフィックスを選択した場合、ユーザープールドメインの作成が失敗します。プレフィックスに識別子、プロジェクト名、または環境名を含めることは、ユニークさを確保するための良い実践です。

## ステップ 4: CDK スタックをデプロイする

AWS に CDK スタックをデプロイします：

```sh
cdk deploy --require-approval never --all
```

## ステップ 5: Cognito リダイレクト URI で Google OAuth クライアントを更新する

スタックをデプロイした後、CfnOutput で AuthApprovedRedirectURI が出力されます。
Google Developer Console に戻り、OAuth クライアントを正しいリダイレクト URI で更新します。
