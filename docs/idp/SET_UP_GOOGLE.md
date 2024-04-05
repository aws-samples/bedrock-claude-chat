# Set up external identity provider for Google

## Step 1: Create a Google OAuth 2.0 Client

1. Go to the Google Developer Console.
2. Create a new project or select an existing one.
3. Navigate to "Credentials", then click on "Create Credentials" and choose "OAuth client ID".
4. Configure the consent screen if prompted.
5. For the application type, select "Web application".
6. Leave the redirect URI blank for now to set it later, and save temporarily.[See Step5](#step-5-update-google-oauth-client-with-cognito-redirect-uris)
7. Once created, note down the Client ID and Client Secret.

For the detail, visit [Google's official document](https://support.google.com/cloud/answer/6158849?hl=en)

## Step 2: Store Google OAuth Credentials in AWS Secrets Manager

1. Go to the AWS Management Console.
2. Navigate to Secrets Manager and choose "Store a new secret".
3. Select "Other type of secrets".
4. Input the Google OAuth clientId and clientSecret as key-value pairs.

   1. Key: clientId, Value: <YOUR_GOOGLE_CLIENT_ID>
   2. Key: clientSecret, Value: <YOUR_GOOGLE_CLIENT_SECRET>

5. Follow the prompts to name and describe the secret. Note the secret name as you will need it in your CDK code. For example, googleOAuthCredentials.(Use in Step 3 variable name <YOUR_SECRET_NAME>)
6. Review and store the secret.

### Attention

The key names must exactly match the strings 'clientId' and 'clientSecret'.

## Step 3: Update cdk.json

In your cdk.json file, add the ID Provider and SecretName to the cdk.json file.

like so:

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

### Attention

#### Uniqueness

The userPoolDomainPrefix must be globally unique across all Amazon Cognito users. If you choose a prefix that's already in use by another AWS account, the creation of the user pool domain will fail. It's a good practice to include identifiers, project names, or environment names in the prefix to ensure uniqueness.

## Step 4: Deploy Your CDK Stack

Deploy your CDK stack to AWS:

```sh
cdk deploy --require-approval never --all
```

## Step 5: Update Google OAuth Client with Cognito Redirect URIs

After deploying the stack, AuthApprovedRedirectURI is showing on the CloudFormation outputs. Go back to the Google Developer Console and update the OAuth client with the correct redirect URIs.
