# Deploying Legal Resources Extractor via AWS CLI

This guide provides the complete deployment process for the Legal Resources Extractor application using administrator credentials from IAM Identity Center.

## Prerequisites
- AWS CLI installed and configured with IAM Identity Center administrator credentials
- OpenAI API key

## Step 1: Deploy IAM Bootstrap Resources

First, deploy the IAM bootstrap resources:

```bash
# Ensure you're using your administrator profile
export AWS_PROFILE=AdministratorAccess-[YOUR-ACCOUNT-ID]

# Deploy the IAM bootstrap template
aws cloudformation deploy \
    --template-file iam-bootstrap.yaml \
    --stack-name legal-resources-extractor-iam-bootstrap \
    --capabilities CAPABILITY_NAMED_IAM
```

## Step 2: Create Required SSM Parameters

Create the necessary SSM parameters:

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

## Step 3: Deploy the CloudFormation Stack

Deploy the main infrastructure stack:

```bash
# For development environment
aws cloudformation deploy \
    --template-file infrastructure.yaml \
    --stack-name legal-resources-extractor-dev \
    --parameter-overrides \
        Environment=dev \
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

After the infrastructure is deployed, package and deploy your Lambda code:

```bash
# Package the Lambda code
zip -r function.zip ./* -x "*.git*" -x "*.zip"

# Get the S3 bucket name from the stack outputs
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name legal-resources-extractor-dev \
    --query "Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue" \
    --output text)

# Upload to S3 bucket
aws s3 cp function.zip s3://${S3_BUCKET}/lambda/function.zip

# Get the Lambda function name from the stack outputs
LAMBDA_FUNCTION=$(aws cloudformation describe-stacks \
    --stack-name legal-resources-extractor-dev \
    --query "Stacks[0].Outputs[?OutputKey=='LambdaFunctionName'].OutputValue" \
    --output text)

# Update the Lambda function code
aws lambda update-function-code \
    --function-name ${LAMBDA_FUNCTION} \
    --s3-bucket ${S3_BUCKET} \
    --s3-key lambda/function.zip
```

## Step 6: Test the Lambda Function

Invoke the Lambda function to test:

```bash
aws lambda invoke \
    --function-name ${LAMBDA_FUNCTION} \
    --invocation-type RequestResponse \
    --payload '{}' \
    output.json

# Check the result
cat output.json
```

## Security Note

This deployment process uses administrator credentials from IAM Identity Center, which is appropriate for initial setup in development environments. For production deployments, consider implementing a more restrictive role-based approach as your deployment processes mature.