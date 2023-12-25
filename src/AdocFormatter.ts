import { DocBuilder } from "./DocBuilder";
import fs from "fs";

export const adoc = {

     formatHeader: (dBuilder : DocBuilder): void => {

        dBuilder.sb.append(`== Template: ${dBuilder.config.title ? dBuilder.config.title : dBuilder.wt.tree.name}`)

        if (dBuilder.config.displayToC) dBuilder.sb.append(":toc: left");

        dBuilder.sb.newline()
        dBuilder.sb.append(`Template Id: **${dBuilder.wt.templateId}**`).newline()
        dBuilder.sb.append(`Version: **${dBuilder.wt.semVer}**`).newline()
        dBuilder.sb.append(`Created: **${new Date().toDateString()}**`).newline()
    },

    saveFile: (dBuilder: DocBuilder, outFile: string): void =>{
        fs.writeFileSync(outFile, dBuilder.toString());
    }

}
