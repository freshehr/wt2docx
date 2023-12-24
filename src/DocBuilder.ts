import { findParentNodeId, FormElement } from "./FormElement";
import { WebTemplate } from "./WebTemplate";
import {
  dataValueLabelMapper,
  formatOccurrences,
  isAnyChoice,
  isDataValue,
  isDisplayableNode,
  isEntry,
  isEvent,
  isSection
} from "./isEntry";
import { StringBuilder } from "./StringBuilder";
import { FormInput } from "./FormInput";

import { Config } from "./Config";
import rmDescriptions from "../resources/rm_descriptions.json";

export class DocBuilder {
  sb: StringBuilder = new StringBuilder();
  defaultLang: string = 'en';
  config: Config;
  exportFormat: string;

  constructor(private wt: WebTemplate, config:Config, exportFormat: string) {
    this.defaultLang = wt.defaultLanguage;
    this.config = config;
    this.exportFormat =exportFormat;
    this.generate();
  }

  public toString(): string {
    return this.sb.toString();
  }

  private backTick = (inString: string): string => `\`${inString}\``

  private buildHeader() {

    this.sb.append(`== Template: ${this.config.title ? this.config.title : this.wt.tree.name}`)

    if (this.config.displayToC) this.sb.append(":toc: left");

    this.sb.newline()
    this.sb.append(`Template Id: **${this.wt.templateId}**`).newline()
    this.sb.append(`Version: **${this.wt.semVer}**`).newline()
    this.sb.append(`Created: **${new Date().toDateString()}**`).newline()
  }

  private generate() {
    this.buildHeader()
    this.walkComposition(this.wt);
  }


  private walkChildren(f: FormElement, nonContextOnly : boolean = false) {
    if (f.children) {
      f.children.forEach((child) => {
        child.parentNode = f;
        if (!nonContextOnly || (nonContextOnly && !child.inContext)) {
          this.walk(child)
        }
      });
    }
  }

  private walkNonContextChildren(f: FormElement) {
      this.walkChildren(f, true)
  }

  private walk(f: FormElement) {
    if (isEntry(f.rmType)) {
      this.walkEntry(f)
    } else if (isDataValue(f.rmType)) {
      this.walkElement(f, false)
    } else if (isSection(f.rmType)) {
      this.walkSection(f)
    } else if (f.rmType === 'ELEMENT') {
      this.walkChoice(f)
    } else if (f.rmType === 'CLUSTER') {
      this.walkCluster(f);
    } else if (isEvent(f.rmType)) {
      this.walkEvent(f)
    } else {
      switch (f.rmType) {

        //      case 'ISM_TRANSITION':
        //        this.walkChildren(f)
        //        break;
        case 'EVENT_CONTEXT':
          f.name = 'Composition context';
          this.walkEventContext(f);
          break;
        case 'CODE_PHRASE':
          f.name = f.id;
          this.walkElement(f, false);
          break;
        case 'PARTY_PROXY':
          f.name = f.id;
          this.walkElement(f, false);
          break;

        default:
          this.sb.append('// Not supported rmType ' + f.rmType);

          break;
      }
    }
  }

  private walkCluster(f: FormElement) {

    const formattedOccurrencesText = this.formatOccurrencesText(f);

    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (!this.config.hideNodeIds)
      this.sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      this.sb.append(clinicalText)

    this.walkChildren(f);
  }

  private formatOccurrencesText(f: FormElement) {
    const occurrencesText = formatOccurrences(f, this.config.displayTechnicalOccurrences);
    return occurrencesText ? `[**${occurrencesText}**]` : ``;
  }

  private walkEvent(f: FormElement) {

    const formattedOccurrencesText =this.formatOccurrencesText(f)
    const clinicalText = `3+a|===== ${f.name}  ${formattedOccurrencesText}`

    if (!this.config.hideNodeIds)
      this.sb.append(clinicalText + '\n' + `\`${f.rmType}: _${f.nodeId}_\``);
    else
      this.sb.append(clinicalText)

    this.walkChildren(f);
  }

  private walkComposition(wt: WebTemplate) {

    const f = wt.tree
    this.addCompositionHeader(f)
    this.addNodeHeader();
    this.walkRmAttributes(f);
    this.addNodeFooter();
    this.walkNonContextChildren(f)
  }


  private walkSection(f: FormElement) {
    if (!this.config?.skippedAQLPaths?.includes(f.aqlPath)) {
      this.addLeafHeader(f)
    }
    this.walkChildren(f)
  }

  private addCompositionHeader(f: FormElement) {

    this.sb.append(`=== Composition: *${f.name}*`).newline()

    if (!this.config.hideNodeIds)
      this.sb.append(`==== Archetype Id: \`_${f.nodeId}_\``).newline();

    this.sb.append(`${f.localizedDescriptions.en}`).newline()
  }

  private addLeafHeader(f: FormElement, title: string = 'Archetype Id:') {
    this.sb.append(`===  *${f.name}*`).newline()

    if (!this.config.hideNodeIds){
      this.sb.append(`==== Type: \`_${f.rmType}_\``)
      this.sb.append(`==== ${title} \`_${f.nodeId}_\``)

    }

    this.sb.append(`${f.localizedDescriptions.en}`).newline()
  }

  private walkEntry(f: FormElement) {

    this.addLeafHeader(f)
    this.addNodeHeader()
    //   this.walkRmAttributes(f);
    this.walkNonContextChildren(f)
    this.addNodeFooter()

  }

  private walkEventContext(f: FormElement) {

    const nodeId = f.nodeId ? f.nodeId : `\`RM:${f.id}\``

    this.sb.append(`==== ${f.name}`);

    if (!this.config.hideNodeIds) {
      this.sb.append(`===== \`${f.rmType}: _${nodeId}_\``);
    }

    if (f.children?.length > 0) {
      this.addNodeHeader()
      this.walkChildren(f)
      this.addNodeFooter()
    }
  }
  private addNodeHeader() {
    this.sb.append('[options="header","stretch", cols="20,30,30"]');
    this.sb.append('|====');
    this.sb.append('|Data item | Description | Allowed values');
  }

  private addNodeContent(f: FormElement, isChoice: boolean) {


    let resolvedNodeId: string;

    if (f.nodeId)
      resolvedNodeId = `${f.nodeId}`;
    else if (isChoice)
      resolvedNodeId = `${findParentNodeId(f).nodeId}`;
    else
      resolvedNodeId = this.backTick("RM");

    const nodeIdText = `NodeID: [${this.backTick(resolvedNodeId)}] ${this.backTick(f.id)}`;


    let nodeName = f.localizedName ? f.localizedName : f.name

    nodeName = nodeName ? nodeName : f.id

    const rmTypeText = `${this.backTick(this.mapRmTypeText(f.rmType))}`;

    let nameText: string
    const occurrencesText = formatOccurrences(f,this.config.displayTechnicalOccurrences)
    const formattedOccurrencesText = occurrencesText?`(_${occurrencesText}_)`:``

    if (!isChoice) {
      nameText = `**${nodeName}** + \n Type: ${rmTypeText} ${formattedOccurrencesText}`

      this.sb.append(`| ${this.applyNodeIdFilter(nameText, nodeIdText)} | ${this.getDescription(f)} `);

    } else {
      nameText = `Type: ${rmTypeText}`

      this.sb.append(`| ${this.applyNodeIdFilter(nameText, nodeIdText)} |`);
    }

    if (f.name === undefined) {
      this.sb.append(`// ${f.id} -  ${f.aqlPath}`);
    }

  }

  private applyNodeIdFilter(nameText: string, nodeIdText: string) {
    if (!this.config.hideNodeIds)
      return nameText + ` + \n ${nodeIdText}`;
    return nameText;
  }

  private addNodeFooter() {
    this.sb.append('|====');
  }

  private walkRmAttributes(f: FormElement) {

    const rmAttributes = new Array<FormElement>();

    if (f.children) {
      f.children.forEach((child) => {
        if (!child?.inContext) return

        if (['ism_transition'].includes(child.id)) {
          if (child.children) {
            child.children.forEach((ismChild) => {
              this.stripExcludedRmTypes(ismChild, rmAttributes);
            });
          }
        }
        else {
          this.stripExcludedRmTypes(child, rmAttributes);
        }
      });

    }

    if (rmAttributes.length === 0) return

    rmAttributes.forEach(child => {
      child.localizedName = child.id;
      this.walk(child);
    });

  }

  private stripExcludedRmTypes(childNode: FormElement, list: FormElement[]) {

    if (!this.config.excludedRMTags.includes(childNode.id)) {
      list.push(childNode);
    }
  }

  // Look for display participations flag in Annotations
//    const displayParticipations= () => {
//      if (f.annotations)
//        console.dir(f.annotations)

  //     for (const key in f.annotations) {
  //       if (f.annotations.hasOwnProperty(key) && key.valueOf() === 'comment')
  //       return true
  //    }
  //     return false
  //   }

/*
  private walkParticipations() {

    if (this.config.hideParticipations) return;

    this.sb.append(`===== _Participations_ [0..*]`);
    this.sb.append('[options="header", cols="25,5,55,30"]');
    this.sb.append('|====');
    this.sb.append('|NodeId|Attr.|RM Type| Name | Details');
    this.sb.append('|RM: function|1..1|DV_TEXT| Role | The function of the Party in this participation');
    this.sb.append('')
//      this.sb.append('|RM: mode|0..1|DV_CODED_TEXT| Mode | Optional field for recording the \'mode\' of the performer / activity interaction, e.g. present, by telephone, by email etc.');
    this.sb.append('|RM: performer|1..1|PARTY_IDENTIFIED| Performer name and ID | The id and possibly demographic system link of the party participating in the activity.');
//      this.sb.append('|RM: time|0..1|DV_INTERVAL| Time | The time interval during which the participation took place, ');
    this.sb.append('|====');

  }
*/

  private walkElement(f: FormElement, isChoice: boolean) {
    this.addNodeContent(f, isChoice)
    this.walkDataType(f)
    this.walkAnnotations(f);
  }

  private walkDataType(f: FormElement) {

    let rmType = f.rmType

    if (f.rmType.startsWith('DV_INTERVAL')) {
      rmType = f.rmType.replace(/(^.*<|>.*$)/g, '')
    }

    switch (rmType) {
      case 'ELEMENT':
        this.walkDvChoice(f)
        break
      case 'DV_CODED_TEXT':
        this.walkDvCodedText(f)
        break;
      case 'DV_TEXT':
        this.walkDvText(f)
        break;
      case 'DV_ORDINAL':
        this.walkDvOrdinal(f)
        break;
      case 'DV_SCALE':
        this.walkDvOrdinal(f);
        break;
      case 'DV_QUANTITY':
        this.walkDvQuantity(f);
        break;

      case 'DV_COUNT':
        this.walkDvCount(f);
        break;

      default:
        if (isDisplayableNode(rmType)) {
          this.walkDvDefault()
        } else {
          this.sb.append('|' + this.backTick('Unsupported RM type: ' + rmType))
        }
    }
  }

  private walkAnnotations(f: FormElement) {
    if (f.annotations) {

      this.sb.append(``);
      for (const key in f.annotations) {
        if (f.annotations.hasOwnProperty(key)) {
          if (this.config?.includedAnnotations?.includes(key))
            this.sb.newline().append(`*${key}*: ${f.annotations[key]}`);
        }
      }
    }
  }


  private walkDvChoice(f: FormElement) {
    this.sb.append('a|');
    let subTypesAllowedText: string;
    if (isAnyChoice(f.children.map(child =>  child.rmType)))
     subTypesAllowedText = 'All'
    else
      subTypesAllowedText = 'Multiple'

    this.sb.append(`_${subTypesAllowedText} data types allowed_`);
  }

  private walkDvOrdinal(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs) {
      const fi: FormInput[] = f.inputs;
      fi.forEach((item) => {
        const formItems = item.list === undefined ? [] : item.list;
        formItems.forEach((n) => {
          const termPhrase = `local:${n.value}`
          this.sb.append(`* [${n.ordinal}] ${n.label} +\n ${this.backTick(termPhrase)}`);
        });
      });
    }
  }

  private getValueOfRecord(record?: Record<string, string>): string {
    if (record) {
      return record[this.defaultLang];
    } else {
      return '';
    }
  }

  private getDescription(f: FormElement) {
    const language: string = 'en'
    if (!f.inContext)
     return this.getValueOfRecord(f.localizedDescriptions)
    else
      return rmDescriptions[f.id] ? rmDescriptions[f.id][language] : ''
  }

  private walkChoice(f: FormElement) {
    this.walkElement(f, false)

    if (isAnyChoice(f.children.map(child =>  child.rmType)))
      return

    this.sb.append(`|_SubTypes_ | |`)
    f.children.forEach((child) => {
      child.parentNode = f
      this.walkElement(child, true)
    });
  }

  private walkDvDefault() {
    this.sb.append('|');
  }

  private walkDvText(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs.length > 0) {
      this.sb.append('')
      f.inputs.forEach((item) => {
        if (item.list) {
          item.list.forEach((val) => {
            this.sb.append(`* ${val.value}`);
          });
        }
        else
        // Pick up an external valueset description annotation
        if (item.suffix !== 'other' && f?.annotations?.vset_description)
        {
          // Convert /n characters to linebreaks
          const newLined = f.annotations?.vset_description.replace(/\\n/g, String.fromCharCode(10));
          this.sb.append(newLined)
        }

        if (item.listOpen)
          this.sb.append(`* _Other text/coded text allowed_`);

      });
//      this.appendDescription(f);
    }
  }

  private walkDvQuantity(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs?.length > 0) {
      this.sb.append('')
      f.inputs.forEach((item) => {
        if (item.list && item.suffix === 'unit') {
          item.list.forEach((val) => {
            this.sb.append('Units: +\n')
            this.sb.append(`* ${val.value}`);
          });
        }
      });
//      this.appendDescription(f);
    }
  }

  private walkDvCount(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs.length > 0) {
      this.sb.append('')
      f.inputs.forEach((item) => {
        if ((item.type === 'INTEGER') && (item?.validation?.range)) {
          this.sb.append('Range: +\n')
          this.sb.append(`* ${item.validation.range.minOp} ${item.validation.range.min} and ${item.validation.range.maxOp} ${item.validation.range.max}`);
        }
      });
    }
  }

  private walkDvCodedText(f: FormElement) {
    this.sb.append('a|');

      f?.inputs.forEach((item) => {
        const term = item.terminology === undefined ? 'local' : item.terminology;
        if (item.list) {
//          this.sb.append(`**Allowed Coded terms**`)
          this.sb.append('')
          item.list.forEach((list) => {
            const termPhrase = `${term}:${list.value}`
            if (term === 'local') {
              this.sb.append(`* ${list.label} +\n ${this.backTick(termPhrase)}`);
            } else {

              this.sb.append(`* ${list.label} +\n ${this.backTick(termPhrase)}`);
            }
          })
        } else
          // Pick up an external valueset description annotation
        if (item.suffix === 'code' && f?.annotations?.vset_description) {
          // Convert /n characters to linebreaks
          const newLined = f.annotations?.vset_description.replace(/\\n/g, String.fromCharCode(10));
          this.sb.append(newLined)
        }

        if (item.listOpen)
          this.sb.append(`* _Other text/ coded text allowed_`);
//          this.appendDescription(f);
      });
  }

  private mapRmTypeText(rmTypeString: string) {

    let rmType = rmTypeString
    let intervalPrefix = ''

    if (rmTypeString.startsWith('DV_INTERVAL')) {
      intervalPrefix = "Interval of "
      rmType = rmTypeString.replace(/(^.*<|>.*$)/g, '');
    }

    if (isDisplayableNode(rmType)) {
      return `${intervalPrefix}${dataValueLabelMapper(rmType)}`
    } else {
      this.sb.append('|' + this.backTick('Unsupported RM type: ' + rmType))
    }
  }
}
