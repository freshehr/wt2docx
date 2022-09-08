#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import * as fs from 'fs';
import { WebTemplate } from './WebTemplate';
import { DocBuilder } from './DocBuilder';
import  path  from 'path';
import { BuilderSettings } from './BuilderSettings';


function handleOutFile(infile, outputFile, ext) {
  {
    if (outputFile)
      return outputFile;

    const pathSeg = path.parse(infile);
    return  `out/${pathSeg.name}.${ext}`;

  }
}

const args = yargs.options({
  'web-template': { type: 'string', demandOption: true, alias: 'wt' },
  'out-file': { type: 'string', demandOption: false, alias: 'o' },
  'set-file': { type: 'string', demandOption: false, alias: 'set' },
}).argv;

const spinner = ora(`Running test on ${args['web-template']}`).start();

const file = args['web-template'];
const settingsFile = args['set-file'];



const config:BuilderSettings = BuilderSettings.getInstance();

config.importConfig(settingsFile)


const inputFileExist = fs.existsSync(file);
if (inputFileExist) {
  const data = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });
  const wt: WebTemplate = JSON.parse(data);

  const docBuilder = new DocBuilder(wt);
  const doc = docBuilder.toString();

  // Default outfile name to webtemplate filename with adoc extension
  const outFile = handleOutFile(file, args['out-file'], 'adoc');

  console.log('\n' +
    'Loading ' + file + ' and write to ' + outFile);
  fs.writeFileSync(outFile, doc);
} else {
  console.log('The input file does not exist:' + file);
}

spinner.stop();
