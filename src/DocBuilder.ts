import { findParentNodeId, TemplateElement } from './TemplateElement';
import { WebTemplate } from "./WebTemplate";
import {
  isActivity,
  isAnyChoice,
  isDataValue,
  isEntry,
  isEvent,
  isSection
} from "./TemplateTypes";
import { StringBuilder } from "./StringBuilder";
import { Config } from "./Config";
import rmDescriptions from "../resources/rm_descriptions.json";
import {
  ExportFormat,
  formatChoiceHeader,
  formatCluster, formatCompositionContextHeader,
  formatCompositionHeader, formatInstructionActivity,
  formatLeafHeader,
  formatNodeContent,
  formatNodeFooter,
  formatNodeHeader,
  formatObservationEvent,
  formatTemplateHeader,
  formatUnsupported
} from "./DocFormatter";
import {
  formatDvCodedText,
  formatDvCount,
  formatDvDefault,
  formatDvOrdinal,
  formatDvQuantity,
  formatDvText
} from "./formatters/TypeFormatter";


export class DocBuilder {

  sb: StringBuilder = new StringBuilder();
  defaultLang: string = 'en';
  config: Config;
  exportFormat: ExportFormat
  outFileDir: string;
  archetypeList : string[] = [];

  readonly _wt: WebTemplate;

  constructor(wt: WebTemplate, config: Config, exportFormatString: string, outFileDir: string) {
    this._wt = wt;
    this.defaultLang = wt.defaultLanguage;
    this.config = config;
    this.exportFormat = ExportFormat[exportFormatString];
    this.outFileDir = outFileDir

    this.generate();
  }

  public toString(): string {
    return this.sb.toString();
  }

  get wt(): WebTemplate {
    return this._wt;
  }

  private generate() {
    formatTemplateHeader(this)
    this.walkComposition(this._wt.tree);
  }

  private walkChildren(f: TemplateElement, nonContextOnly: boolean = false) {
    if (f.children) {
      f.children.forEach((child) => {
        child.parentNode = f;
        if (!nonContextOnly || (nonContextOnly && !child.inContext)) {
          this.walk(child)
        }
      });
    }
  }

  private walkNonRMChildren(f: TemplateElement) {
    this.walkChildren(f, true)
  }

  private walk(f: TemplateElement) {
     if (isEntry(f.rmType))
      this.walkEntry(f)
     else if (isDataValue(f.rmType))
      this.walkElement(f)
     else if (isSection(f.rmType))
      this.walkSection(f)
     else if (isEvent(f.rmType))
      this.walkObservationEvent(f)
     else if (isActivity(f.rmType))
       this.walkInstructionActivity(f)
     else if (f.rmType === 'CLUSTER')
      this.walkCluster(f);
     else {
      switch (f.rmType) {

      //       case 'ISM_TRANSITION':
       //         this.walkChildren(f)
        //        break;
        case 'EVENT_CONTEXT':
          f.name = 'Composition context';
          this.walkCompositionContext(f);
          break;
        case 'CODE_PHRASE':
          f.name = f.id;
          this.walkElement(f);
          break;
        case 'PARTY_PROXY':
          f.name = f.id;
          this.walkElement(f);
          break;
        default:
          this.walkUnsupported(f)
          break;
      }
    }
  }

  private walkUnsupported(f: TemplateElement)
  {
    formatUnsupported(this,f);
  }

  private walkCluster(f: TemplateElement) {
    if (f.nodeId.includes('CLUSTER'))
      this.archetypeList.push(f.nodeId)

    formatCluster(this, f)
    this.walkChildren(f);
  }

  private walkObservationEvent(f: TemplateElement) {
    formatObservationEvent(this, f)
    this.walkChildren(f);
  }

  private walkComposition(f: TemplateElement) {
    this.archetypeList.push(f.nodeId)
    formatCompositionHeader(this, f)
    formatNodeHeader(this);
    this.walkRmChildren(f);
    formatNodeFooter(this,f);
    this.walkNonRMChildren(f)
  }

  private walkElement(f: TemplateElement) {
    formatNodeContent(this, f, false)
    this.walkDataType(f)
 //   formatAnnotations(this,f);
  }

  private walkChoice(f: TemplateElement) {
    formatNodeContent(this, f, true)
    this.walkDataType(f)
 //   formatAnnotations(this,f);
  }

  private walkSection(f: TemplateElement) {
    if (!this.config?.skippedAQLPaths?.includes(f.aqlPath)) {
      this.archetypeList.push(f.nodeId)
      formatLeafHeader(this, f)
    }
    this.walkChildren(f)
  }


  private walkEntry(f: TemplateElement) {
    this.archetypeList.push(f.nodeId)
    formatLeafHeader(this, f)
    formatNodeHeader(this)
    this.walkRmChildren(f);
    this.walkNonRMChildren(f)
    formatNodeFooter(this,f)
  }

  private walkCompositionContext(f: TemplateElement) {
    formatCompositionContextHeader(this, f);
    if (f.children?.length > 0) {
      formatNodeHeader(this)
      this.walkRmChildren(f);
      this.walkNonRMChildren(f)
      formatNodeFooter(this,f)
    }
  }

  private walkRmChildren(f: TemplateElement) {

    const rmAttributes = new Array<TemplateElement>();

    if (f.children) {
      f.children.forEach((child) => {
        child.parentNode = f;
        if (!child?.inContext) return

        if (['ism_transition'].includes(child.id)) {
          if (child.children) {
            child.children.forEach((ismChild) => {
              ismChild.parentNode = f;
              this.stripExcludedRmTypes(ismChild, rmAttributes);
            });
          }
        } else {
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

  private stripExcludedRmTypes(childNode: TemplateElement, list: TemplateElement[]) {

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

  private adjustRmTypeForInterval  = (rmType: string): string => {
    if (rmType.startsWith('DV_INTERVAL'))
      return rmType.replace(/(^.*<|>.*$)/g, '')
    else
      return rmType
  }

  private walkDataType(f: TemplateElement) {

    const adjustedRmType = this.adjustRmTypeForInterval(f.rmType);

    switch (adjustedRmType){
      case 'ELEMENT':
        this.walkChoiceHeader(f)
        break
      case 'DV_CODED_TEXT':
        formatDvCodedText(this,f)
        break;
      case 'DV_TEXT':
        formatDvText(this,f)
        break;
      case 'DV_ORDINAL':
        formatDvOrdinal(this,f)
        break;
      case 'DV_SCALE':
        formatDvOrdinal(this,f);
        break;
      case 'DV_QUANTITY':
        formatDvQuantity(this,f);
        break;
      case 'DV_COUNT':
        formatDvCount(this,f);
        break;
      default:
        formatDvDefault(this,f);
    }
  }

  private getValueOfRecord(record?: Record<string, string>): string {
    if (record) {
      return record[this.defaultLang];
    } else {
      return '';
    }
  }

  public getDescription = (f: TemplateElement) => {
    const language: string = 'en'
    if (!f.inContext)
      return this.getValueOfRecord(f.localizedDescriptions)
    else {
      let rmTag = f.id;
      if (f.id === 'time') {

        const parent: TemplateElement = findParentNodeId(f);
        switch (parent.rmType){
          case 'ACTION':
            rmTag = 'action_time'
            break;
          case 'EVENT':
            rmTag = 'event_time'
            break
          default:
            break;
        }
      }
      return rmDescriptions[rmTag] ? rmDescriptions[rmTag][language] : ''

    }
  };

  private walkChoiceHeader(f: TemplateElement) {

    formatChoiceHeader(this,f)
    if (isAnyChoice(f.children.map(child => child.rmType)))
      return

    f.children.forEach((child) => {
      child.parentNode = f
      this.walkChoice(child)
    });
  }


  private walkInstructionActivity(f: TemplateElement) {
    formatInstructionActivity(this, f)
    this.walkChildren(f);
  }
}
