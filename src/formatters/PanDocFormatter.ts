import { DocBuilder } from "../DocBuilder";
import fs from "fs";
import pandoc from "node-pandoc"
import { promisify } from 'util';
// import asciidoctor from "asciidoctor";
import Asciidoctor from '@asciidoctor/core'
import { exec } from "child_process";

//import docbookConverter from  '@asciidoctor/docbook-converter'
//import { asciidoctor } from "asciidoctor";

//docbookConverter.register() // register the DocBook converter
const pandocPromise = promisify(pandoc);

const runPandoc = async (src: string, format: string, outFile: string ): Promise<void> => {
  const args = `-f docbook -t ${format}  -o './${outFile}'`

//  const asciidoctor = Asciidoctor()
  const asciidoctor = require('@asciidoctor/core')()
  const docbookConverter = require('@asciidoctor/docbook-converter')
  docbookConverter.register();

  const docbookContent = asciidoctor.convert(src, { backend: "docbook" });

    // Write DocBook content to a temporary file
    const fs = require('fs');
    fs.writeFileSync(`./temp.xml`, docbookContent.toString());

  const { exec } = require('child_process');

  const command = `pandoc ${args} ./temp.xml`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });

//    try {
//    const result = await pandocPromise(`${process.cwd()}/temp.xml`, args);
//    console.log(result);
//  } catch(err) {
//    console.error('Oh Nos: ', err);
//  }

  //pandoc(src, args, callback);
};

export const docx = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
     await runPandoc(dBuilder.sb.toString(),'docx', outFile)
  },
}

export const pdf = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
    await runPandoc(dBuilder.sb.toString(),'pdf', outFile)
  },
}
