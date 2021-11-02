// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import codepipeline = require('@aws-cdk/aws-codepipeline');
import codepipeline_actions = require('@aws-cdk/aws-codepipeline-actions');
import cdk = require('@aws-cdk/core');
import sfn = require('@aws-cdk/aws-stepfunctions');
import ssm = require('@aws-cdk/aws-ssm');
import {Stack, Stage} from '@aws-cdk/core';

import {
    CodePipelineActionFactoryResult,
    ICodePipelineActionFactory,
    ProduceActionOptions,
    Step
} from "@aws-cdk/pipelines";

export class InvokeStepFunctionStep extends Step implements ICodePipelineActionFactory {

    constructor(private readonly myscope: Stage, private readonly sfnScope: Stack) {
        super('IntegrationTest-Invoke');
    }

    public produceAction(stage: codepipeline.IStage, options: ProduceActionOptions): CodePipelineActionFactoryResult {
        stage.addAction(new codepipeline_actions.StepFunctionInvokeAction({
            actionName: options.actionName,
            stateMachine: sfn.StateMachine.fromStateMachineArn(this.sfnScope, 'int-test-sfn',
                `arn:aws:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stateMachine:DevSfnStackStateMachine`),
            stateMachineInput: codepipeline_actions.StateMachineInput.literal({'SfnArn': ssm.StringParameter.valueForStringParameter(this.sfnScope, 'SfnArn'),
            //stateMachineInput: codepipeline_actions.StateMachineInput.literal({'SfnArn': `SfnArn`,
                'KinesisInputStreamName': ssm.StringParameter.valueForStringParameter(this.sfnScope, 'KinesisInputStreamName'),
                'FirehoseOutputBucket': ssm.StringParameter.valueForStringParameter(this.sfnScope, 'FirehoseOutputBucket'),
                'waitSeconds': '30',
                'record_count': 1000}),
            runOrder: 5
        }));
        return {runOrdersConsumed: 4};
    }
}