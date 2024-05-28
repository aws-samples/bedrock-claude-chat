import os

import boto3
import cfnresponse

USER_POOL_ID = os.environ['USER_POOL_ID']

cognito = boto3.client('cognito-idp')


def handler(event, context):
    """Custom resource to implement the functionality to add triggers to existing Cognito user pools.
    Because CloudFormation does not provide that functionality.
    """
    request_type = event['RequestType']
    physical_resource_id = event.get('PhysicalResourceId') or f'{USER_POOL_ID}-triggers'

    resource_properties = event['ResourceProperties']
    triggers = resource_properties['Triggers']

    try:
        if request_type == 'Create':
            response = cognito.describe_user_pool(UserPoolId=USER_POOL_ID)
            attr = response['UserPool']
            lambda_config = attr.get('LambdaConfig', {})

            update_user_pool_lambda_config(USER_POOL_ID, attr, lambda_config={
                **lambda_config,
                **triggers,
            })
            physical_resource_id = f'{USER_POOL_ID}-triggers'
            cfnresponse.send(event, context, cfnresponse.SUCCESS, resource_properties, physical_resource_id)

        elif request_type == 'Update':
            response = cognito.describe_user_pool(UserPoolId=USER_POOL_ID)
            attr = response['UserPool']
            lambda_config = attr.get('LambdaConfig', {})

            old_resource_properties = event['OldResourceProperties']
            old_triggers = old_resource_properties['Triggers']
            update_user_pool_lambda_config(USER_POOL_ID, attr, lambda_config={
                **{ k: v for k, v in lambda_config.items() if k not in old_triggers.keys() },
                **triggers,
            })

            physical_resource_id = f'{USER_POOL_ID}-triggers'
            cfnresponse.send(event, context, cfnresponse.SUCCESS, resource_properties, physical_resource_id)

        elif request_type == 'Delete':
            response = cognito.describe_user_pool(UserPoolId=USER_POOL_ID)
            attr = response['UserPool']
            lambda_config = attr.get('LambdaConfig', {})

            update_user_pool_lambda_config(USER_POOL_ID, attr, lambda_config={
                k: v for k, v in lambda_config.items() if k not in triggers.keys()
            })
            cfnresponse.send(event, context, cfnresponse.SUCCESS, None, physical_resource_id)

    except Exception as err:
        print(err)
        cfnresponse.send(event, context, cfnresponse.FAILED, None, physical_resource_id)


def update_user_pool_lambda_config(user_pool_id, attr, lambda_config):
    if 'TemporaryPasswordValidityDays' in attr.get('Policies', {}).get('PasswordPolicy', {}):
        attr.get('AdminCreateUserConfig', {}).pop('UnusedAccountValidityDays', None)

    cognito.update_user_pool(
        UserPoolId=user_pool_id,
        **{
            k: v for k, v in attr.items() if k in [
                'Policies',
                'DeletionProtection',
                'AutoVerifiedAttributes',
                'SmsVerificationMessage',
                'EmailVerificationMessage',
                'EmailVerificationSubject',
                'VerificationMessageTemplate',
                'SmsAuthenticationMessage',
                'UserAttributeUpdateSettings',
                'MfaConfiguration',
                'DeviceConfiguration',
                'EmailConfiguration',
                'SmsConfiguration',
                'UserPoolTags',
                'AdminCreateUserConfig',
                'UserPoolAddOns',
                'AccountRecoverySetting',
            ]
        },
        LambdaConfig=lambda_config,
    )
