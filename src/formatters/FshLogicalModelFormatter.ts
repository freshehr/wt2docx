import fs from "fs";

import { DocBuilder } from "../DocBuilder";
import {  TemplateNode, TemplateInput } from "../TemplateNodes";
import { formatOccurrences, isAnyChoice, mapRmType2FHIR, mapRmTypeText } from '../TemplateTypes';
import { formatRawOccurrencesText } from "./DocFormatter";


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
export const fshl = {

  formatTemplateHeader: (dBuilder: DocBuilder) => {
    const { wt,sb, config } = dBuilder;

    const techName = wt.templateId.toLowerCase().replace(/ /g, "_");
    sb.append(`Logical: ${techName}`)
    sb.append(`Title: "${wt.templateId}"`)
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { wt,sb, config } = dBuilder;
    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`* ^name = ${f.id}`)
    sb.append(`* ^status = #active`)

  },
  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f,  true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces : string = " ".repeat(f.depth);
    sb.append(`${spaces} * ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)

  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise <void>  => {
    fs.writeFileSync(outFile, dBuilder.toString(), {encoding: "utf8"});
    console.log(`\n Exported : ${outFile}`)
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {

    if (isChoice) return

    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f,  true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces : string = " ".repeat(f.depth*2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${localizedDescription}"`)
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f,  true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces : string = " ".repeat(f.depth*2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f,  true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces : string = " ".repeat(f.depth*2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb} = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f,  true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces : string = " ".repeat(f.depth*2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.rmType}: ${localizedDescription}"`)
  },

  formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb, config } = dBuilder;
      const localName = f.localizedName ? f.localizedName : f.name
      const nodeName = f.id

      const occurrencesText = formatOccurrences(f,  true)
      const localizedDescription = dBuilder.getDescription(f)
      const spaces : string = " ".repeat(f.depth*2);

    let rmTypeText = '';
    let newText : string = ''
    f.children.forEach((child) => {
      child.parentNode = f
      newText = mapRmType2FHIR(child.rmType)
      if ((rmTypeText.length) === 0)
        rmTypeText = newText
      else
      {
        if(!rmTypeText.includes(newText))
         rmTypeText = rmTypeText.concat(' or ' + newText)
      }
    });

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
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

      //  * Indikation 0..* CodeableConcept "Indikation" "Indikation;
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
