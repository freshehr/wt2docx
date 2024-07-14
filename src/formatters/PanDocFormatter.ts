import { DocBuilder } from "../DocBuilder";
import { adoc } from "./AdocFormatter";

const CreateDocbook = (src: string): void => {

  const asciidoctor = require('@asciidoctor/core')()
  const docbookConverter = require('@asciidoctor/docbook-converter')

  docbookConverter.register();

  const docbookContent = asciidoctor.convert(src, { backend: "docbook" });

  // Write DocBook content to a temporary file
  const fs = require('fs');
  fs.writeFileSync(`./tmp/tmpDocbook.xml`, docbookContent.toString());

}

const runPandoc = async (src: string, format: string, outFile: string ): Promise<void> => {
  const { exec } = require('child_process');
  const args = `-f docbook -t ${format}  -o './${outFile}'`

  CreateDocbook(src)

  const command = `pandoc ${args} ./tmp/tmpDocbook.xml`

  exec(command, (error: { message: any; }, stdout: any, stderr: any) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    if (stdout) {
      console.log(`Export file: ${outFile}`);
    }
  });

};


export const docx = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
     await runPandoc(dBuilder.sb.toString(),'docx', outFile)
  },
}

export const pdf = {

  saveFile:  async (dBuilder: DocBuilder, outFile: string) => {
    await adoc.saveFile(dBuilder,'./tmp/tmp.adoc')
//    await runAsciidocPDF(dBuilder.sb.toString(), outFile)
    await runPandoc(dBuilder.sb.toString(),'pdf', outFile)
  },
}
