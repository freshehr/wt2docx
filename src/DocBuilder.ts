import { findParentNodeId, TemplateNode } from './TemplateNodes';
import { WebTemplate } from "./WebTemplate";
import {
  isActivity,
  isAnyChoice, isArchetype, isCluster, isComposition,
  isDataValue,
  isEntry,
  isEvent, isEventContext,
  isSection,
} from './TemplateTypes';
import { StringBuilder } from "./StringBuilder";
import rmDescriptions from "../resources/rm_descriptions.json";
import {
  formatChoiceHeader,
  formatCluster, formatCompositionContextHeader,
  formatCompositionHeader, formatEntryHeader, formatInstructionActivity,
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
  getProvenance,
  updateArchetypeLists,
} from './provenance/openEProvenance';
import { Config } from './BuilderConfig';
import path from 'path';
import { augmentWebTemplate, ResolvedTemplateFiles, resolveTemplateFiles, saveWtxFile } from './provenance/wtxBuilder';
import axios from 'axios';


export class DocBuilder {

  sb: StringBuilder = new StringBuilder();
  config: Config;
  localArchetypeList : ArchetypeList = [];
  candidateArchetypeList: ArchetypeList = []
  remoteArchetypeList: ArchetypeList = [];
  resolvedTemplateFiles: ResolvedTemplateFiles;

  readonly _wt: WebTemplate;

  constructor (wt: WebTemplate, config: Config) {
    this._wt = wt;
    this.config = config;
    this.config.defaultLang = wt.defaultLanguage;
    this.generate().then( () => {

      const outFilePath = this.handleOutPath(this.config.inFilePath, this.config.outFilePath, this.config.exportFormat,this.config.outFileDir);
      saveFile(this, outFilePath).catch();

      if (this.regenWtx() && this.isWtxAugmented() )
        saveWtxFile(this).catch()
    });
  }

  private regenWtx(): boolean {
    return (this.resolvedTemplateFiles.wtxOutPath !== null)
  }

// If the archetypeLists are empty, then the wtx Augmentation process has failed
  private isWtxAugmented(): boolean {
    const archetypesAdded = this.localArchetypeList.length + this .candidateArchetypeList.length + this.remoteArchetypeList.length
    return (archetypesAdded > 0)
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
    this.resolvedTemplateFiles = resolveTemplateFiles(this.config)
    // console.log('resolvedTemplateFiles', this.resolvedTemplateFiles)
    formatTemplateHeader(this)
    await this.walk(this._wt.tree);
    formatProvenanceTable(this)
  }

  private async walkChildren(f: TemplateNode, useSameDepth :boolean, nonContextOnly: boolean = false, ) {
    if (f.children) {

      const newDepth = useSameDepth?f.depth:f.depth+1

      for( const child of f.children) {
        child.parentNode = f;
        child.depth = newDepth;
        if (!nonContextOnly || (nonContextOnly && !child.inContext)) {
          await this.walk(child)
        }
      }
    }
  }

  private async walkNonRMChildren(f: TemplateNode, useSameDepth: boolean) {
    await this.walkChildren(f, useSameDepth, true)
  }
  private async walkCompositionContent(f: TemplateNode) {
    await this.walkChildren(f, true,true)
  }

  private async walk(f: TemplateNode) {

    if (isArchetype(f.rmType,f.nodeId) && this.regenWtx() ) {
      // Only Update the lists if the augment operation has been successful
      await this.augmentArchetypeMetadata(f);
    }
    if (isComposition(f.rmType))
      await this.walkComposition(f)
    else if (isEventContext(f.rmType))
      await this.walkCompositionContext(f)
    else if (isSection(f.rmType))
      await this.walkSection(f)
    else if (isEntry(f.rmType))
      await this.walkEntry(f)
    else if (isEvent(f.rmType))
      await this.walkObservationEvent(f)
    else if (isActivity(f.rmType))
      await this.walkInstructionActivity(f)
    else if (isCluster(f.rmType))
      await this.walkCluster(f)
    else if (isDataValue(f.rmType))
      this.walkElement(f)
    else {
      switch (f.rmType) {
        case 'CODE_PHRASE':
          f.name = f.id;
          this.walkElement(f);
          break;
        case 'PARTY_PROXY':
          f.name = f.id;
          this.walkElement(f);
          break;
        default:
          await this.walkUnsupported(f)
          break;
      }
    }
  }

  private async augmentArchetypeMetadata(f: TemplateNode) {
    await augmentWebTemplate(this, f)
      .then(() => updateArchetypeLists(this.remoteArchetypeList, this.candidateArchetypeList, this.localArchetypeList, getProvenance(f)))
      .catch(error => {
        if (axios.isAxiosError(error)) {
          switch (error.response.status) {
            case 403:
              console.log(`error: ${error.message}
                      Could not read archetype details: Check your Archetype Designer credentials and Repository Id`);
              break;
            default:
              console.log('error message: ', error.message);
          }
        } else
          console.log('unexpected error: ', error.message);
      });
  }

  private async walkUnsupported(f: TemplateNode) {
    formatUnsupported(this,f);
  }

  private async walkCluster(f: TemplateNode) {
    formatCluster(this, f)
    await this.walkChildren(f,false,false);
  }

  private async walkObservationEvent(f: TemplateNode) {
    formatObservationEvent(this, f)
    await this.walkChildren(f,false,false);
  }

  private async walkComposition(f: TemplateNode) {
    f.depth = 0;
    formatCompositionHeader(this, f)

    if (!this.config.entriesOnly) {
      formatNodeHeader(this);
      await this.walkRmChildren(f,true);
      formatNodeFooter(this,f);
   }
    f.depth = 0;
    await this.walkCompositionContent(f)
  }

  private walkElement(f: TemplateNode) {
    formatNodeContent(this, f, false)
    this.walkDataType(f)
 //   formatAnnotations(this,f);
  }

  private walkChoice(f: TemplateNode) {
    formatNodeContent(this, f, true)
    this.walkDataType(f)
 //   formatAnnotations(this,f);
  }

  private async walkSection(f: TemplateNode) {
    if (!this.config?.skippedAQLPaths?.includes(f.aqlPath) && (!this.config.entriesOnly)){
 //     this.archetypeList.push(f.nodeId)
      formatLeafHeader(this, f)
    }
    await this.walkChildren(f,false,false)
  }

  private async walkEntry(f: TemplateNode) {
//    this.archetypeList.push(f.nodeId)
    formatEntryHeader(this, f)
    formatNodeHeader(this)
    await this.walkRmChildren(f,true);
    await this.walkNonRMChildren(f,true)
    formatNodeFooter(this,f)
  }

  private async walkCompositionContext(f: TemplateNode) {

    if (this.config.entriesOnly) return

      f.name = 'context';
    f.depth = 0;
    formatCompositionContextHeader(this, f);
    if (f.children?.length > 0) {
      formatNodeHeader(this)
      await this.walkRmChildren(f,false);
      await this.walkNonRMChildren(f, false)
      formatNodeFooter(this,f)
    }
    f.depth = 0;
  }

  private async walkRmChildren(f: TemplateNode, useSameDepth: boolean) {

    const rmAttributes = new Array<TemplateNode>();
    const newDepth = useSameDepth?f.depth:f.depth+1

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
      child.localizedName = child.id
      child.depth = newDepth
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
    const language: string = 'en'
    if ((!f.inContext ) && (f.id !== 'context'))
      return this.getValueOfRecord(f.localizedDescriptions)
    else {
      let rmTag = f.id;
      if (f.id === 'time') {

        const parent: TemplateNode = findParentNodeId(f);
        switch (parent.rmType) {
          case 'ACTION':
            rmTag = 'action_time'
            break;
          case 'EVENT':
          case 'OBSERVATION':
            rmTag = 'event_time'
            break
          default:
            break;
        }
      }
      return rmDescriptions[rmTag] ? rmDescriptions[rmTag][language] : ''

    }

  }

  private walkChoiceHeader(f: TemplateNode) {

    formatChoiceHeader(this,f)
    if (isAnyChoice(f.children.map(child => child.rmType)))
      return

    f.children.forEach((child) => {
      child.parentNode = f
      this.walkChoice(child)
    });
  }


  private async walkInstructionActivity(f: TemplateNode) {
    formatInstructionActivity(this, f)
    await this.walkChildren(f,false,false);
  }
}
