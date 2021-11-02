#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {CdkPipelineStack} from "../lib/cdk-pipeline";

const app = new cdk.App();
new CdkPipelineStack(app, 'CdkPipelineStack', {});