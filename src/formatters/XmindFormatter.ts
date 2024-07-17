import fs from "fs";
import { parseXMindMarkToXMindFile} from "xmindmark";

import { DocBuilder } from "../DocBuilder";
import {  TemplateNode, TemplateInput } from "../TemplateNodes";
import { formatOccurrences, isAnyChoice, mapRmTypeText } from '../TemplateTypes';
import { formatRawOccurrencesText } from "./DocFormatter";
import { extractTextInBrackets} from './FormatterUtils';

const headerIndent: string = '  -';
const eventIndent:  string = '    -';
const nodeIndent:   string = '      -';
const dvIndent:     string = '        -';

export const xmind = {

  formatHeader: (dBuilder : DocBuilder): void => {
    const { sb, wt } = dBuilder;
    sb.append(sb.newLineCoded(`Template: ${wt.templateId} \n ${wt.semVer} \n ${new Date().toDateString()}`));
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const {  sb } = dBuilder;
    sb.append(sb.newLineCoded(`- Composition: ${f.name}`))

    if (f?.children.length > 0)
      sb.append(`${headerIndent} attributes`)
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    sb.append(`${headerIndent} context`);
  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise <void>  => {
    const xmindArrayBuffer = await parseXMindMarkToXMindFile(dBuilder.toString())
    fs.writeFileSync('./tmp/tmp.md', dBuilder.toString(), {encoding: "utf8"});
    fs.writeFileSync(outFile, Buffer.from(xmindArrayBuffer), {encoding: "utf8"});
    console.log(`\n Exported : ${outFile}`)
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = localName ? localName : f.id
    const rmTypeText = mapRmTypeText(f.rmType);
    const occurrencesText = formatOccurrences(f, config.displayTechnicalOccurrences)
    sb.append(`${nodeIndent} ${nodeName} [${rmTypeText} ${occurrencesText}]`)
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    sb.append(`${headerIndent} ${f.name} ${f.rmType}`)
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    sb.append(`${eventIndent} ${f.name}  ${formatRawOccurrencesText(dBuilder, f)}`)
  },

  formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    if (isAnyChoice(f.children.map(child =>  child.rmType)))
      sb.append(`${dvIndent} All data types allowed`);
  },

  dvTypes: {
    formatDvCodedText: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb, config} = dBuilder;

      f?.inputs.forEach((item :TemplateInput) => {
        if (item.list ) {
          item.list.forEach((list) => {
          if (!config.hideXmindValues)
            sb.append(`${dvIndent} ${list.label} [B]`);
          })
        } else
          // Pick up an external valueset description annotation
        if (item.suffix === 'code' && f?.annotations?.vset_description) {
          // Convert /n characters to linebreaks
          const extRef = extractTextInBrackets(f.annotations?.vset_description)
          sb.append(`${dvIndent} ${extRef[0]} [B]`)
        }

        if (item.listOpen  && !config.hideXmindValues)
          sb.append( `${dvIndent} Other text/ coded text allowed [B]`);
      });
    },

    formatDvText: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb , config} = dBuilder;

      if (f.inputs.length > 0) {
        f.inputs.forEach((input) => {
          if (input.list ) {
            input.list.forEach((listItem) => {
              if (!config.hideXmindValues)
                sb.append(`${dvIndent} ${listItem.value} [B]`)
            })
          }
          else
          if (input.suffix !== 'other' && f?.annotations?.vset_description) {
            // Pick up an external valueset description annotation
            const extRef = extractTextInBrackets(f.annotations?.vset_description)
            sb.append(`${dvIndent} ${extRef[0]} [B]`)
          }

          if (input.listOpen  && !config.hideXmindValues)
            sb.append(`${dvIndent} Other text/coded text allowed [B]`);

        });
//      appendDescription(f);
      }
    },

    formatDvOrdinal: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb , config} = dBuilder;

      f.inputs.forEach((input) => {
        if (input.list)
          input.list.forEach((listItem) => {
          if (!config.hideXmindValues)
            sb.append(`${dvIndent} (${listItem.ordinal}) ${listItem.label} [B]`)
          })
      })
    },

  }
}
