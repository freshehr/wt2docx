#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import  * as fs from 'fs';
// import { WebTemplate } from './WebTemplate';
import { DocBuilder } from './DocBuilder';
import  path  from 'path';
import { importConfig } from './BuilderConfig';
import { Config } from "./Config";
import { saveFile } from "./DocFormatter";

function handleOutPath(infile :string, outputFile: string , ext: string, outdir: string) {
  {
    if (outputFile)
      return outputFile;

    const pathSeg = path.parse(infile);
    return  `${outdir}/${pathSeg.name}.${ext}`;
  }
}

function writeOutput(docBuilder: DocBuilder, outFile: string) {
  saveFile(docBuilder, outFile)
}

const args = yargs.options({
  'web-template': { type: 'string', demandOption: true, alias: 'wt' },
  'out-file': { type: 'string', demandOption: false, alias: 'o' },
  'out-dir': { type: 'string', demandOption: false, alias: 'od', default: 'out'},
  'config-file': { type: 'string', demandOption: false, alias: 'cf', default: "config/wtconfig.json"},
  'export-format': { type: 'string', demandOption: false, alias: 'ex', default: "adoc"},
}).argv;


const inFilePath = args['web-template']
const spinner = ora(`Processing ${inFilePath}`).start();


const config:Config = importConfig(args['config-file'])
const outFileDir: string = args['out-dir']
const outFileName: string = args['out-file']
const exportFormat = args['export-format'];
const outFilePath = handleOutPath(inFilePath, outFileName, exportFormat,outFileDir);
const inputFileExist = fs.existsSync(inFilePath);

if (inputFileExist) {
  const inDoc:string = fs.readFileSync(inFilePath, { encoding: 'utf8', flag: 'r' });
  const docBuilder : DocBuilder = new DocBuilder(JSON.parse(inDoc), config, exportFormat,outFileDir);
  writeOutput(docBuilder, outFilePath);
}
else {
  console.log('The input file does not exist:' + inFilePath);
}

spinner.stop();
