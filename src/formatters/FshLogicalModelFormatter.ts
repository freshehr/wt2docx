import fs from "fs";

import { DocBuilder } from "../DocBuilder";
import {  TemplateNode, TemplateInput } from "../TemplateNodes";
import { formatOccurrences, mapRmType2FHIR} from '../TemplateTypes';

export const fshl = {

  formatTemplateHeader: (dBuilder: DocBuilder) => {
    const { wt, sb, config } = dBuilder;

    const techName = wt.templateId.toLowerCase().replace(/ /g, "_");
    sb.append(`Logical: ${techName}`)
    sb.append(`Title: "${wt.templateId}"`)
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { wt, sb, config } = dBuilder;
    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`* ^name = ${f.id}`)
    sb.append(`* ^status = #active`)

  },
  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth);
    sb.append(`${spaces} * ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)

  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise<void> => {
    fs.writeFileSync(outFile, dBuilder.toString(), { encoding: "utf8" });
    console.log(`\n Exported : ${outFile}`)
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {

    if (isChoice) return

    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${localizedDescription}"`)
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.rmType}: ${localizedDescription}"`)
  },

  formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id

    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    let rmTypeText = '';
    let newText: string = ''
    f.children.forEach((child) => {
      child.parentNode = f
      newText = mapRmType2FHIR(child.rmType)
      if ((rmTypeText.length) === 0)
        rmTypeText = newText
      else {
        if (!rmTypeText.includes(newText))
          rmTypeText = rmTypeText.concat(' or ' + newText)
      }
    });

    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },
}
