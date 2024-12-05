import fs from "fs";
import { sushiClient } from 'fsh-sushi';
import { DocBuilder } from '../DocBuilder';

export const fsh = {

  saveFile: async (dBuilder: DocBuilder, outFile: any): Promise<void> => {

    fs.writeFileSync(outFile, dBuilder.toString(), { encoding: "utf8" });
    console.log(`\n Exported : ${outFile}`)
    await fsh.convertFSH(dBuilder, outFile)
  },

  convertFSH: async (dBuilder: DocBuilder, outFile: any):Promise<void> => {
    const str = dBuilder.toString()
    let exportFileName: string = '';
    sushiClient.fshToFhir(str, {
        //  dependencies: [{ packageId: "hl7.fhir.us.core", version: "4.0.1" }],
        logLevel: "error",
      })
        .then((results) => {
           results.fhir.forEach((fhirObject) => {
             const fhirType: string = fhirObject.resourceType;
             const fhirId: string = fhirObject.id;
           exportFileName = `${outFile}-${fhirType}-${fhirId}.json`
          fs.writeFileSync(exportFileName, JSON.stringify(fhirObject), { encoding: "utf8" });
          console.log(`\n Exported : ${exportFileName}`)
           })// handle results
        })
        .catch((err) => {
          console.log(`Sushi error: ${err}`)// handle thrown errors
        });
  },

}
