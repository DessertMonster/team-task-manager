#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { BootstrapStack } from '../lib/bootstrap-stack';

const app = new App();
new BootstrapStack(app, 'TeamTaskManagerBootstrapStack');
