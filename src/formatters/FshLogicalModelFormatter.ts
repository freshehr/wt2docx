import { DocBuilder } from "../DocBuilder";
import fs from "fs";
import { findParentNodeId, TemplateNode } from "../TemplateNodes";
import { formatOccurrences, isAnyChoice, isDisplayableNode, mapRmTypeText} from "../TemplateTypes";
import { formatAnnotations, formatOccurrencesText } from '../DocFormatter';
import { TemplateInput } from "../TemplateInput";

export const fshl = {

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { wt,sb, config } = dBuilder;

    sb.append(`Logical:   ${wt.templateId}`)
    sb.append(` Title:    ${wt.templateId}`)

    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`  * ^name = ${f.nodeId}`)
    sb.append(`   ^status = #active`)

  },

  saveFile: async (dBuilder: DocBuilder, outFile: string) => {
    fs.writeFileSync(outFile, dBuilder.toString());
    console.log(`\n Exported : ${outFile}`)
  },


  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { wt, sb, config } = dBuilder;

    sb.append(`===  *${f.name}*`).newline()
    if (!config.hideNodeIds) {
      sb.append(`==== Type: \`_${f.rmType}_\``)
      sb.append(`==== Id: \`_${f.nodeId}_\``)
    }

    sb.append(`Logical:   ${wt.templateId}`)
    sb.append(` Title:    ${wt.templateId}`)

    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`  * ^name = ${f.nodeId}`)
    sb.append(`   ^status = #active`)
    sb.append(`${f.localizedDescriptions.en}`).newline()
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {
    const { sb, config } = dBuilder;

    const applyNodeIdFilter = (name: string, nodeIdTxt: string) => {
      if (config.hideNodeIds)
        return name;

      return `${name} + \n ${nodeIdTxt}`
    }

    let resolvedNodeId: string;

    if (f.nodeId)
      resolvedNodeId = `${f.nodeId}`;
    else if (isChoice)
      resolvedNodeId = `${findParentNodeId(f).nodeId}`;
    else
      resolvedNodeId = 'RM'

    const nodeIdText = `NodeID: [${sb.backTick(resolvedNodeId)}] + \n ${sb.backTick(f.id)}`;
    let nodeName = f.localizedName ? f.localizedName : f.name
    nodeName = nodeName ? nodeName : f.id
    // let rmTypeText:string;

    //  if (isDisplayableNode(f.rmType)) {
    const rmTypeText = `${sb.backTick(mapRmTypeText(f.rmType))}`;
    //  } else
    //    rmTypeText = sb.backTick(`Unsupported RM type:  ${f.rmType}`)


    let nameText: string
    const occurrencesText = formatOccurrences(f, config.displayTechnicalOccurrences)
    const formattedOccurrencesText = occurrencesText ? `(_${occurrencesText}_)` : ``

    let descriptionText: string;

    if (config.displayAQLPaths)
      descriptionText = `**AQL**: ${f.aqlPath}`
    else
      descriptionText = dBuilder.getDescription(f)

    if (!isChoice) {
      nameText = `**${nodeName}** + \n Type: ${rmTypeText} ${formattedOccurrencesText}`
      sb.append(`| ${applyNodeIdFilter(nameText, nodeIdText)} | ${descriptionText} `);
      formatAnnotations(dBuilder,f)
    } else {
      nameText = `Type: ${rmTypeText}`
      sb.append(`| ${applyNodeIdFilter(nameText, nodeIdText)} |`);
    }



  },

  formatNodeFooter: (dBuilder: DocBuilder) => {
    dBuilder.sb.append('|====');
  },

  formatUnsupported: (dBuilder: DocBuilder, f: TemplateNode) => {
    dBuilder.sb.append('// Not supported rmType ' + f.rmType);
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;

    const formattedOccurrencesText = formatOccurrencesText(dBuilder, f);
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (config.hideNodeIds)
      sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      sb.append(clinicalText)
  },

  formatInstructionActivity: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;

    const formattedOccurrencesText = formatOccurrencesText(dBuilder, f);
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (config.hideNodeIds)
      sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      sb.append(clinicalText)
  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;

    const formattedOccurrencesText = formatOccurrencesText(dBuilder, f);
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (!config.hideNodeIds)
      sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      sb.append(clinicalText)
  },

  formatAnnotations: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;

    if (f.annotations) {
      sb.append(`\n`);
      for (const key in f.annotations) {
        if (f.annotations.hasOwnProperty(key)) {
          if (config?.includedAnnotations?.includes(key))
            sb.newline().append(`*${key}*: ${f.annotations[key]}`);
        }
      }
    }
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb, config } = dBuilder;

    const nodeId = f.nodeId ? f.nodeId : `RM:${f.id}`

    sb.append(`==== ${f.name}`);

    if (!config.hideNodeIds) {
      sb.append(`===== \`${f.rmType}: _${nodeId}_\``);
    }

  },

  formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    const { sb } = dBuilder;
    sb.append('a|');

    if (isAnyChoice(f.children.map(child => child.rmType))) {
      sb.append(`_All data types allowed_`);
      return
    }

    sb.append(`_Multiple data types allowed_`);
    sb.append(`|_SubTypes_ | |`);
  },

  dvTypes: {
    formatDvCodedText: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb, config } = dBuilder;
      sb.append('a|');

      f?.inputs.forEach((item) => {
        const term = item.terminology === undefined ? 'local' : item.terminology;
        if (item.list) {
//          sb.append(`**Allowed Coded terms**`)
          sb.append('')
          item.list.forEach((list) => {
            const termPhrase = `${term}:${list.value}`
            if (term === 'local') {
              if (config.hideNodeIds)
                sb.append(`* ${list.label}`)
              else
                sb.append(`* ${list.label} +\n ${sb.backTick(termPhrase)}`)
            } else {

              sb.append(`* ${list.label} +\n ${sb.backTick(termPhrase)}`);
            }
          })
        } else
          // Pick up an external valueset description annotation
        if (item.suffix === 'code' && f?.annotations?.vset_description) {
          // Convert /n characters to linebreaks
          const newLined = f.annotations?.vset_description.replace(/\\n/g, String.fromCharCode(10));
          sb.append(newLined)
        }

        if (item.listOpen)
          sb.append(`* _Other text/ coded text allowed_`);
//          appendDescription(f);
      });
    },

    formatDvText: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb } = dBuilder;

      sb.append('a|');
      if (f.inputs.length > 0) {
        sb.append('')
        f.inputs.forEach((item) => {
          if (item.list) {
            item.list.forEach((val) => {
              sb.append(`* ${val.value}`);
            });
          } else
            // Pick up an external valueset description annotation
          if (item.suffix !== 'other' && f?.annotations?.vset_description) {
            // Convert /n characters to linebreaks
            const newLined = sb.newLineCoded(f.annotations?.vset_description);
            sb.append(newLined)
          }

          if (item.listOpen)
            sb.append(`* _Other text/coded text allowed_`);

        });
//      appendDescription(f);
      }
    },

    formatDvQuantity: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb } = dBuilder;

      sb.append('a|');
      if (f.inputs?.length > 0) {
        sb.append('')
        f.inputs.forEach((item) => {
          if (item.list && item.suffix === 'unit') {
            sb.append('Valid units: +\n')
            item.list.forEach((val) => {
              sb.append(`* ${val.value}`);
            });
          }
        });
      }
    },

    formatDvCount: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb } = dBuilder;
      sb.append('a|');
      if (f.inputs.length > 0) {
        sb.append('')
        f.inputs.forEach((item) => {
          if ((item.type === 'INTEGER') && (item?.validation?.range)) {
            sb.append('Range: +\n')
            sb.append(`* ${item.validation.range.minOp} ${item.validation.range.min} and ${item.validation.range.maxOp} ${item.validation.range.max}`);
          }
        });
      }
    },

    formatDvDefault: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb } = dBuilder;

      if (!isDisplayableNode(f.rmType))
        sb.append("|" + sb.backTick("Unsupported RM type: " + f.rmType));
      else
        sb.append('|')
    },

    formatDvChoice: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb} = dBuilder;

      sb.append('a|');

      let subTypesAllowedText: string;
      if (isAnyChoice(f.children.map(child =>  child.rmType)))
        subTypesAllowedText = 'All'
      else
        subTypesAllowedText = 'Multiple'

      sb.append(`_${subTypesAllowedText} data types allowed_`);
    },

    formatDvOrdinal: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb } = dBuilder;

      sb.append('a|');
      if (f.inputs) {
        const fi: TemplateInput[] = f.inputs;
        fi.forEach((item) => {
          const formItems = item.list === undefined ? [] : item.list;
          formItems.forEach((n) => {
            const termPhrase = `local:${n.value}`
            sb.append(`* [${n.ordinal}] ${n.label} +\n ${sb.backTick(termPhrase)}`);
          });
        });
      }
    }
  }
}
