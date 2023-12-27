import { DocBuilder } from "../DocBuilder";
import fs from "fs";
import { findParentNodeId, TemplateElement } from "../TemplateElement";
import { formatOccurrences, isAnyChoice, isDisplayableNode } from "../TemplateTypes";
import { formatOccurrencesText, mapRmTypeText } from "../DocFormatter";
import { TemplateInput } from "../TemplateInput";

export const adoc = {

  formatTemplateHeader: (dBuilder: DocBuilder): void => {
    const { sb, wt, config } = dBuilder;
    sb.append(`== Template: ${config.title ? config.title : wt.tree.name}`)

    if (dBuilder.config.displayToC)
      dBuilder.sb.append(":toc: left");

    sb.newline()
    sb.append(`Template Id: **${wt.templateId}**`).newline()
    sb.append(`Version: **${wt.semVer}**`).newline()
    sb.append(`Created: **${new Date().toDateString()}**`).newline()
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;
    sb.append(`=== Composition: *${f.name}*`).newline()
    if (!config.hideNodeIds)
      sb.append(`==== Archetype Id: \`_${f.nodeId}_\``).newline();
    sb.append(`${f.localizedDescriptions.en}`).newline()
  },

  saveFile: async (dBuilder: DocBuilder, outFile: string) => {
    fs.writeFileSync(outFile, dBuilder.toString());
  },

  formatNodeHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb } = dBuilder;
    sb.append('[options="header","stretch", cols="20,30,30"]');
    sb.append('|====');
    sb.append('|Data item | Description | Allowed values');
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;

    sb.append(`===  *${f.name}*`).newline()
    if (!config.hideNodeIds) {
      sb.append(`==== Type: \`_${f.rmType}_\``)
      sb.append(`==== Id \`_${f.nodeId}_\``)
    }
    sb.append(`${f.localizedDescriptions.en}`).newline()
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateElement, isChoice: boolean) => {
    const { sb, config } = dBuilder;

    const applyNodeIdFilter = (name: string, nodeIdTxt: string) => {
      if (config.hideNodeIds)
        return name;

      return name + ` + \n ${nodeIdTxt}`
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

  formatNodeFooter: (dBuilder: DocBuilder) => {
    dBuilder.sb.append('|====');
  },

  formatUnsupported: (dBuilder: DocBuilder, f: TemplateElement) => {
    dBuilder.sb.append('// Not supported rmType ' + f.rmType);
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;

    const formattedOccurrencesText = formatOccurrencesText(dBuilder, f);
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (config.hideNodeIds)
      sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      sb.append(clinicalText)
  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;

    const formattedOccurrencesText = formatOccurrencesText(dBuilder, f);
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (config.hideNodeIds)
      sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      sb.append(clinicalText)
  },

  formatAnnotations: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;

    if (f.annotations) {
      sb.append(``);
      for (const key in f.annotations) {
        if (f.annotations.hasOwnProperty(key)) {
          if (config?.includedAnnotations?.includes(key))
            sb.newline().append(`*${key}*: ${f.annotations[key]}`);
        }
      }
    }
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
    const { sb, config } = dBuilder;

    const nodeId = f.nodeId ? f.nodeId : `\`RM:${f.id}\``

    sb.append(`==== ${f.name}`);

    if (!config.hideNodeIds) {
      sb.append(`===== \`${f.rmType}: _${nodeId}_\``);
  }
},

  dvTypes: {
    formatDvCodedText: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;
      sb.append('a|');

      f?.inputs.forEach((item) => {
        const term = item.terminology === undefined ? 'local' : item.terminology;
        if (item.list) {
//          sb.append(`**Allowed Coded terms**`)
          sb.append('')
          item.list.forEach((list) => {
            const termPhrase = `${term}:${list.value}`
            if (term === 'local') {
              sb.append(`* ${list.label} +\n ${sb.backTick(termPhrase)}`);
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

    formatDvText: (dBuilder: DocBuilder, f: TemplateElement) => {
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

    formatDvQuantity: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;

      sb.append('a|');
      if (f.inputs?.length > 0) {
        sb.append('')
        f.inputs.forEach((item) => {
          if (item.list && item.suffix === 'unit') {
            item.list.forEach((val) => {
              sb.append('Units: +\n')
              sb.append(`* ${val.value}`);
            });
          }
        });
      }
    },

    formatDvCount: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb, config } = dBuilder;


    },


    formatDvDefault: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;

      if (!isDisplayableNode(f.rmType))
        sb.append("|" + sb.backTick("Unsupported RM type: " + f.rmType));
      else
        sb.append('|')
    },

    formatDvChoice: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb} = dBuilder;
      sb.append('|');
    },

    formatDvOrdinal: (dBuilder: DocBuilder, f: TemplateElement) => {
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
    },

    formatChoiceHeader: (dBuilder: DocBuilder, f: TemplateElement) => {
      const { sb } = dBuilder;
      sb.append('a|');
      let subTypesAllowedText: string;
      if (isAnyChoice(f.children.map(child => child.rmType)))
        subTypesAllowedText = 'All'
      else
        subTypesAllowedText = 'Multiple'

      sb.append(`_${subTypesAllowedText} data types allowed_`);
    }
  }
}
