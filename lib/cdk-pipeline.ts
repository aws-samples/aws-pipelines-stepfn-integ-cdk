// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import codecommit = require('@aws-cdk/aws-codecommit');
import {App, Stack, StackProps} from '@aws-cdk/core';
import {CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep} from '@aws-cdk/pipelines';
import {InvokeStepFunctionStep} from "./steps/sfn-invoke-step";
import {AppStage} from "./stages/app-stage/app-stage";
import {IntegTestStage} from "./stages/integ-test-stage/integ-test-stage";


export class CdkPipelineStack extends Stack {

    constructor(app: App, id: string, props: StackProps) {
        super(app, id, props);

        const source =
            codecommit.Repository.fromRepositoryName(this, 'CodeCommitRepo', `aws-mutating-cdkpipeline-cc`);
        const repository = CodePipelineSource.codeCommit(source, 'main', {});

        const pipeline = new CodePipeline(this, 'MutatingPipeline', {
            crossAccountKeys: true,
            synth: new ShellStep('Synth', {
                input: repository,
                commands: [
                    'npm ci',
                    'npm run build',
                    'npx cdk synth',
                    'aws --version'
                ]
            }),
        });

        // Application-Dev stage
        pipeline.addStage(new AppStage(this, 'AppStage'));

        // Integration Test stage
       /* const integTestStage = new IntegTestStage(this, 'IntegTestStage');
        pipeline.addStage(integTestStage, {
            post: [
                new InvokeStepFunctionStep(integTestStage, this)
            ],
        });*/

        // Application-Prod stage
        /*pipeline.addStage(new AppStage(this, 'Prod', {
                env: {
                    account: app.node.tryGetContext('prodAccId'),
                    region: app.node.tryGetContext('prodAccRegion'),
                }
            }), {
                pre: [
                    new ManualApprovalStep('PromoteToProd'),
                ]
            }
        )*/
    }
}