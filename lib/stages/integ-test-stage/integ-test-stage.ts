// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {Construct, Stage, StageProps} from '@aws-cdk/core';
import {IntegrationTestStack} from "../../integration-test/integration-test-stack";


export class IntegTestStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const integTestStack = new IntegrationTestStack(this, 'IntegrationTestStack', {});
    }
}