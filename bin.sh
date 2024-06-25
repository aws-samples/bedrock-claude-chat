#!/bin/bash
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!! !!!"
echo "!!! IMPORTANT NOTICE !!!"
echo "!!! !!!"
echo "!!! If you are using Bedrock Claude Chat with a version prior to v1.x !!!"
echo "!!! (e.g., v0.4.x), please follow the migration guide before proceeding. !!!"
echo "!!! !!!"
echo "!!! Migrating from an older version requires specific steps to ensure !!!"
echo "!!! your data is properly preserved and migrated. Failure to follow !!!"
echo "!!! the migration guide may result in DATA LOSS. !!!"
echo "!!! !!!"
echo "!!! Please refer to the migration guide at: !!!"
echo "!!! https://github.com/aws-samples/bedrock-claude-chat/blob/v1/docs/migration/V0_TO_V1.md !!!"
echo "!!! !!!"
echo "!!! If you are a new user or already using v1.x, !!!"
echo "!!! you can safely proceed with the installation. !!!"
echo "!!! !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo ""
while true; do
read -p "Are you a new user starting with v1.x or later? (y/N): " answer
case ${answer:0:1} in
y|Y )
echo "Starting deployment..."
break
;;
n|N )
echo "This script is intended for new users or v1.x user only. If you are using previous version, please refer migration guide."
exit 1
;;
* )
echo "Please enter y or n."
;;
esac
done

# Default parameters
ALLOW_SELF_REGISTER="true"
IPV4_RANGES=""
IPV6_RANGES=""
ALLOWED_SIGN_UP_EMAIL_DOMAINS=""
REGION="us-east-1"

# Parse command-line arguments for customization
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --disable-self-register) ALLOW_SELF_REGISTER="false" ;;
        --ipv4-ranges) IPV4_RANGES="$2"; shift ;;
        --ipv6-ranges) IPV6_RANGES="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --allowed-signup-email-domains) ALLOWED_SIGN_UP_EMAIL_DOMAINS="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done


# Validate the template
aws cloudformation validate-template --template-body file://deploy.yml  > /dev/null 2>&1
if [[ $? -ne 0 ]]; then
    echo "Template validation failed"
    exit 1
fi

StackName="CodeBuildForDeploy"

# Deploy the CloudFormation stack
aws cloudformation deploy \
  --stack-name $StackName \
  --template-file deploy.yml \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides AllowSelfRegister=$ALLOW_SELF_REGISTER Ipv4Ranges="$IPV4_RANGES" Ipv6Ranges="$IPV6_RANGES" AllowedSignUpEmailDomains="$ALLOWED_SIGN_UP_EMAIL_DOMAINS" Region="$REGION"

echo "Waiting for the stack creation to complete..."
echo "NOTE: this stack contains CodeBuild project which will be used for cdk deploy."
spin='-\|/'
i=0
while true; do
    status=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].StackStatus' --output text 2>/dev/null)
    if [[ "$status" == "CREATE_COMPLETE" || "$status" == "UPDATE_COMPLETE" || "$status" == "DELETE_COMPLETE" ]]; then
        break
    elif [[ "$status" == "ROLLBACK_COMPLETE" || "$status" == "DELETE_FAILED" || "$status" == "CREATE_FAILED" ]]; then
        echo "Stack creation failed with status: $status"
        exit 1
    fi
    printf "\r${spin:i++%${#spin}:1}"
    sleep 1
done
echo -e "\nDone.\n"

outputs=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs')
projectName=$(echo $outputs | jq -r '.[] | select(.OutputKey=="ProjectName").OutputValue')

if [[ -z "$projectName" ]]; then
    echo "Failed to retrieve the CodeBuild project name"
    exit 1
fi

echo "Starting CodeBuild project: $projectName..."
buildId=$(aws codebuild start-build --project-name $projectName --query 'build.id' --output text)

if [[ -z "$buildId" ]]; then
    echo "Failed to start CodeBuild project"
    exit 1
fi

echo "Waiting for the CodeBuild project to complete..."
while true; do
    buildStatus=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].buildStatus' --output text)
    if [[ "$buildStatus" == "SUCCEEDED" || "$buildStatus" == "FAILED" || "$buildStatus" == "STOPPED" ]]; then
        break
    fi
    sleep 10
done
echo "CodeBuild project completed with status: $buildStatus"

buildDetail=$(aws codebuild batch-get-builds --ids $buildId --query 'builds[0].logs.{groupName: groupName, streamName: streamName}' --output json)

logGroupName=$(echo $buildDetail | jq -r '.groupName')
logStreamName=$(echo $buildDetail | jq -r '.streamName')

echo "Build Log Group Name: $logGroupName"
echo "Build Log Stream Name: $logStreamName"

echo "Fetch CDK deployment logs..."
logs=$(aws logs get-log-events --log-group-name $logGroupName --log-stream-name $logStreamName)
frontendUrl=$(echo "$logs" | grep -o 'FrontendURL = [^ ]*' | cut -d' ' -f3 | tr -d '\n,')

echo "Frontend URL: $frontendUrl"
