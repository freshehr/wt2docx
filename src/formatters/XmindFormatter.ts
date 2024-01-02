import fs from "fs";
import { parseXMindMarkToXMindFile} from "xmindmark";

import { DocBuilder } from "../DocBuilder";
import {  TemplateElement } from "../TemplateElement";
import { formatOccurrences, isAnyChoice } from "../TemplateTypes";
import { formatRawOccurrencesText, mapRmTypeText } from "../DocFormatter";
import { TemplateInput } from "../TemplateInput";

const headerIndent: string = '  -';
const eventIndent:  string = '    -';
const nodeIndent:   string = '      -';
const dvIndent:     string = '        -';

function extractTextInBrackets(input: string): string[] {
  // The regular expression matches text within square brackets.
  const regex = /\[(.*?)]/g;
  let match;
  const matches: string[] = [];

  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}
export const xmind = {

  formatHeader: (dBuilder : DocBuilder): void => {
    const { sb, wt } = dBuilder;
    sb.append(sb.newLineCoded(`Template: ${wt.templateId} \n ${wt.semVer} \n ${new Date().toDateString()}`));
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const {  sb } = dBuilder;
    sb.append(sb.newLineCoded(`- Composition: ${f.name}`))

    if (f?.children.length > 0)
      sb.append(`${headerIndent} attributes`)
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb} = dBuilder;
    sb.append(`${headerIndent} context`);
  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise <void>  => {
    const xmindArrayBuffer = await parseXMindMarkToXMindFile(dBuilder.toString())
    fs.writeFileSync('./out/tmp.md', dBuilder.toString(), {encoding: "utf8"});
    fs.writeFileSync(outFile, Buffer.from(xmindArrayBuffer), {encoding: "utf8"});
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateElement, isChoice: boolean) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = localName ? localName : f.id
    const rmTypeText = mapRmTypeText(f.rmType);
    const occurrencesText = formatOccurrences(f, config.displayTechnicalOccurrences)
    sb.append(`${nodeIndent} ${nodeName} [${rmTypeText} ${occurrencesText}]`)

  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb} = dBuilder;
    sb.append(`${headerIndent} ${f.name} ${f.rmType}`)
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb} = dBuilder;
    sb.append(`${eventIndent} ${f.name}  ${formatRawOccurrencesText(dBuilder, f)}`)
  },

  dvTypes: {
    formatDvCodedText: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;

      f?.inputs.forEach((item :TemplateInput) => {
        if (item.list) {
          item.list.forEach((list) => {
              sb.append(`${dvIndent} ${list.label} [B]`);
          })
        } else
          // Pick up an external valueset description annotation
        if (item.suffix === 'code' && f?.annotations?.vset_description) {
          // Convert /n characters to linebreaks
          const extRef = extractTextInBrackets(f.annotations?.vset_description)
          sb.append(`${dvIndent} ${extRef[0]} [B]`)
        }

        if (item.listOpen)
          sb.append( `${dvIndent} Other text/ coded text allowed [B]`);
      });
    },

    formatDvText: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;

      if (f.inputs.length > 0) {
        f.inputs.forEach((input) => {
          if (input.list)
            input.list.forEach((listItem) => sb.append(`${dvIndent} ${listItem.value} [B]`));
          else
          if (input.suffix !== 'other' && f?.annotations?.vset_description) {
            // Pick up an external valueset description annotation
            const extRef = extractTextInBrackets(f.annotations?.vset_description)
            sb.append(`${dvIndent} ${extRef[0]} [B]`)
          }

          if (input.listOpen)
            sb.append(`${dvIndent} Other text/coded text allowed [B]`);

        });
//      appendDescription(f);
      }
    },

    formatDvOrdinal: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;
      f.inputs.forEach((input) => {
        if (input.list)
          input.list.forEach((listItem) =>sb.append(`${dvIndent} (${listItem.ordinal}) ${listItem.label} [B]`))
      })
    },

    formatDvChoice: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb} = dBuilder;
      let subTypesAllowedText: string = '';

      if (isAnyChoice(f.children.map(child =>  child.rmType)))
        subTypesAllowedText = 'All'
      else {
        const fc: TemplateElement[] = f.children
        fc.forEach((n) => {
          subTypesAllowedText = `${subTypesAllowedText} , ${n.rmTypeText}`
        })

      }
      sb.append(`${subTypesAllowedText} data types allowed`);

    }
  }
}
