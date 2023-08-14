#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import  * as fs from 'fs';
// import { WebTemplate } from './WebTemplate';
import { DocBuilder } from './DocBuilder';
import  path  from 'path';
import { importConfig } from './BuilderConfig';
import { Config } from "./Config";

function handleOutPath(infile :string, outputFile: string , ext: string) {
  {
    if (outputFile)
      return outputFile;

    const pathSeg = path.parse(infile);
    return  `out/${pathSeg.name}.${ext}`;
  }
}

function writeOutput(docBuilder: DocBuilder, outFile: string) {
  fs.writeFileSync(outFile, docBuilder.toString());
}

const args = yargs.options({
  'web-template': { type: 'string', demandOption: true, alias: 'wt' },
  'out-file': { type: 'string', demandOption: false, alias: 'o' },
  'config-file': { type: 'string', demandOption: false, alias: 'cf', default: "config/wtconfig.json"},
}).argv;

const spinner = ora(`Running test on ${args['web-template']}`).start();

const inFilePath = args['web-template'];
const config:Config = importConfig(args['config-file']);
const outFilePath = handleOutPath(inFilePath, args['out-file'], 'adoc');

const inputFileExist = fs.existsSync(inFilePath);

if (inputFileExist) {

  const inDoc:string = fs.readFileSync(inFilePath, { encoding: 'utf8', flag: 'r' });
  const docBuilder : DocBuilder = new DocBuilder(JSON.parse(inDoc), config);
  writeOutput(docBuilder, outFilePath);
}
else {
  console.log('The input file does not exist:' + inFilePath);
}

spinner.stop();
