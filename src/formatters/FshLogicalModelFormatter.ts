import fs from "fs";
import { sushiClient } from 'fsh-sushi';

import { DocBuilder } from "../DocBuilder";
import { TemplateInput, TemplateNode } from '../TemplateNodes';
import { formatOccurrences, isEntry, mapRmType2FHIR, snakeToCamel } from '../TemplateTypes';
import { extractTextInBrackets} from './FormatterUtils';
import { formatLeafHeader } from './DocFormatter';
import { wrap } from 'yargs';

const formatLocalName = (f:TemplateNode) => f.localizedName ? f.localizedName : f.name;
const formatSpaces = (f:TemplateNode) =>  " ".repeat(f.depth*2);

const formatNodeId = (f: TemplateNode):string => f.nodeId?f.nodeId:`RM`
const formatDescription = (dBuilder:DocBuilder,f:TemplateNode,typeConstraint: string = '') =>
  wrapTripleQuote(`\`[${formatNodeId(f)} ${typeConstraint}]\`
                             ${dBuilder.getDescription(f)})`)

const wrapTripleQuote = (inString: string) => `"""${inString}"""`

const appendFSHLM = (dBuilder: DocBuilder, f: TemplateNode, typeConstraint: string = '') => {
  const { sb } = dBuilder;
 // const choiceSuffix: string = isChoice?'x':'';

  sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName?f.localizedName:f.id,isEntry(f.rmType))} ${formatOccurrences(f,true)} ${mapRmType2FHIR(f.rmType)} "${formatLocalName(f)}" ${formatDescription(dBuilder,f,typeConstraint)}`)

}
const appendBinding = (dBuilder: DocBuilder, f: TemplateNode) => {
  const { sb } = dBuilder;
  const bindingFSH: string = `http://hl7.org/fhir/ValueSet/administrative-gender (preferred)`
  sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName?f.localizedName:f.id,isEntry(f.rmType))} from ${bindingFSH}`)
};

const formatFSHDefinition = (dBuilder: DocBuilder, f: TemplateNode) => {

  const { sb,wt,config } = dBuilder;
  const techName = snakeToCamel(f.localizedName, true);
  sb.append(`Logical: ${techName}`);
  sb.append(`Title: "${wt.templateId}"`);
  sb.append(`Parent: Element`);
  sb.append(`Description: ${formatDescription(dBuilder,f)}`);
  sb.append(`* ^name = "${snakeToCamel(techName, true)}"`);
  sb.append(`* ^status = #active`);
  sb.append(`* ^version = "${wt.semVer}"`);
  sb.append(`* ^url = "${config.fhirBaseUrl}/StructureDefinition/${snakeToCamel(techName, true)}"`);
}

export const fshl = {

  formatTemplateHeader: (dBuilder: DocBuilder) => {
    const { wt, sb } = dBuilder;
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {

    const { wt, sb, config } = dBuilder;

    if (config.entriesOnly) return

     formatFSHDefinition(dBuilder,f)
  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    appendFSHLM(dBuilder,f)
  },


  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise<void> => {


    fs.writeFileSync(outFile, dBuilder.toString(), { encoding: "utf8" });
    console.log(`\n Exported : ${outFile}`)

    await fshl.convertFSH(dBuilder, outFile)
  },

  convertFSH: async (dBuilder: DocBuilder, outFile: any):Promise<void> => {

    const str = dBuilder.toString()
    sushiClient
      .fshToFhir(str, {
      //  dependencies: [{ packageId: "hl7.fhir.us.core", version: "4.0.1" }],
        logLevel: "error",
      })
      .then((results) => {
        fs.writeFileSync(outFile+'.json', JSON.stringify(results.fhir[0]), { encoding: "utf8" });
        console.log(`\n Exported : ${outFile}.json`)     // handle results
      })
      .catch((err) => {
        console.log(`Sushi error: ${err}`)// handle thrown errors
      });
  },

  formatNodeContent: (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {
    const { wt, sb, config } = dBuilder;
    // Stop Choice being called twice as alreadty handled by Choice Header
    if (f.rmType === 'ELEMENT' || isChoice ) return

    // appendFSHLM(dBuilder,f)
  },

  formatEntryHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
//    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
    const { wt, sb, config } = dBuilder;

    if (config.entriesOnly)
      formatFSHDefinition(dBuilder, f);
    else
      formatLeafHeader(dBuilder,f)

  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    appendFSHLM(dBuilder,f)
  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
    appendFSHLM(dBuilder,f)
  },

  formatObservationEvent: (dBuilder: DocBuilder, f: TemplateNode) => {
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

    sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.id,false)}[x] ${formatOccurrences(f,true)} ${rmTypeText} "${formatLocalName(f)}" "${f.nodeId}: ${dBuilder.getDescription(f)}"`)
//    sb.append(`${spaces}* ${nodeName}[x] ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
  },

  dvTypes: {
    formatDvCodedText: (dBuilder: DocBuilder, f: TemplateNode) => {
      const { sb, config} = dBuilder;

      appendFSHLM(dBuilder,f)

      f?.inputs.forEach((item :TemplateInput) => {
      if (item.list ) {
         item.list.forEach( (list) => {
      // Pick up an external valueset description annotation
            if (item.suffix === 'code' && f?.annotations?.vset_description) {
              const params = new URLSearchParams(f.annotations?.vset_description)
              const bindingFSH: string = `from ${params.get('url')} (${item?.listOpen?'preferred':'required'})`
              sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName ? f.localizedName : f.id, isEntry(f.rmType))} ${bindingFSH}`)
            }
         })
      }
  });
},

formatDvText: (dBuilder: DocBuilder, f: TemplateNode) => {
  const { sb , config} = dBuilder;

  appendFSHLM(dBuilder,f)

  if (f.inputs.length > 0) {
    f.inputs.forEach((item) => {
      if (item?.suffix !== 'other' && f?.annotations?.vset_description) {
        // Pick up an external valueset description annotation
        const params = new URLSearchParams(f.annotations?.vset_description)
        const bindingFSH: string = `from ${params.get('url')} (${item?.listOpen?'preferred':'required'})`
        sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName ? f.localizedName : f.id, isEntry(f.rmType))} ${bindingFSH}`)
      }

    });
  }
},

  formatDvOrdinal: (dBuilder: DocBuilder, f: TemplateNode) => {
  const { sb , config} = dBuilder;

  f.inputs.forEach((input) => {
    if (input.list)
      input.list.forEach((listItem) => {
        if (!config.hideXmindValues)
          sb.append(`${formatSpaces(f)} (${listItem.ordinal}) ${listItem.label} [B]`)
      })
  })
},
    formatDvQuantity: (dBuilder: DocBuilder, f: TemplateNode) => {

      let unitStr = ' | '

      if (f.inputs?.length > 0) {
        f.inputs.forEach((item) => {
          if (item.list && item.suffix === 'unit') {
            item.list.forEach((val) => {
              unitStr = unitStr.concat(`${val.label}`);
            });
          }
        });
      }

      appendFSHLM(dBuilder, f, unitStr)

    },

    formatDvDefault: (dBuilder: DocBuilder, f: TemplateNode) => {
      appendFSHLM(dBuilder,f)
    },

}
}
