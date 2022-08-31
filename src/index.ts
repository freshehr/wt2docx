#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import * as fs from 'fs';
import { WebTemplate } from './WebTemplate';
import { DocBuilder } from './DocBuilder';

const args = yargs.options({
  'web-template': { type: 'string', demandOption: true, alias: 'wt' },
  'out-file': { type: 'string', demandOption: true, alias: 'o' },
}).argv;

const spinner = ora(`Running test on ${args['web-template']}`).start();

const file = args['web-template'];
const outFile = args['out-file'];

console.log('\n' +
  'Loading ' + file + ' and write to ' + outFile);

const inputfileExist = fs.existsSync(file);
if (inputfileExist) {
  const data = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
  const wt: WebTemplate = JSON.parse(data);
  const docBuilder = new DocBuilder(wt);
  const doc = docBuilder.toString();

  fs.writeFileSync(outFile, doc);
} else {
  console.log('The input file does not exist:' + file);
}

spinner.stop();
