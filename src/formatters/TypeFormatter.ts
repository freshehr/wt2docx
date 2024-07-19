import { DocBuilder } from "../DocBuilder";
import { TemplateNode } from "../TemplateNodes";
import { ExportFormat, FormatElementFn } from "./DocFormatter";
import { fshl } from "./FshLogicalModelFormatter";
import { adoc } from "./AdocFormatter";
import { xmind } from "./XmindFormatter";

export const formatDvCodedText = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.dvTypes.formatDvCodedText
      break;
    case ExportFormat.fshl:
      fn = fshl.dvTypes.formatDvCodedText
      break;
    default:
      fn = adoc.dvTypes.formatDvCodedText
      break;
  }

  if (fn)
    fn(docBuilder, f);
}

// export const formatDvChoice = (docBuilder: DocBuilder, f: TemplateNode): void => {
//
//   let fn: FormatElementFn;
//
//   switch (docBuilder.config.exportFormat) {
//     case ExportFormat.xmind:
//       break;
//     case ExportFormat.fsh:
//       break;
//     default:
//       fn = adoc.dvTypes.formatDvChoice
//       break;
//   }
//
//   if (fn)
//     fn(docBuilder, f);
// }

export const formatDvText = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.dvTypes.formatDvText
      break;
    case ExportFormat.fshl:
      fn = fshl.dvTypes.formatDvText
      break;
    default:
      fn = adoc.dvTypes.formatDvText
      break;
  }
  if (fn)
    fn(docBuilder, f);
}

export const formatDvCount = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
    case ExportFormat.fshl:
      break;
    default:
      fn = adoc.dvTypes.formatDvCount
      break;
  }
  if (fn)
    fn(docBuilder, f);
}

export const formatDvQuantity = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
     break;
    case ExportFormat.fshl:
      fn = fshl.dvTypes.formatDvQuantity
      break;
    default:
      fn = adoc.dvTypes.formatDvQuantity
      break;
  }
  if (fn)
    fn(docBuilder, f);
}

export const formatDvOrdinal = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      fn = xmind.dvTypes.formatDvOrdinal
      break;
    case ExportFormat.fshl:
      break;
    default:
      fn = adoc.dvTypes.formatDvOrdinal
      break;
  }
  if (fn)
    fn(docBuilder, f);
}
export const formatDvDefault = (docBuilder: DocBuilder, f: TemplateNode): void => {

  let fn: FormatElementFn;

  switch (docBuilder.config.exportFormat) {
    case ExportFormat.xmind:
      break;
    case ExportFormat.fshl:
      fn = fshl.dvTypes.formatDvDefault
      break;
    default:
      fn = adoc.dvTypes.formatDvDefault
      break;
  }
  if (fn)
    fn(docBuilder, f);
}
