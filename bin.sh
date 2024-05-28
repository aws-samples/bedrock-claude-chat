#!/bin/bash
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "!!!                                                                     !!!"
echo "!!!                            WARNING!!!                               !!!"
echo "!!!                                                                     !!!"
echo "!!! This script is intended for NEW USERS ONLY.                         !!!"
echo "!!!                                                                     !!!"
echo "!!! If you are an EXISTING USER, please note the following:            !!!"
echo "!!! - It is STRONGLY RECOMMENDED to use 'cdk deploy' for deployment.    !!!"
echo "!!!   URL: https://github.com/aws-samples/bedrock-claude-chat           !!!"
echo "!!!   - Reason: If the major version is OLDER (before v1.0,            !!!"
echo "!!!     e.g., v0.4), the RDS for RAG WILL BE REPLACED, and             !!!"
echo "!!!     DATA WILL BE LOST.                                             !!!"
echo "!!! - When using the latest version, EXPLICITLY PULL/DEPLOY            !!!"
echo "!!!   the new version branch and then follow the MIGRATION             !!!"
echo "!!!   PROCEDURE (refer to the URL above for details).                  !!!"
echo "!!!                                                                     !!!"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo ""
while true; do
read -p "Are you a new user? (y/N): " answer
case ${answer:0:1} in
y|Y )
echo "Starting deployment for new users..."
break
;;
n|N )
echo "This script is intended for new users only. If you are an existing user, please use cdk for deployment."
exit 1
;;
* )
echo "Please enter y or n."
;;
esac
done


StackName="CodeBuildForDeploy"
stackId=$(aws cloudformation create-stack 

StackName="CodeBuildForDeploy"

stackId=$(aws cloudformation create-stack \
  --stack-name $StackName \
  --template-body file://deploy.yml \
  --capabilities CAPABILITY_IAM \
  --query 'StackId' --output text)

echo "Waiting for the stack creation to complete..."
echo "NOTE: this stack contains CodeBuild project which will be used for cdk deploy."
spin='-\|/'
i=0
while true; do
    status=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].StackStatus' --output text)
    if [[ "$status" == "CREATE_COMPLETE" || "$status" == "UPDATE_COMPLETE" || "$status" == "DELETE_COMPLETE" ]]; then
        break
    fi
    printf "\r${spin:i++%${#spin}:1}"
done
echo -e "\nDone.\n"

outputs=$(aws cloudformation describe-stacks --stack-name $StackName --query 'Stacks[0].Outputs')
projectName=$(echo $outputs | jq -r '.[] | select(.OutputKey=="ProjectName").OutputValue')

echo "Starting CodeBuild project: $projectName..."
buildId=$(aws codebuild start-build --project-name $projectName --query 'build.id' --output text)

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
