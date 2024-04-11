# Set up external identity provider

## Step 1: Create an OIDC Client

Follow the procedures for the target OIDC provider, and note the values for the OIDC client ID and secret. Also issuer URL is required on the following steps. If redirect URI is needed for the setup process, enter dummy value, which will be replaced after deployment completed.

## Step 2: Store Credentials in AWS Secrets Manager

1. Go to the AWS Management Console.
2. Navigate to Secrets Manager and choose "Store a new secret".
3. Select "Other type of secrets".
4. Input the client ID and client secret as key-value pairs.

   - Key: `clientId`, Value: <YOUR_GOOGLE_CLIENT_ID>
   - Key: `clientSecret`, Value: <YOUR_GOOGLE_CLIENT_SECRET>
   - Key: `issuerUrl`, Value: <ISSUER_URL_OF_THE_PROVIDER>

5. Follow the prompts to name and describe the secret. Note the secret name as you will need it in your CDK code (Used in Step 3 variable name <YOUR_SECRET_NAME>).
6. Review and store the secret.

### Attention

The key names must exactly match the strings `clientId`, `clientSecret` and `issuerUrl`.

## Step 3: Update cdk.json

In your cdk.json file, add the ID Provider and SecretName to the cdk.json file.

like so:

```json
{
  "context": {
    // ...
    "identityProviders": [
      {
        "service": "oidc", // Do not change
        "serviceName": "<YOUR_SERVICE_NAME>", // Set any value you like
        "secretName": "<YOUR_SECRET_NAME>"
      }
    ],
    "userPoolDomainPrefix": "<UNIQUE_DOMAIN_PREFIX_FOR_YOUR_USER_POOL>"
  }
}
```

### Attention

#### Uniqueness

The `userPoolDomainPrefix` must be globally unique across all Amazon Cognito users. If you choose a prefix that's already in use by another AWS account, the creation of the user pool domain will fail. It's a good practice to include identifiers, project names, or environment names in the prefix to ensure uniqueness.

## Step 4: Deploy Your CDK Stack

Deploy your CDK stack to AWS:

```sh
cdk deploy --require-approval never --all
```

## Step 5: Update OIDC Client with Cognito Redirect URIs

After deploying the stack, `AuthApprovedRedirectURI` is showing on the CloudFormation outputs. Go back to your OIDC configuration and update with the correct redirect URIs.
