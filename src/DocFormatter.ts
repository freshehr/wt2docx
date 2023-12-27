import { DocBuilder } from "./DocBuilder";
import  {adoc }from "./formatters/AdocFormatter"
import {xmind } from "./formatters/XmindFormatter"
import { TemplateElement } from "./TemplateElement";
import { dataValueLabelMapper, formatOccurrences, isDisplayableNode } from "./TemplateTypes";

export enum ExportFormat {
  adoc = 'adoc',
  xmind = 'xmind',
  docx = 'docx',
  pdf = 'pdf',
  fsh  = 'fsh'
}

type FormatHeaderFn = (db: DocBuilder) => void;
type SaveFileFn = (db: DocBuilder, outFile: string) =>  Promise<void>;
type FormatCompositionHeaderFn = (dBuilder: DocBuilder, f: TemplateElement) => void;
export type FormatElementFn  = (docBuilder: DocBuilder, f: TemplateElement) => void;
type FormatNodeContentFn = (dBuilder: DocBuilder, f: TemplateElement, isChoice: boolean) => void;


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
     case ExportFormat.docx:
     case ExportFormat.pdf:
     case ExportFormat.fsh:
       break;
     default:
       break;
   }

  if(fn)
    fn(docBuilder);
 }

export const formatCompositionHeader = (docBuilder: DocBuilder, f: TemplateElement): void => {

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

export const formatNodeHeader = (docBuilder: DocBuilder): void => {

  let fn: FormatHeaderFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.adoc:
    case ExportFormat.xmind:
    case ExportFormat.docx:
    case ExportFormat.pdf:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeHeader
      break;
  }

  if (fn)
    fn(docBuilder);
}

export const formatNodeFooter = (docBuilder: DocBuilder, f: TemplateElement): void => {

  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeFooter
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatCompositionContextHeader = (docBuilder: DocBuilder, f: TemplateElement): void => {

  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatCompositionContextHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatLeafHeader = (docBuilder: DocBuilder, f: TemplateElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatLeafHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatObservationEvent = (docBuilder: DocBuilder, f: TemplateElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatObservationEvent
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatCluster = (docBuilder: DocBuilder, f: TemplateElement): void => {
  let fn: FormatElementFn;

  switch (docBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
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

export const formatNodeContent= (dBuilder: DocBuilder, f: TemplateElement, isChoice: boolean) => {
  let fn: FormatNodeContentFn;

  switch (dBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatNodeContent
      break
  }

  if (fn)
    fn(dBuilder, f, isChoice)
}

export const formatAnnotations= (dBuilder: DocBuilder, f: TemplateElement) =>{
  let fn: FormatElementFn;

  switch (dBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatAnnotations
      break
  }

  if (fn)
    fn(dBuilder, f)
}

export const formatUnsupported= (dBuilder: DocBuilder, f: TemplateElement) =>{
  let fn: FormatElementFn;

  switch (dBuilder.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fsh:
      break;
    default:
      fn = adoc.formatUnsupported
      break
  }

  if (fn)
    fn(dBuilder, f)
}

export const formatOccurrencesText= (dBuilder: DocBuilder, f: TemplateElement) => {
  const occurrencesText = formatOccurrences(f, dBuilder.config.displayTechnicalOccurrences);
  return occurrencesText ? `[**${occurrencesText}**]` : ``;
}


