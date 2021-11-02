// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {Construct, Stage, StageProps} from '@aws-cdk/core';
import {ApplicationStack} from "../../application/application-stack";


export class AppStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const myAppStack = new ApplicationStack(this, 'ApplicationStack', {});
    }
}