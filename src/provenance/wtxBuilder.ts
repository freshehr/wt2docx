import { TemplateNode } from '../TemplateNodes';
import { fetchADArchetype } from './openEProvenance';
import { DocBuilder } from '../DocBuilder';
import path from 'path';
import fs from 'fs';
import { Config, WtxRegenerate } from '../BuilderConfig';

const resolveWtSource = (config: Config) => {
   const {inFilePath , regenerateWtx } = config

   const extension: string  = path.extname(inFilePath);
   const inFileRoot: string = path.basename(inFilePath,extension)
   const pathTo: string = path.dirname(inFilePath)
   const wtxPath = path.join(pathTo,inFileRoot,'wtx.json')

   if (extension === 'json') {
     checkIfRegenerateWtx(regenerateWtx, inFilePath, wtxPath)
   }
 }


 const checkIfRegenerateWtx = (wtxRegen: WtxRegenerate, wtPath, wtxPath : string): boolean =>{

   // check the infilePath to see if a matching .xtx.json file exists and has a more recent date, in which case return true and use that

   if (!fs.existsSync(wtxPath) || wtxRegen === WtxRegenerate.always) return true

   if (wtxRegen === WtxRegenerate.never) return false

    const wtxStats = fs.statSync(wtxPath)
    const wtStats = fs.statSync(wtPath)

   return wtxStats.mtime < wtStats.mtime

 }

 export const augmentWebTemplate = async (docBuilder: DocBuilder,f: TemplateNode)=>  {

  const {config} = docBuilder

  await fetchADArchetype(f.nodeId,config.ADUsername, config.ADPassword, config.ADRepositoryId)
    .then(data => {

      f.lifecycleState = data?.description?.lifecycleState.codeString

      if(typeof data?.description?.otherDetails === 'object') {
        const {
          original_publisher,
          original_namespace,
          custodian_namespace,
          custodian_organisation,
          revision
        } = data.description.otherDetails;
        f.original_namespace = original_namespace;
        f.original_publisher = original_publisher;
        f.custodian_namespace = custodian_namespace;
        f.custodian_organisation = custodian_organisation
        f.revision = revision
      }
    //  console.log('F Augmented ', f.original_namespace)

    })
    .catch((error) => {
      console.error("Error:", error)
    } )
}


