# CDK Pipeline integration with AWS Step Functions
    This project contains Typescript CDK for AWS CodePipeline stack, implemented using the CDK-Pipelines (aws-cdk/pipelines) construct. 
    The pipeline and stage objects from the construct are used to build a self-configuring AWS CodePipeline, which then deploys and tests a sample application by   invoking AWS Step Functions workflow.
    The CDK-Pipelines construct simplifies the CI/CD of applications using AWS CodePipeline by updating the pipeline and the stacks deployed by it in a single commit.
    The CDK-Pipeline below deploys 3 stages - 
        1) Amazon Kinesis application stack deployed to DEV env
        2) AWS Step Functions stack with Pre and Post steps. The AWS Step Functions state machine is invoked to test the application. 
        3) Amazon Kinesis application stack deployed to PROD env

## Architecture
* ### Generic CDK Pipeline with mutliple Stages
![GenericCdkPipeline](docs/generic_cdk_pipeline.png)

* ### Sample CDK Pipeline deploying application stack to DEV and PROD accounts 
![CdkPipeline](docs/cdk_pipeline_detail.png)

* ### Integration Test using AWS Step Functions state machine:

  * The sample IntegrationTest stack deployed contains a AWS Step Functions workflow which generates input data for the Amazon Kinesis application and validates the output data.
  The workflow tasks are performed by AWS Lambda functions defined using Boto3 (Python SDK for AWS).
  
  * The sample application stack contains Amazon Kinesis Data Firehose stream configured with Amazon S3 destination.
    This pattern can be used to test an application/infrastructure stack by defining the appropriate AWS Step Functions workflow in the IntegrationTest stack.

![StateMachine](docs/app_sfn.png)

## Steps to deploy the CDK Pipeline

* ### Pre-requisites
    * Install AWS CLI, Git, Node.js, TypeScript
    * Install AWS CDK v1.120 (For later versions, you can update the package.json)
    * 2 AWS accounts are required - (to be used as Dev and Prod accounts)
    * IAM user with HTTPS Git credentials for AWS CodeCommit in Dev Account
      <br/>

* ### Product versions
    * AWS CDK V1.120
    * AWS SDK for Python (Boto3) V1.18
    * Python 3.7+
    * Node.js 14, TypeScript V3.9
<br/>

* ### Create named profiles, bootstrap target environments

```shell
# Configure aws named-profiles for dev and prod environments
aws configure --profile dev
aws configure --profile prod

# Add following snippet to cdk.json
{
  // ...
  "context": {
    "@aws-cdk/core:newStyleStackSynthesis": true
  }
}

# bootstrap dev(account=111111111111, region=us-west-2) environment for provisioning the pipeline:
env CDK_NEW_BOOTSTRAP=1 npx cdk bootstrap \
    --profile dev \
    --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
    aws://111111111111/us-west-2

# bootstrap prod(account=222222222222, region=us-west-2) environment for deploying CDK applications into using a pipeline in account 111111111111:
env CDK_NEW_BOOTSTRAP=1 npx cdk bootstrap \
    --profile prod \
    --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
    --trust 11111111111 aws://222222222222/us-west-2

# Clone repository
git clone https://gitlab.aws.dev/pipeline/aws-mutating-cdkpipeline-gitlab
cd aws-mutating-cdkpipeline-gitlab

# Install NodeJS dependencies
npm i

# Create AWS CodeCommit repository
aws code-commit create-repository aws-mutating-cdkpipeline-cc --profile dev

# Note the repository url from the command output

```

* ### Deploy pipeline stack
```shell
# Create pipeline
cdk deploy CdkPipelineStack --profile dev

```
* ### Upload code to AWS CodeCommit repository and trigger the pipeline
```shell
# Re-initialize current git repository and push the code to the CodeCommit repository
rm -rf .git
git init  
git branch -m main # Optional if default branch is already main

# Set remote origin, use the CodeCommit repository url from the stack outputs of CdkPipelineStack
git remote add origin https://git-codecommit.us-west-2.amazonaws.com/v1/repos/aws-mutating-cdkpipeline-cc

# Commit and Push code
git add -A && git commit -m "initial commit"
git push -u origin main

# Provide the HTTPS credentials for the CodeCommit repository IAM user
# The pipeline should start executing. Monitor pipeline execution from the AWS Console for CodePipeline

```
* ### Add additional stages(Integration Test stage, Prod Stage) and update the pipeline
```shell
# Add Integration Test stage - uncomment 'Integration Test stage' in the lib/cdk-pipeline.ts 
git add . ; git commit -m "add integ-test stage"; git push
```
## License

This library is licensed under the MIT-0 License. See the LICENSE file.
