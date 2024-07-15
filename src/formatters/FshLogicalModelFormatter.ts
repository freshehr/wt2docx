import fs from "fs";

import { DocBuilder } from "../DocBuilder";
import {  TemplateNode} from "../TemplateNodes";
import { formatOccurrences, mapRmType2FHIR, snakeToCamel } from '../TemplateTypes';

const formatLocalName = (f:TemplateNode) => f.localizedName ? f.localizedName : f.name;
const formatSpaces = (f:TemplateNode) =>  " ".repeat(f.depth*2);

const appendFSHLM = (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean = false) => {
  const { sb } = dBuilder;

  const choiceSuffix: string = isChoice?'x':'';
  const nodeId: string = f.nodeId?f.nodeId:`RM`
  sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.id)}${choiceSuffix} ${formatOccurrences(f,true)} ${mapRmType2FHIR(f.rmType)} "${formatLocalName(f)}" "${nodeId}: ${dBuilder.getDescription(f)}"`)

}
export const fshl = {

  formatTemplateHeader: (dBuilder: DocBuilder) => {
    const { wt, sb, config } = dBuilder;
    const techName = snakeToCamel(wt.templateId);
    sb.append(`Logical: ${techName}`)
    sb.append(`Title: "${wt.templateId}"`)
    sb.append(`Parent: Element`)
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { wt, sb, config } = dBuilder;
    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`* ^name = "${snakeToCamel(f.id)}"`)
    sb.append(`* ^status = #active`)
    sb.append(`* ^version = "${dBuilder.wt.semVer}"`)
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
  //  const { sb } = dBuilder;

    appendFSHLM(dBuilder,f)

//    sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.id)} ${formatOccurrences(f,true)} ${mapRmType2FHIR(f.rmType)} "${formatLocalName(f)}" "${f.nodeId}: ${dBuilder.getDescription(f)}"`)
  },

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise<void> => {
    fs.writeFileSync(outFile, dBuilder.toString(), { encoding: "utf8" });
    console.log(`\n Exported : ${outFile}`)
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {

    // Stop Choice being called twice as alreadty handled by Choice Header

    if (f.rmType === 'ELEMENT' || isChoice) return

    appendFSHLM(dBuilder,f)
  }
  ,

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

//    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
    appendFSHLM(dBuilder,f)

  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

  //  sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
    appendFSHLM(dBuilder,f)

  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb } = dBuilder;
    const localName = f.localizedName ? f.localizedName : f.name
    const nodeName = f.id
    const rmTypeText = mapRmType2FHIR(f.rmType);
    const occurrencesText = formatOccurrences(f, true)
    const localizedDescription = dBuilder.getDescription(f)
    const spaces: string = " ".repeat(f.depth * 2);

    // sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.rmType}: ${localizedDescription}"`)

    appendFSHLM(dBuilder,f)

  },

  formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateNode, isChoice = true) => {
    const { sb} = dBuilder;

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

    sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.id)}[x] ${formatOccurrences(f,true)} ${rmTypeText} "${formatLocalName(f)}" "${f.nodeId}: ${dBuilder.getDescription(f)}"`)
//    sb.append(`${spaces}* ${nodeName}[x] ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },
}
