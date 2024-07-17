import fs from "fs";
import { sushiClient } from 'fsh-sushi';

import { DocBuilder } from "../DocBuilder";
import { TemplateInput, TemplateNode } from '../TemplateNodes';
import { formatOccurrences, isEntry, mapRmType2FHIR, snakeToCamel } from '../TemplateTypes';
import { extractTextInBrackets} from './FormatterUtils';

const formatLocalName = (f:TemplateNode) => f.localizedName ? f.localizedName : f.name;
const formatSpaces = (f:TemplateNode) =>  " ".repeat(f.depth*2);

const formatNodeId = (f: TemplateNode):string => f.nodeId?f.nodeId:`RM`

const appendFSHLM = (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean = false) => {
  const { sb } = dBuilder;
  const choiceSuffix: string = isChoice?'x':'';
  sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName?f.localizedName:f.id,isEntry(f.rmType))}${choiceSuffix} ${formatOccurrences(f,true)} ${mapRmType2FHIR(f.rmType)} "${formatLocalName(f)}" "[${formatNodeId(f)}] ${dBuilder.getDescription(f)}"`)
};

const appendBinding = (dBuilder: DocBuilder, f: TemplateNode) => {
  const { sb } = dBuilder;
  const bindingFSH: string = `http://hl7.org/fhir/ValueSet/administrative-gender (preferred)`
  sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName?f.localizedName:f.id,isEntry(f.rmType))} from ${bindingFSH}`)
};

export const fshl = {

  formatTemplateHeader: (dBuilder: DocBuilder) => {
    const { wt, sb } = dBuilder;
  },

  formatCompositionHeader: (dBuilder: DocBuilder, f: TemplateNode) => {

    const { wt, sb, config } = dBuilder;

    if (config.entriesOnly) return

    const techName = snakeToCamel(f.localizedName, true);
    sb.append(`Logical: ${techName}`)
    sb.append(`Title: "${wt.templateId}"`)
    sb.append(`Parent: Element`)

    sb.append(`Description:  "${f.localizedDescriptions.en}"`)
    sb.append(`* ^name = "${snakeToCamel(techName, true)}"`)
    sb.append(`* ^status = #active`)
    sb.append(`* ^version = "${wt.semVer}"`)
    sb.append(`* ^url = "${config.fhirBaseUrl}/StructureDefinition/${snakeToCamel(techName, true)}"`)

  },

  formatCompositionContextHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
    //  const { sb } = dBuilder;

    appendFSHLM(dBuilder, f)

//    sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.id)} ${formatOccurrences(f,true)} ${mapRmType2FHIR(f.rmType)} "${formatLocalName(f)}" "${f.nodeId}: ${dBuilder.getDescription(f)}"`)
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


        appendFSHLM(dBuilder,f)
  },

  formatLeafHeader: (dBuilder: DocBuilder, f: TemplateNode) => {
//    sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
    const { wt, sb, config } = dBuilder;

    if (isEntry(f.rmType)) {

      const techName = snakeToCamel(f.localizedName, true);
      sb.append(`Logical: ${techName}`)
      sb.append(`Title: "${wt.templateId}"`)
      sb.append(`Parent: Element`)

      sb.append(`Description:  "${formatLocalName(f)} [${f.nodeId}]
       ${dBuilder.getDescription(f)}"`)

      sb.append(`* ^name = "${snakeToCamel(techName, true)}"`)
      sb.append(`* ^status = #active`)
      sb.append(`* ^version = "${wt.semVer}"`)
      sb.append(`* ^url = "${config.fhirBaseUrl}/StructureDefinition/${snakeToCamel(techName, true)}"`)
    }
    else
      appendFSHLM(dBuilder,f)

  },

  formatCluster: (dBuilder: DocBuilder, f: TemplateNode) => {
  //  sb.append(`${spaces}* ${nodeName} ${occurrencesText} ${rmTypeText} "${localName}" "${f.nodeId}: ${localizedDescription}"`)
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

f?.inputs.forEach((item :TemplateInput) => {
//  if (item.list ) {
//    item.list.forEach((list) => {
//        sb.append(`${dvIndent} ${list.label} [B]`);
//    })
//  } else
    // Pick up an external valueset description annotation
  if (item.suffix === 'code' && f?.annotations?.vset_description) {
    // Convert /n characters to linebreaks
    const extRef = extractTextInBrackets(f.annotations?.vset_description)
    const bindingStrength = item.listOpen?'preferred':'required'
    sb.append(`${formatSpaces(f)} ${extRef[0]} (${bindingStrength})`)
    const bindingFSH: string = `${formatSpaces(f)} ${extRef[0]} (${bindingStrength})`
    sb.append(`${formatSpaces(f)}* ${snakeToCamel(f.localizedName?f.localizedName:f.id,isEntry(f.rmType))} from ${bindingFSH}`)

  }

});
},

formatDvText: (dBuilder: DocBuilder, f: TemplateNode) => {
  const { sb , config} = dBuilder;

  if (f.inputs.length > 0) {
    f.inputs.forEach((input) => {
      if (input.list ) {
        input.list.forEach((listItem) => {
          if (!config.hideXmindValues)
            sb.append(`${formatSpaces(f)} ${listItem.value} [B]`)
        })
      }
      else
      if (input.suffix !== 'other' && f?.annotations?.vset_description) {
        // Pick up an external valueset description annotation
        const extRef = extractTextInBrackets(f.annotations?.vset_description)
        sb.append(`${formatSpaces(f)} ${extRef[0]} [B]`)
      }

      if (input.listOpen  && !config.hideXmindValues)
        sb.append(`${formatSpaces(f)} Other text/coded text allowed [B]`);

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
          sb.append(`${formatSpaces(f)} (${listItem.ordinal}) ${listItem.label} [B]`)
      })
  })
},

}
}
