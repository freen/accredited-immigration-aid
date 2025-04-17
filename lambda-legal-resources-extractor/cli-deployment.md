# Deploying Legal Resources Extractor via AWS CLI

## Prerequisites
- AWS CLI installed and configured
- IAM bootstrap template deployed via AWS Console
- OpenAI API key available

## Step 1: Create Required SSM Parameters

First, create the necessary SSM parameters:

```bash
# Create the OpenAI API key parameter
aws ssm put-parameter \
    --name "/legal-resources-extractor/openai-key" \
    --value "your-openai-api-key" \
    --type "SecureString" \
    --overwrite

# If deploying to production, also create admin email parameter
aws ssm put-parameter \
    --name "/legal-resources-extractor/admin-email" \
    --value "admin@example.com" \
    --type "String" \
    --overwrite
```

## Step 2: Assume the Deployment Role

After bootstrapping IAM from the console, assume the deployment role:

```bash
# Get your AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Assume the deployment role
aws sts assume-role \
    --role-arn "arn:aws:iam::${ACCOUNT_ID}:role/development-deployment-role" \
    --role-session-name "InfrastructureDeployment" \
    --duration-seconds 3600 \
    > assume-role-output.json

# Extract and export credentials
export AWS_ACCESS_KEY_ID=$(jq -r .Credentials.AccessKeyId assume-role-output.json)
export AWS_SECRET_ACCESS_KEY=$(jq -r .Credentials.SecretAccessKey assume-role-output.json)
export AWS_SESSION_TOKEN=$(jq -r .Credentials.SessionToken assume-role-output.json)

# Verify assumed role
aws sts get-caller-identity
```

## Step 3: Deploy the CloudFormation Stack

Now deploy the infrastructure stack:

```bash
# For development environment
aws cloudformation deploy \
    --template-file infrastructure.yaml \
    --stack-name legal-resources-extractor-dev \
    --parameter-overrides \
        Environment=dev \
        OpenAIKeyPath=/legal-resources-extractor/openai-key \
    --capabilities CAPABILITY_NAMED_IAM

# For production environment
aws cloudformation deploy \
    --template-file infrastructure.yaml \
    --stack-name legal-resources-extractor-prod \
    --parameter-overrides \
        Environment=prod \
        OpenAIKeyPath=/legal-resources-extractor/openai-key \
    --capabilities CAPABILITY_NAMED_IAM
```

## Step 4: Verify Deployment

Check the status of your deployment:

```bash
aws cloudformation describe-stacks \
    --stack-name legal-resources-extractor-dev \
    --query "Stacks[0].StackStatus"
```

## Step 5: Deploy Lambda Code

After the infrastructure is deployed, you can deploy your Lambda code:

```bash
# Package the Lambda code
zip -r function.zip ./* -x "*.git*" -x "*.zip"

# Upload to S3 bucket
aws s3 cp function.zip s3://legal-resources-extractor-data-dev/lambda/function.zip

# Update the Lambda function code
aws lambda update-function-code \
    --function-name process-legal-resources-extractor-dev \
    --s3-bucket legal-resources-extractor-data-dev \
    --s3-key lambda/function.zip
```

## Step 6: Test the Lambda Function

Invoke the Lambda function to test:

```bash
aws lambda invoke \
    --function-name process-legal-resources-extractor-dev \
    --invocation-type RequestResponse \
    --payload '{}' \
    output.json

# Check the result
cat output.json
```