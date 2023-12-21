import fs from "fs";
import { Config } from "./Config";

const defaultConfig: Config = {
  displayTechnicalOccurrences: false,
  hideNodeIds: true,
  skippedAQLPaths: [],
  includedAnnotations: ['comments'],
  hideComments: true,
  excludedRMTags: ['territory','language', 'encoding','subject', 'transition','category','context', 'current_state', 'careflow_step'],
  title: "",
  hideParticipations: true,
  hideAQLPaths: true,
  displayToC: false
};

 export function importConfig(path: string): Config {

   if (fs.existsSync(path)) {
     const rawContent = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
     return JSON.parse(rawContent);
   }
   else
     return defaultConfig;
 }

