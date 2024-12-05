import fs from "fs";
import { sushiClient } from 'fsh-sushi';

import { DocBuilder } from "../DocBuilder";
import { TemplateInput, TemplateNode } from '../TemplateNodes';
import { formatOccurrences, isEntry, mapRmType2FHIR, snakeToCamel } from '../TemplateTypes';
import { formatLeafHeader } from './DocFormatter';
import { StringBuilder } from '../StringBuilder';

const formatNodeId = (f: TemplateNode):string => f.nodeId?f.nodeId:`RM`

const wrapTripleQuote = (inString: string) => `"""${inString}"""`

const formatDescription = (dBuilder:DocBuilder,f:TemplateNode,typeConstraint: string = '') =>
  wrapTripleQuote(`\`[${formatNodeId(f)} ${typeConstraint}]\`
                             ${dBuilder.getDescription(f)})`)



export const formatValueSetDefinition = ( f: TemplateNode) => {

  const { ab,wt,config } = f.builder;
  const techName = snakeToCamel(f.localizedName, true);

  ab.newline('');

  ab.append(`Alias: $local = http://openehr.org/${f.archetype_id}`);
  ab.append(`ValueSet: ${techName}`);
  ab.append(`Title: "${f.localizedName}"`);
}

export const formatCodeSystemDefinition = ( f: TemplateNode) => {

  const { cb, wt, config } = f.builder;
  const techName = snakeToCamel(f.localizedName, true);

  cb.newline('')
  cb.append(`CodeSystem: http://openehr.org/${f.archetype_id}CS`);
  cb.append(`Id: ${f.archetype_id}}`);
  // url, status, purpose, and other metadata could be defined here using caret syntax (omitted)
}

export const appendCodeSystemItem = (cb : StringBuilder, itemCode: string, itemDescription:string, itemRubric: string) => {
  cb.append(`* #${itemCode} ${itemRubric} 
      "${itemDescription}"`)
}

export const fsht = {



}
