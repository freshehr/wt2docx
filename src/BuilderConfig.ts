import fs from 'fs';
import { ExportFormat } from './formatters/DocFormatter';

export enum WtxRegenerate  {
  always = 'always',
  never = 'never',
  whenStale = 'whenStale'
}

export type Config = {
  displayTechnicalOccurrences: boolean;
  hideNodeIds: boolean;
  skippedAQLPaths: string[];
  includedAnnotations: string[];
  excludedRMTags: string[];
  title: string;
  hideParticipations: boolean;
  displayAQLPaths: boolean;
  displayToC: boolean;
  hideXmindValues: boolean
  generateWtx: boolean
  ADRepositoryId: string
  ADUsername: string
  ADPassword:string
  inFilePath: string
  outFilePath: string
  outFileDir: string
  inFileDir: string
  exportFormat: ExportFormat
  defaultLang: string
  regenerateWtx: WtxRegenerate
  fhirBaseUrl: string
  entriesOnly: boolean
}


const defaultConfig: Config = {
  displayTechnicalOccurrences: false,
  hideNodeIds: true,
  skippedAQLPaths: [],
  includedAnnotations: [],
  excludedRMTags: ['territory','language', 'encoding','subject', 'transition','category','context', 'current_state', 'careflow_step'],
  title: "",
  hideParticipations: true,
  displayAQLPaths: false,
  displayToC: false,
  hideXmindValues: true,
  generateWtx: false,
  ADRepositoryId: '',
  ADUsername: '',
  ADPassword: '',
  inFilePath: '',
  outFilePath: '',
  outFileDir: './out',
  inFileDir: './templates',
  exportFormat: ExportFormat.adoc,
  defaultLang: 'en',
  regenerateWtx: WtxRegenerate.whenStale,
  fhirBaseUrl: 'http://openehr.org',
  entriesOnly: true,
};

 export function importConfig(path: string): Config {

   if (fs.existsSync(path)) {
     const localConfig = JSON.parse(fs.readFileSync(path, { encoding: 'utf8', flag: 'r' }));
     return { ...defaultConfig, ...localConfig } ;
   }
   else
     return defaultConfig;
 }

