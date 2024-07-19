import { TemplateNode } from './TemplateNodes';

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

export function isEventContext(rmType: string) {
  return ['EVENT_CONTEXT'].includes(rmType);
}

export function isComposition(rmType: string) {
  return ['COMPOSITION'].includes(rmType);
}

export function isCluster(rmType: string) {
  return ['CLUSTER'].includes(rmType);
}

export function isDvChoice(rmType: string) {
  return ['ELEMENT'].includes(rmType);
}

export function isBranchNode(rmType:string) {
  return isEntry(rmType) || isEventContext(rmType) || isActivity(rmType) || isEvent(rmType) || isISMTransition(rmType) || isSection(rmType) || isCluster(rmType)
}
export function isAnyChoice(rmType: string[]) {
  // compares the list of Choices with the whole DataValues array and sends true if all the values exist.
  const dvDataTypes: string[] = Object.keys(DvDataValues).filter(key => isNaN(+key))

  const missing: string[] = dvDataTypes.filter(item =>  (rmType.indexOf(item) < 0 ))

  return (missing.length === 0)

}

export const snakeToCamel = (s: string, forceInitialCap : boolean) => {
  if (!s) return '*undefined*'

    const indexInit = forceInitialCap?-1:0

  return s
    .replace(/[_/-/(/)/[//.]/g,' ')
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) =>
      index === indexInit
        ? letter.toLowerCase()
        : letter.toUpperCase()
    )
    .replace(/\s+|[_-]/g, '')
}


export const isArchetype= (rmType: string, nodeId: string) => {
  return ['COMPOSITION','OBSERVATION', 'EVALUATION', 'INSTRUCTION', 'SECTION', 'ACTION', 'ADMIN_ENTRY', 'GENERIC_ENTRY', 'CLUSTER', 'ELEMENT'].includes(rmType)
         &&  nodeId.substring(0,2) !== 'at'
}

export const mapRmTypeText = (rmTypeString: string) => {

  // if (!isDisplayableNode(rmTypeString)) return ''

  let rmType = rmTypeString
  let intervalPrefix = ''

  if (rmTypeString.startsWith('DV_INTERVAL')) {
    intervalPrefix = "Interval of "
    rmType = rmTypeString.replace(/(^.*<|>.*$)/g, '');
  }

  return `${intervalPrefix}${dataValueLabelMapper(rmType)}`
}

export const mapRmType2FHIR = (rmTypeString: string) => {

  // if (!isDisplayableNode(rmTypeString)) return ''

  let rmType = rmTypeString
  let intervalPrefix = ''

  if (rmTypeString.startsWith('DV_INTERVAL')) {
    intervalPrefix = "Interval of "
    rmType = rmTypeString.replace(/(^.*<|>.*$)/g, '');

    return dataValueIntervalFHIRMapper(rmType)
  }

  return `${intervalPrefix}${dataValueFHIRMapper(rmType)}`
}

export enum DvDataValues{
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
}

export enum NonDvDataValues{
  'DV_STATE' ,
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
  return Object.keys(DvDataValues).includes(rmType) || Object.keys(NonDvDataValues).includes(rmType)
}

export function isDisplayableNode(rmType: string)
{
  return Object.keys(DvDataValues).includes(rmType) || Object.keys(OtherDisplayableNodes).includes(rmType)
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

export const openEHR2FHIRDatatypeTable = {
  ELEMENT: 'Choice',
  DV_CODED_TEXT: 'CodeableConcept',
  DV_TEXT: 'CodeableConcept',
  DV_ORDINAL: 'CodeableConcept',
  DV_SCALE: 'CodeableConcept',
  DV_QUANTITY: 'Quantity',
  DV_DURATION: 'Duration',
  DV_COUNT: 'Count',
  DV_DATE_TIME: 'dateTime',
  DV_IDENTIFIER: 'Identifier',
  DV_MULTIMEDIA: 'Attachment',
  DV_URI: "uri",
  DV_EHR_URI: "uri",
  DV_PARSABLE: "string",
  DV_PROPORTION: "Proportion",
  DV_STATE: "State",
  DV_BOOLEAN: "boolean",
  DV_DATE: "date",
  DV_TIME: "time",
  CODE_PHRASE: "Coding",
  PARTY_PROXY: "BackboneElement",
  STRING: "String",
}
export const openEHRInterval2FHIRTable = {
  DV_QUANTITY: 'Range',
  DV_DURATION: 'Duration',
  DV_COUNT: 'Range',
  DV_DATE_TIME: 'Period',
  DV_PROPORTION: "Proportion",
  DV_DATE: "Period",
  DV_TIME: "Period",
}


export const dataValueLabelMapper = (dataValue:string) => displayableNodeTextTable[dataValue] || `RM type not supported ${dataValue}`

export const dataValueFHIRMapper = (dataValue:string) => {
  if (isBranchNode(dataValue))
     return 'BackboneElement'
   else
     return openEHR2FHIRDatatypeTable[dataValue] || `(FHIR mapping not supported) ${dataValue}`
}

export const dataValueIntervalFHIRMapper = (dataValue:string) => openEHRInterval2FHIRTable[dataValue] || `RM Interval type not supported ${dataValue}`


export const formatOccurrences = (f: TemplateNode, techDisplay :boolean = true) => {

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
