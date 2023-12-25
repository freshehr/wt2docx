import { DocBuilder } from "./DocBuilder";
import  {adoc }from "./AdocFormatter"
import {xmind } from "./XmindFormatter"

export enum ExportFormat {
  adoc = 'adoc',
  xmind = 'xmind',
  docx = 'docx',
  pdf = 'pdf',
  fsh  = 'fsh'
}

type FormatHeaderFunction = (db: DocBuilder) => void;
type SaveFileFunction = (db: DocBuilder, outFile: string) => void;


 export const formatHeader = (docBuilder: DocBuilder): FormatHeaderFunction => {
   switch (docBuilder.exportFormat) {
     case ExportFormat.adoc:
      return adoc.formatHeader
    case ExportFormat.xmind:
      return xmind.formatHeader
  }
}



export const saveFile  = (docBuilder: DocBuilder, outFile: string): SaveFileFunction => {
  switch (docBuilder.exportFormat) {
    case ExportFormat.adoc:
      return adoc.saveFile
    case ExportFormat.xmind:
      return xmind.saveFile
  }
}
