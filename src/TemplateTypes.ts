import { TemplateElement } from './TemplateElement';

export function isEntry(rmType: string) {
  return ['OBSERVATION', 'EVALUATION', 'INSTRUCTION', 'ACTION', 'ADMIN_ENTRY', 'GENERIC_ENTRY'].includes(rmType);
}

export function isEvent(rmType: string) {
  return ['EVENT', 'POINT_EVENT', 'INTERVAL_EVENT'].includes(rmType);
}

export function isActivity(rmType: string) {
  return ['ACTIVITY'].includes(rmType);
}

export function isISMTransition(rmType: string) {
  return ['ISM_TRANSITION'].includes(rmType);
}

export function isSection(rmType: string) {
  return ['SECTION'].includes(rmType);
}

export function isDvChoice(rmType: string) {
  return ['ELEMENT'].includes(rmType);
}
export function isAnyChoice(rmType: string[]) {
  // compares the list of Choices with the whole DataValues array and sends true if all the values exist.
  const missing = Object.keys(DataValues).filter(item => rmType.indexOf(item) < 0 && isNaN(Number(item)))
 return missing.length === 0
}

export function isChoice(rmType: string[]) {
  // compares the list of Choices with the whole DataValues array and sends true if all the values exist.
  const missing = Object.keys(DataValues).filter(item => rmType.indexOf(item) < 0 && isNaN(Number(item)))
  return missing.length === 0
}

export enum DataValues{
  'DV_CODED_TEXT',
  'DV_TEXT',
  'DV_DATE',
  'DV_DATE_TIME',
  'DV_TIME',
  'DV_ORDINAL',
  'DV_SCALE',
  'DV_COUNT',
  'DV_DURATION',
  'DV_URI',
  'DV_QUANTITY',
  'DV_BOOLEAN',
  'DV_IDENTIFIER',
  'DV_PROPORTION',
  'DV_EHR_URI',
  'DV_MULTIMEDIA',
  'DV_PARSABLE',
  'DV_STATE',
  'ELEMENT',
  'STRING'
}

export enum OtherDisplayableNodes{
  'CODE_PHRASE',
  'PARTY_PROXY'
}

// type DisplayableNodes = DataValues | OtherDisplayableNodes

export function isDataValue(rmType: string)
{
  return Object.keys(DataValues).includes(rmType)
}

export function isDisplayableNode(rmType: string)
{
  return Object.keys(DataValues).includes(rmType) || Object.keys(OtherDisplayableNodes).includes(rmType)
}
const displayableNodeTextTable = {
  ELEMENT: 'Choice',
  DV_CODED_TEXT: 'Coded text',
  DV_TEXT: 'Text',
  DV_ORDINAL: 'Ordinal',
  DV_SCALE: 'Scale',
  DV_QUANTITY: 'Quantity',
  DV_DURATION: 'Duration',
  DV_COUNT: 'Count',
  DV_DATE_TIME: 'Date/time',
  DV_IDENTIFIER: 'Identifier',
  DV_MULTIMEDIA: 'Multimedia',
  DV_URI: "External URI",
  DV_EHR_URI: "Internal URI",
  DV_PARSABLE: "Parsable text",
  DV_PROPORTION: "Proportion",
  DV_STATE: "State",
  DV_BOOLEAN: "Boolean",
  DV_DATE: "Date",
  DV_TIME: "Time",
  CODE_PHRASE: "Code phrase",
  PARTY_PROXY: "Party",
  STRING: "String"
}

export const dataValueLabelMapper = (dataValue:string) => displayableNodeTextTable[dataValue] || `Not supported ${dataValue}`

export const formatOccurrences = (f: TemplateElement, techDisplay :boolean = true) => {

  let min =''
  let max = ''

  if (techDisplay)
  {
    max = f.max < 0 ? '*' : `${f.max}`;
    return `${f.min}..${max}`
  }

  if (f.min === 0 && f.max ===1)
    return ''

  if (f.min === 0)
    min= ''
  else
    if (f.min === 1)
    min = 'mandatory'
  else
    min = `${f.min}`

  if (f.max < 0)
    max = 'multiple'
  else if (f.max === 1)
    max = ''
  else
    max = `multiple: ${f.max}`

 if (min === '')
  return max
 else if (max === '')
  return min
 else
  return `${min}, ${max}`

}
