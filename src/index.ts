#!/usr/bin/env node
import yargs from 'yargs';
import ora from 'ora';
import  * as fs from 'fs';
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
  'set-file': { type: 'string', demandOption: false, alias: 'set', default: "config/wtconfig.json"},
}).argv;

const spinner = ora(`Running test on ${args['web-template']}`).start();

const file = args['web-template'];
const settingsFile = args['set-file'];

 const config:BuilderSettings = BuilderSettings.getInstance();

  const inputFileExist = fs.existsSync(file);
if (inputFileExist) {

  const inDoc:string = fs.readFileSync(file, { encoding: 'utf8', flag: 'r' });

  const docBuilder : DocBuilder = new DocBuilder(JSON.parse(inDoc));

  const outDoc:string = docBuilder.toString();

  // Default outfile name to webtemplate filename with adoc extension
  const outFileName = handleOutFile(file, args['out-file'], 'adoc');

  fs.writeFileSync(outFileName, outDoc);
} else {
  console.log('The input file does not exist:' + file);
}

spinner.stop();
