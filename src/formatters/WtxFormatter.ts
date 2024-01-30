import { DocBuilder } from "../DocBuilder";
import { adoc } from './AdocFormatter';
import fs from 'fs';

export const wtx = {

  saveFile: async (dBuilder: DocBuilder, outFile: string) => {

    const wtString: string = JSON.stringify(dBuilder.wt, (key, value) => key==='parentNode' ? undefined : value)

    fs.writeFileSync(outFile, wtString);
    console.log(`\n Exported : ${outFile}`)
  }

}
