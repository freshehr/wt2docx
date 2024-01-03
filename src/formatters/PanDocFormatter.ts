import { DocBuilder } from "../DocBuilder";
import { exec } from "child_process";
import { adoc } from "./AdocFormatter";

const CreateDocbook = (src: string): void => {

  const asciidoctor = require('@asciidoctor/core')()
  const docbookConverter = require('@asciidoctor/docbook-converter')

  docbookConverter.register();

  const docbookContent = asciidoctor.convert(src, { backend: "docbook" });

  // Write DocBook content to a temporary file
  const fs = require('fs');
  fs.writeFileSync(`./tmpDocbook.xml`, docbookContent.toString());

}

const runPandoc = async (src: string, format: string, outFile: string ): Promise<void> => {
  const { exec } = require('child_process');
  const args = `-f docbook -t ${format}  -o './${outFile}'`

  CreateDocbook(src)

  const command = `pandoc ${args} ./tmpDocbook.xml`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`Export file: ${outFile}`);

  });

};

const runAsciidocPDF = async (src: string, outFile: string ): Promise<void> => {
  const { exec } = require('child_process');

  const command = `rvm use ruby-2.5.3 && asciidoctor-pdf ./tmp.adoc`

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`Export file: ${outFile}`);

  });

};

export const docx = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
     await runPandoc(dBuilder.sb.toString(),'docx', outFile)
  },
}

export const pdf = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
    await adoc.saveFile(dBuilder,'./tmp.adoc')
//    await runAsciidocPDF(dBuilder.sb.toString(), outFile)
    await runPandoc(dBuilder.sb.toString(),'pdf', outFile)
  },
}
