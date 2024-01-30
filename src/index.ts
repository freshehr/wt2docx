#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import  * as fs from 'fs';
import { DocBuilder } from './DocBuilder';
import { Config, importConfig } from './BuilderConfig';

const args = yargs.options({
  'web-template': { type: 'string', describe: 'web template name',demandOption: true, alias: 'wt' },
  'out-file': { type: 'string', describe: 'Output file',demandOption: false, alias: 'o' },
  'out-dir': { type: 'string', demandOption: false, describe: 'Output folder', alias: 'od', default: './out'},
  'config-file': { type: 'string', demandOption: false, describe: 'Config file',alias: 'cf', default: "config/wtconfig.json"},
  'export-format': { type: 'string', demandOption: false, describe: 'Export format: adoc|docx|xmind|pdf (default: adoc)',alias: 'ex', default: "adoc"},
}).argv;

const inFilePath = args['web-template']
const config:Config = importConfig(args['config-file'])
const outFileDir: string = args['out-dir']
const outFileName: string = args['out-file']
const exportFormat = args['export-format'];


const spinner = ora(`Processing ${inFilePath}`).start();

if (fs.existsSync(inFilePath)) {
  const inDoc:string = fs.readFileSync(inFilePath, { encoding: 'utf8', flag: 'r' });
  const docBuilder : DocBuilder = new DocBuilder(JSON.parse(inDoc), config, inFilePath, outFileName,exportFormat,outFileDir);
}
else
  console.log('The input file does not exist:' + inFilePath);

spinner.stop();
