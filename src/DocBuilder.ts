import { findParentNodeId, TemplateNode } from './TemplateNodes';
import { WebTemplate } from "./WebTemplate";
import {
  isActivity,
  isAnyChoice, isArchetype, isCluster, isComposition,
  isDataValue,
  isEntry,
  isEvent,
  isSection,
} from './TemplateTypes';
import { StringBuilder } from "./StringBuilder";
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
  formatObservationEvent, formatProvenanceTable,
  formatTemplateHeader,
  formatUnsupported, saveFile,
} from './formatters/DocFormatter';
import {
  formatDvCodedText,
  formatDvCount,
  formatDvDefault,
  formatDvOrdinal,
  formatDvQuantity,
  formatDvText
} from "./formatters/TypeFormatter";
import {
  ArchetypeList,
  fetchADArchetype, getProvenance,
  updateArchetypeLists,
} from './provenance/openEProvenance';
import { Config } from './BuilderConfig';
import path from 'path';
import { augmentWebTemplate, ResolvedTemplateFiles } from './provenance/wtxBuilder';


export class DocBuilder {

  sb: StringBuilder = new StringBuilder();
  config: Config;
  localArchetypeList : ArchetypeList = [];
  candidateArchetypeList: ArchetypeList = []
  remoteArchetypeList: ArchetypeList = [];
  resolvedTemplateFiles: ResolvedTemplateFiles;

  readonly _wt: WebTemplate;

  constructor(wt: WebTemplate, config: Config) {
    this._wt = wt;
    this.config = config;
    this.config.defaultLang = wt.defaultLanguage;

    this.generate().then( result => {

    const outFilePath = this.handleOutPath(this.config.inFilePath, this.config.outFilePath, this.config.exportFormat,this.config.outFileDir);
    saveFile(this, outFilePath);

    if (this.resolvedTemplateFiles.wtxOutPath)
      saveFile(this, this.resolvedTemplateFiles.wtxOutPath)
    });

  }

  private regenWtx(): boolean {
    return (this.resolvedTemplateFiles.wtxOutPath !== null)
}
  private handleOutPath(infile :string, outputFile: string , ext: string, outDir: string) {
    {
      if (outputFile) return outputFile;

      const fExt:string = ext === 'wtx'?'wtx.json': ext;
      const pathSeg = path.parse(infile);

      return  `${outDir}/${pathSeg.name}.${fExt}`;
    }
  }
  public toString(): string {
    return this.sb.toString();
  }

  get wt(): WebTemplate {
    return this._wt;
  }

  private async generate() {
    formatTemplateHeader(this)
    await this.walk(this._wt.tree);
    formatProvenanceTable(this)
  }

  private async walkChildren(f: TemplateNode, nonContextOnly: boolean = false) {
    if (f.children) {
      for( const child of f.children) {
        child.parentNode = f;
        if (!nonContextOnly || (nonContextOnly && !child.inContext)) {
          await this.walk(child)
        }
      }
    }
  }

  private async walkNonRMChildren(f: TemplateNode) {
    await this.walkChildren(f, true)
  }

  private async walk(f: TemplateNode) {

    if (isArchetype(f.rmType,f.nodeId) && this.regenWtx() ) {
      await augmentWebTemplate(this,f)
      updateArchetypeLists(this.remoteArchetypeList, this.candidateArchetypeList,this.localArchetypeList,getProvenance(f))
    }

    if (isComposition(f.rmType))
      await this.walkComposition(f)
    else if (isCluster(f.rmType))
     await this.walkCluster(f)
    else if (isEntry(f.rmType))
      await this.walkEntry(f)
    else if (isDataValue(f.rmType))
      this.walkElement(f)
    else if (isSection(f.rmType))
      await this.walkSection(f)
    else if (isEvent(f.rmType))
      this.walkObservationEvent(f)
    else if (isActivity(f.rmType))
       this.walkInstructionActivity(f)
    else {
      switch (f.rmType) {
        case 'EVENT_CONTEXT':
          f.name = 'Composition context';
          await this.walkCompositionContext(f);
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

  private walkUnsupported(f: TemplateNode)
  {
    formatUnsupported(this,f);
  }

  private async walkCluster(f: TemplateNode) {
    formatCluster(this, f)
    await this.walkChildren(f);
  }

  private walkObservationEvent(f: TemplateNode) {
    formatObservationEvent(this, f)
    this.walkChildren(f);
  }

  private async walkComposition(f: TemplateNode) {
    formatCompositionHeader(this, f)
    formatNodeHeader(this);
    this.walkRmChildren(f);
    formatNodeFooter(this,f);
    await this.walkNonRMChildren(f)
  }

  private walkElement(f: TemplateNode) {
    formatNodeContent(this, f, false)
    this.walkDataType(f)
  }

  private walkChoice(f: TemplateNode) {
    formatNodeContent(this, f, true)
    this.walkDataType(f)
 //   formatAnnotations(this,f);
  }

  private async walkSection(f: TemplateNode) {
    console.log(`WalkSection in ${f.nodeId}`)

    if (!this.config?.skippedAQLPaths?.includes(f.aqlPath)) {
      formatLeafHeader(this, f)
    }
    await this.walkChildren(f)
    console.log(`WalkSection out ${f.nodeId}`)

  }



  private async walkEntry(f: TemplateNode) {
    formatLeafHeader(this, f)
    formatNodeHeader(this)
    this.walkRmChildren(f);

    await this.walkNonRMChildren(f)

    formatNodeFooter(this,f)
    console.log(`WalkEntry out ${f.nodeId}`)
  }

  private async walkCompositionContext(f: TemplateNode) {
    formatCompositionContextHeader(this, f);
    if (f.children?.length > 0) {
      formatNodeHeader(this)
      this.walkRmChildren(f);
      await this.walkNonRMChildren(f)
      console.log('Walk CompContext Out')
      formatNodeFooter(this,f)
    }
  }

  private walkRmChildren(f: TemplateNode) {

    const rmAttributes = new Array<TemplateNode>();

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

  private stripExcludedRmTypes(childNode: TemplateNode, list: TemplateNode[]) {

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

  private walkDataType(f: TemplateNode) {

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
      return record[this.config.defaultLang];
    } else {
      return '';
    }
  }

  public getDescription = (f: TemplateNode) => {
    const language: string = this.config.defaultLang
    if (!f.inContext)
      return this.getValueOfRecord(f.localizedDescriptions)
    else {
      let rmTag = f.id;
      if (f.id === 'time') {

        const parent: TemplateNode = findParentNodeId(f);
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

  private walkChoiceHeader(f: TemplateNode) {

    formatChoiceHeader(this,f)
    if (isAnyChoice(f.children.map(child => child.rmType)))
      return

    f.children.forEach((child) => {
      child.parentNode = f
      this.walkChoice(child)
    });
  }


  private walkInstructionActivity(f: TemplateNode) {
    formatInstructionActivity(this, f)
    this.walkChildren(f);
  }
}
