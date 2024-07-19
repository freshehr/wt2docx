import { DocBuilder } from "../DocBuilder";
import  {adoc }from "./AdocFormatter"
import {xmind } from "./XmindFormatter"
import { TemplateNode } from "../TemplateNodes";
import { formatOccurrences } from "../TemplateTypes";
import { docx, pdf } from "./PanDocFormatter";
import { fshl } from './FshLogicalModelFormatter';

export enum ExportFormat {
  adoc = 'adoc',
  xmind = 'xmind',
  docx = 'docx',
  pdf = 'pdf',
  fshl  = 'fshl'
}

type FormatHeaderFn = (db: DocBuilder) => void;
type SaveFileFn = (db: DocBuilder, outFile: string) =>  Promise<void>;
type FormatCompositionHeaderFn = (dBuilder: DocBuilder, f: TemplateNode) => void;
export type FormatElementFn  = (docBuilder: DocBuilder, f: TemplateNode) => void;
type FormatNodeContentFn = (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => void;


export const formatTemplateHeader = (docBuilder: DocBuilder): void => {

   let fn: (dBuilder: DocBuilder) => void;
   switch (docBuilder.config.exportFormat){
    case ExportFormat.xmind:
      fn= xmind.formatHeader
      break;
     case ExportFormat.fshl:
       fn = fshl.formatTemplateHeader
       break;
     default:

       break;
   }

  if(fn)
    fn(docBuilder);
 }

export const formatCompositionHeader = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatCompositionHeaderFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatCompositionHeader
      break;
    case ExportFormat.fshl:
      fn = fshl.formatCompositionHeader
      break;
    default:
      fn = adoc.formatCompositionHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatProvenanceTable = (docBuilder: DocBuilder) => {

  let fn: FormatHeaderFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.docx:
    case ExportFormat.pdf:
    case ExportFormat.adoc:
      fn = adoc.formatProvenanceTable
      break;
    case ExportFormat.xmind:
      break;
    case ExportFormat.fshl:
      break;
  }

  if (fn)
    fn(docBuilder);

}

export const formatChoiceHeader = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatChoiceHeader
      break;
    case ExportFormat.fshl:
      fn = fshl.formatChoiceHeader
      break;
    default:
      fn = adoc.formatChoiceHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatNodeHeader = (docBuilder: DocBuilder): void => {

  let fn: FormatHeaderFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      break;
    case ExportFormat.fshl:
      break;
    default:
      fn = adoc.formatNodeHeader
      break;
  }

  if (fn)
    fn(docBuilder);
}

export const formatNodeFooter = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fshl:
      break;
    default:
      fn = adoc.formatNodeFooter
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatCompositionContextHeader = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatCompositionContextHeader
      break;
    case ExportFormat.fshl:
      fn = fshl.formatCompositionContextHeader
      break;
    default:
      fn = adoc.formatCompositionContextHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatEntryHeader = (docBuilder: DocBuilder, f: TemplateNode): void => {
  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatLeafHeader
      break;
    case ExportFormat.fshl:
      fn = fshl.formatEntryHeader;
      break;
    default:
      fn = adoc.formatLeafHeader
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatLeafHeader = (docBuilder: DocBuilder, f: TemplateNode): void => {
  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatLeafHeader
      break;
      case ExportFormat.fshl:
        fn = fshl.formatLeafHeader;
        break;
    default:
        fn = adoc.formatLeafHeader
        break;
    }

  if (fn)
    fn(docBuilder, f);
}

export const formatObservationEvent = (docBuilder: DocBuilder, f: TemplateNode): void => {
  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatObservationEvent
      break;
    case ExportFormat.fshl:
      fn = fshl.formatObservationEvent
      break;
    default:
      fn = adoc.formatObservationEvent
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatInstructionActivity = (docBuilder: DocBuilder, f: TemplateNode): void => {
  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
  //    fn = xmind.formatObservationEvent
      break;
    case ExportFormat.fshl:
      break;
    default:
      fn = adoc.formatInstructionActivity
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

export const formatCluster = (docBuilder: DocBuilder, f: TemplateNode): void => {
  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fshl:
      fn = fshl.formatCluster
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

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.saveFile
      break
    case ExportFormat.fshl:
      fn = fshl.saveFile
      break;

    case ExportFormat.docx:
      fn = docx.saveFile
      break;
    case ExportFormat.pdf:
      fn = pdf.saveFile
      break;
    default:
      fn = adoc.saveFile
      break
  }
  if (fn)
    await fn(docBuilder, outFile)
}

export const formatNodeContent= (dBuilder: DocBuilder, f: TemplateNode, isChoice: boolean) => {
  let fn: FormatNodeContentFn;

  switch (dBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.formatNodeContent
      break;
    case ExportFormat.fshl:
      fn = fshl.formatNodeContent
      break
    default:
      fn = adoc.formatNodeContent
      break
  }

  if (fn)
    fn(dBuilder, f, isChoice)
}

export const formatAnnotations= (dBuilder: DocBuilder, f: TemplateNode) =>{
  let fn: FormatElementFn;

  switch (dBuilder.config.exportFormat) {
    case ExportFormat.fshl:
      break;
    case ExportFormat.xmind:
    default:
      fn = adoc.formatAnnotations
      break
  }

  if (fn)
    fn(dBuilder, f)
}

export const formatUnsupported= (dBuilder: DocBuilder, f: TemplateNode) =>{
  let fn: FormatElementFn;

  switch (dBuilder.config.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fshl:
     break;
    default:
      fn = adoc.formatUnsupported
      break
  }

  if (fn)
    fn(dBuilder, f)
}

export const formatOccurrencesText= (dBuilder: DocBuilder, f: TemplateNode) => {
  const occurrencesText = formatRawOccurrencesText(dBuilder,f);
  return occurrencesText ? `**${occurrencesText}**` : ``;
}

export const formatRawOccurrencesText= (dBuilder: DocBuilder, f: TemplateNode) => {
  const occurrencesText = formatOccurrences(f, dBuilder.config.displayTechnicalOccurrences);
  return occurrencesText ? `[${occurrencesText}]` : ``;
}


