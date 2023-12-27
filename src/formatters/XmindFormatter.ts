import fs from "fs";
import { parseXMindMarkToXMindFile} from "xmindmark";

import { DocBuilder } from "../DocBuilder";
import { TemplateElement } from "../TemplateElement";

export const xmind = {

  formatHeader: (dBuilder : DocBuilder): void => {
    const { sb, wt } = dBuilder;
    sb.append(sb.newLineCoded(`Template: ${wt.templateId} \n ${wt.semVer} \n ${new Date().toDateString()}`));
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const {  sb } = dBuilder;
    sb.append(sb.newLineCoded(`- Composition: ${f.name}`))
  },

  formatElement: (dBuilder: DocBuilder, f: TemplateElement) => {
    const {  sb } = dBuilder;
    sb.append(sb.newLineCoded(`- Composition: ${f.name}`))
  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise <void>  => {
      const xmindArrayBuffer = await parseXMindMarkToXMindFile(dBuilder.toString())
      fs.writeFileSync(outFile, Buffer.from(xmindArrayBuffer), {encoding: "utf8"});
  }
}
