import { TemplateNode } from '../TemplateNodes';
import { fetchADArchetype } from './openEProvenance';
import { DocBuilder } from '../DocBuilder';
import path from 'path';
import fs from 'fs';
import { Config, WtxRegenerate } from '../BuilderConfig';

export type ResolvedTemplateFiles = {
  wtxOutPath: string
  templateInPath: string
}

export const resolveTemplateFiles = (config: Config): ResolvedTemplateFiles => {
   const {inFilePath , regenerateWtx } = config

   const extension: string  = path.extname(inFilePath);
   const inFileRoot: string = path.basename(inFilePath,extension)
   const pathTo: string = path.dirname(inFilePath)
   const wtxPath:string = path.join(pathTo,inFileRoot)+'.wtx.json'

  if (regenerateWtx === WtxRegenerate.never) return {
    wtxOutPath: null,
    templateInPath: inFilePath
  }

  if (regenerateWtx === WtxRegenerate.always) return {
    wtxOutPath: wtxPath,
    templateInPath: inFilePath
  }

  const regenWtx  = !fs.existsSync(wtxPath) ||  (fs.statSync(wtxPath).mtime < fs.statSync(inFilePath).mtime)

  return {
    wtxOutPath: regenWtx? wtxPath: null,
    templateInPath: inFilePath
  }

 }

 export const augmentWebTemplate = async (docBuilder: DocBuilder,f: TemplateNode)=>  {

  const {config} = docBuilder

  await fetchADArchetype(f.nodeId,config.ADUsername, config.ADPassword, config.ADRepositoryId)
    .then((data) => {

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

}

export const saveWtxFile = async (dBuilder: DocBuilder) => {

  const outFile = dBuilder.resolvedTemplateFiles.wtxOutPath
  const wtString: string = JSON.stringify(dBuilder.wt, (key, value) => key==='parentNode' ? undefined : value)

  fs.writeFileSync(outFile, wtString);
  console.log(`\n Exported : ${outFile}`)
}



