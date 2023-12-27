import { DocBuilder } from "./DocBuilder";
import  {adoc }from "./AdocFormatter"
import {xmind } from "./XmindFormatter"
import { FormElement } from "./FormElement";
import { dataValueLabelMapper, formatOccurrences, isDisplayableNode } from "./isEntry";

export enum ExportFormat {
  adoc = 'adoc',
  xmind = 'xmind',
  docx = 'docx',
  pdf = 'pdf',
  fsh  = 'fsh'
}

type FormatHeaderFn = (db: DocBuilder) => void;
type SaveFileFn = (db: DocBuilder, outFile: string) =>  Promise<void>;
type FormatCompositionHeaderFn = (dBuilder: DocBuilder, f: FormElement) => void;
type FormatElementFn  = (docBuilder: DocBuilder, f: FormElement) => void;
type BuilderFn  = (docBuilder: DocBuilder) => void;
type FormatNodeContentFn = (dBuilder: DocBuilder, f: FormElement, isChoice: boolean) => void;


export const mapRmTypeText = (rmTypeString: string) => {

  if (!isDisplayableNode(rmTypeString)) return ''

  let rmType = rmTypeString
  let intervalPrefix = ''

  if (rmTypeString.startsWith('DV_INTERVAL')) {
    intervalPrefix = "Interval of "
    rmType = rmTypeString.replace(/(^.*<|>.*$)/g, '');
  }

  return `${intervalPrefix}${dataValueLabelMapper(rmType)}`
}

export const formatTemplateHeader = (docBuilder: DocBuilder): void => {

   let fn: FormatHeaderFn;
   switch (docBuilder.exportFormat){
     case ExportFormat.adoc:
      fn = adoc.formatTemplateHeader
      break;
    case ExportFormat.xmind:
      fn= xmind.formatHeader
      break;
     case ExportFormat.docx, ExportFormat.pdf,ExportFormat.fsh:
       break;
   }

  if(fn)
    fn(docBuilder);
 }

export const formatCompositionHeader = (docBuilder: DocBuilder, f: FormElement): void => {

  let fn: FormatCompositionHeaderFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatCompositionHeader
      break;
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatCompositionHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

  export const formatElement = (docBuilder: DocBuilder, f: FormElement): void => {

  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatElement
      break;
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatCompositionHeader
      break;
  }

  if(fn)
    fn(docBuilder, f);
}

export const addNodeHeader = (docBuilder: DocBuilder, f: FormElement): void => {

  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const addCompositionHeader = (docBuilder: DocBuilder, f: FormElement): void => {

  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatCompositionHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatLeafHeader = (docBuilder: DocBuilder, f: FormElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatLeafHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatObservationEvent = (docBuilder: DocBuilder, f: FormElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatObservationEvent
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatCluster = (docBuilder: DocBuilder, f: FormElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatCluster
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const saveFile  = async (docBuilder: DocBuilder, outFile: string): Promise<void> => {
  let fn: SaveFileFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.saveFile
      break
    case ExportFormat.fsh:
    default:
      fn = adoc.saveFile
      break
  }
  if (fn)
    await fn(docBuilder, outFile)
}

export const addNodeFooter  =  (docBuilder: DocBuilder)=> {

  let fn: BuilderFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeFooter
      break
  }

  if (fn)
    fn(docBuilder)
}

export const formatNodeContent= (dBuilder: DocBuilder, f: FormElement, isChoice: boolean) =>{
  let fn: FormatNodeContentFn;

  switch (dBuilder.exportFormat) {
    case ExportFormat.xmind, ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeContent
      break
  }

  if (fn)
    fn(dBuilder, f, isChoice)
}

export const formatOccurrencesText= (dBuilder: DocBuilder, f: FormElement) => {
  const occurrencesText = formatOccurrences(f, dBuilder.config.displayTechnicalOccurrences);
  return occurrencesText ? `[**${occurrencesText}**]` : ``;
}


