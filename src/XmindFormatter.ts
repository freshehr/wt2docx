import { DocBuilder } from "./DocBuilder";
import { Topic , Workbook,Marker,Zipper} from "xmind";

export let wb: Workbook;

export const xmind = {

  formatHeader: (dBuilder : DocBuilder): void => {

      wb = new Workbook()

      const topic: Topic = new Topic({sheet: wb.createSheet(dBuilder.wt.templateId, dBuilder.config?.title)});

      topic.add({title: `${dBuilder.wt.templateId} ${dBuilder.wt.semVer} ${new Date().toDateString()}`} );

  },
  saveFile: (dBuilder: DocBuilder, outfile: any): void => {
    const zipper = new Zipper({path: dBuilder.outFileDir, workbook: wb, filename: dBuilder.wt.templateId});

    zipper.save().then(status => status && console.log('Saved /tmp/MyFirstMap.xmind'));
  }
}
