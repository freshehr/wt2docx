import { DocBuilder } from "./DocBuilder";
import fs from "fs";
import { findParentNodeId, FormElement } from "./FormElement";
import { dataValueLabelMapper, formatOccurrences, isDisplayableNode } from "./isEntry";
import {mapRmTypeText} from "./DocFormatter"

export const adoc = {

  formatTemplateHeader: (dBuilder: DocBuilder): void => {
    const { wb, sb, wt, config } = dBuilder;
    sb.append(`== Template: ${config.title ? config.title : wt.tree.name}`)

    if (dBuilder.config.displayToC) dBuilder.sb.append(":toc: left");

    sb.newline()
    sb.append(`Template Id: **${wt.templateId}**`).newline()
    sb.append(`Version: **${wt.semVer}**`).newline()
    sb.append(`Created: **${new Date().toDateString()}**`).newline()
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: FormElement) => {
    const { wb, sb, wt, config } = dBuilder;
    sb.append(`=== Composition: *${f.name}*`).newline()
    if (!config.hideNodeIds)
      sb.append(`==== Archetype Id: \`_${f.nodeId}_\``).newline();
    sb.append(`${f.localizedDescriptions.en}`).newline()
  },

  saveFile: async (dBuilder: DocBuilder, outFile: string) => {
    fs.writeFileSync(outFile, dBuilder.toString());
  },

  formatNodeHeader: (dBuilder: DocBuilder, f: FormElement) => {
    const { sb, } = dBuilder;
    sb.append('[options="header","stretch", cols="20,30,30"]');
    sb.append('|====');
    sb.append('|Data item | Description | Allowed values');
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: FormElement) => {
      const { sb, config} = dBuilder;

      sb.append(`===  *${f.name}*`).newline()
      if (!config.hideNodeIds) {
          sb.append(`==== Type: \`_${f.rmType}_\``)
          sb.append(`==== Id \`_${f.nodeId}_\``)
      }
      sb.append(`${f.localizedDescriptions.en}`).newline()
  },

  formatNodeContent: (dBuilder: DocBuilder, f: FormElement, isChoice: boolean) => {
    const { wb, sb, wt, config } = dBuilder;

    const applyNodeIdFilter = (nameText: string, nodeIdText: string) => {
      if (!config.hideNodeIds)
        return nameText + ` + \n ${nodeIdText}`;
      return nameText;
    }

    let resolvedNodeId: string;

    if (f.nodeId)
      resolvedNodeId = `${f.nodeId}`;
    else if (isChoice)
      resolvedNodeId = `${findParentNodeId(f).nodeId}`;
    else
      resolvedNodeId = sb.backTick("RM");

    const nodeIdText = `NodeID: [${sb.backTick(resolvedNodeId)}] ${sb.backTick(f.id)}`;

    let nodeName = f.localizedName ? f.localizedName : f.name

    nodeName = nodeName ? nodeName : f.id

    let rmTypeText = '';

    if (isDisplayableNode(f.rmType)) {
      rmTypeText = `${sb.backTick(mapRmTypeText(f.rmType))}`;
    } else
      sb.append('|' + sb.backTick('Unsupported RM type: ' + f.rmType))

    let nameText: string
    const occurrencesText = formatOccurrences(f, config.displayTechnicalOccurrences)
    const formattedOccurrencesText = occurrencesText ? `(_${occurrencesText}_)` : ``

    if (!isChoice) {
      nameText = `**${nodeName}** + \n Type: ${rmTypeText} ${formattedOccurrencesText}`
      sb.append(`| ${applyNodeIdFilter(nameText, nodeIdText)} | ${dBuilder.getDescription(f)} `);
    } else {
      nameText = `Type: ${rmTypeText}`
      sb.append(`| ${applyNodeIdFilter(nameText, nodeIdText)} |`);
    }

    if (f.name === undefined) {
      sb.append(`// ${f.id} -  ${f.aqlPath}`);
    }

  },

  formatNodeFooter:  (dBuilder: DocBuilder) => {
    dBuilder.sb.append('|====');
  }
}
