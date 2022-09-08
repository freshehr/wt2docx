import { FormElement } from './FormElement';
import { WebTemplate } from './WebTemplate';
import { isEntry, isEvent, isDataValue, isSection } from './isEntry';
import { StringBuilder } from './StringBuilder';
import { FormInput } from './FormInput';
import { BuilderSettings } from './BuilderSettings';

export class DocBuilder {
  sb: StringBuilder = new StringBuilder();
  defaultLang: string = 'en';
  config: BuilderSettings;

  constructor(private wt: WebTemplate) {
    this.defaultLang = wt.defaultLanguage;
    this.config = BuilderSettings.getInstance()
    this.generate();
  }

  public toString(): string {
    return this.sb.toString();
  }

  private generate() {

    const f = this.wt.tree;

    this.sb.append(`= ${this.wt.templateId}`).newline();
    this.sb.append(`== *${f.name}*`).newline()
    this.sb.append(`=== \`${f.rmType}: _${f.nodeId}_\``).newline();

    this.walk(this.wt.tree);
  }


  private walkChildren(f: FormElement) {
    if (f.children) {
      f.children.forEach((child) => {
        this.walk(child);
      });
    }
  }

  private walkNonContextChildren(f: FormElement) {
    if (f.children) {
      f.children.forEach((child) => {
        if (!child.inContext) {this.walk(child)}
      });
    }
  }

  private walk(f: FormElement) {
    if (f.aqlPath === '/category') {
      this.walkElement(f);
    } else if (isEntry(f.rmType)) {
      this.walkEntry(f);
    } else if (isDataValue(f.rmType)) {
      this.walkElement(f);
    } else if (isSection(f.rmType)) {
      this.walkSection(f);
    } else if (f.rmType === 'CLUSTER') {
      this.sb.append(`5+a|=== ${f.name}*` + '\n'  + `\`${f.rmType}: _${f.nodeId}_\``);
      this.walkChildren(f);
    } else if (isEvent(f.rmType)) {
//      this.sb.append(`5+a|*${f.name}* +\n \`${f.rmType}: _${f.nodeId}_\``);
      this.walkEntry(f);
    } else if (f.rmType === 'ELEMENT') {
      this.walkElement(f);
    } else {
      switch (f.rmType) {
        case 'COMPOSITION':
          this.walkRmAttributes(f)
          this.walkNonContextChildren(f);
          break;
  //      case 'ISM_TRANSITION':
  //        this.walkChildren(f)
  //        break;
  //      case 'EVENT_CONTEXT':
  //        f.name = 'context';
  //        this.walkEntry(f);
  //        break;
        case 'CODE_PHRASE':
          f.name = f.id;
          this.walkElement(f);
          break;
        case 'PARTY_PROXY':
          f.name = f.id;
          this.walkElement(f);
          break;

        default:
          this.sb.append('// Not supported rmType ' + f.rmType);

          break;
      }
    }
  }

  private walkSection(f: FormElement) {
    this.sb.append(`== ${f.name}`);
    if (f.children) {
      f.children.forEach((child) => {
        this.walk(child);
      });
    }
  }
  private walkEntry(f: FormElement) {
    const nodeId = f.nodeId?f.nodeId:`\`RM:${f.id}\``

    this.sb.append(`== ${f.name}`);
    this.sb.append(`=== \`${f.rmType}: _${nodeId}_\``);

//    this.walkRmAttributes(f);

    if (f.children) {
      this.addNodeHeader('Archetype nodes');

      f.children.forEach((child) => {

        if (!child.inContext) {
          this.walk(child)
        }
      });



    }



  }

  private addNodeHeader(headerText: string) {
    this.sb.append(`==== ${headerText}`);
    this.sb.append('[options="header", cols="15,10,10,10"]');
    this.sb.append('|====');
    this.sb.append('|Name | Type/Cardin. | NodeId | Details');
  }

  private walkRmAttributes(f: FormElement) {

    const rmAttributes = new Array<FormElement>();

    if (f.children) {

      f.children.forEach((child) => {

        if (['ism_transition','context'].includes(child.id) && child.children) {
              child.children.forEach((ismChild) => {
              const ismExcluded = this.config.excludedRMTags.includes(ismChild.id)
              if (ismChild?.inContext && !ismExcluded) {
                rmAttributes.push(ismChild);
              }
            })
        }
        else {
         const excluded = this.config.excludedRMTags.includes(child.id)
         if (child?.inContext && !excluded) {
           rmAttributes.push(child);
         }
        }
      });

    }

    if (rmAttributes.length === 0) return

    this.addNodeHeader('RM attributes');

     rmAttributes.forEach(child => {
      child.localizedName = child.id;
      this.walk(child);
    });

     this.sb.append('|====');

    this.walkParticipations();

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

  private walkElement(f: FormElement) {


    const max = f.max < 0 ? '*' : `${f.max}`;

    if (f.rmType === 'ELEMENT')
    {
      this.sb.append(`|SubType + \n \`  ${f.name}  ${f.rmType} | |${f.id}\`| ${f.min}..${max} | ${this.getValueOfRecord(f.localizedDescriptions)}`);
      this.walkChildren(f);
      return
    }

    const nodeId = f.nodeId?f.nodeId:`RM:`;
    const nodeText = `${nodeId} +\n \`${f.id}\``

    const rmTypeText = `${this.mapRmTypeText(f.rmType)}  +\n  \`${f.min}..${max}\``;
    this.sb.append(`| ${f.localizedName} |  ${rmTypeText} |  ${nodeText} `);

    if (f.name === undefined){this.sb.append(`// ${f.id} -  ${f.aqlPath}`);}

    switch (f.rmType) {
      case 'ELEMENT':
        break;
      case 'DV_CODED_TEXT':
        this.walkDvCodedText(f);
        break;
      case 'DV_TEXT':
        this.walkDvText(f);
        break;
      case 'DV_ORDINAL':
        this.walkDvOrdinal(f);
        break;
      case 'DV_SCALE':
        this.walkDvOrdinal(f);
        break;

      default:
        if (isDataValue(f.rmType))  {
          this.walkDvDefault(f)
        }
        else  {
          this.sb.append('|Unsupported RM type: ' + f.rmType);
        }
    }
    this.walkAnnotations(f);


  }

  private walkAnnotations(f: FormElement) {
    if (f.annotations) {

      this.sb.append(``);
      for (const key in f.annotations) {
        if (f.annotations.hasOwnProperty(key))
        {
          if (key !== 'comment' || !this.config.hideComments)
            this.sb.newline().append(`*${key}*: ${f.annotations[key]}`);
        }
      }
    }
  }




  private walkDvOrdinal(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs) {
      const fi: FormInput[] = f.inputs;
      // const term = fi.terminology == undefined ? "local" : fi.terminology;
      fi.forEach((item) => {
        const formItems = item.list === undefined ? [] : item.list;
        formItems.forEach((n) => {
          this.sb.append(`* ${n.ordinal} - ${n.label} ${this.getValueOfRecord(n.localizedDescriptions)}`);
        });
      });
    }
  }

  private getValueOfRecord(record?: Record<string, string>): string {
    if (record) {
      return record[this.defaultLang];
    } else {
      return '';
    }
  }

  private appendDescription(f : FormElement){
    const description = this.getValueOfRecord(f.localizedDescriptions)
    if (description)
       this.sb.newline().append(`*Description*: ${description}`);
  }


private walkDvDefault(f : FormElement) {
  this.sb.append('|');
  this.appendDescription(f)
}
  private walkDvText(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs.length >0 ) {
      this.sb.append(`**Allowed text**`)
      this.sb.append('')
      f.inputs.forEach((item) => {
        if (item.list) {
          item.list.forEach((val) => {
            this.sb.append(`* ${val.value}`);
          });
        }
        else
          this.sb.append('Any text')

        if (item.listOpen)
          this.sb.append( `* _Other text allowed_`);

      });
      this.appendDescription(f);
    }
  }

  private walkDvCodedText(f: FormElement) {
    this.sb.append('a|');
    if (f.inputs) {
      f.inputs.forEach((item) => {
        const term = item.terminology === undefined ? 'local' : item.terminology;
        if (item.list) {
          this.sb.append(`**Allowed Coded terms**`)
          this.sb.append('')
          item.list.forEach((list) => {
            if (term === 'local') {
              this.sb.append(`* ${list.value} -> ${list.label} `);
            } else {
              this.sb.append(`* ${list.label} (${term}: ${list.value})`);
            }
          });
          if (item.listOpen)
            this.sb.append( `* _Other text allowed_`);
          this.appendDescription(f);
        }
      });
    }
  }

  private mapRmTypeText(rmType: string) {
    switch (rmType) {
      case 'ELEMENT':
        break
      case 'DV_CODED_TEXT':
        return 'Coded text';
      case 'DV_TEXT':
        return 'Text';
      case 'DV_ORDINAL':
        return 'Ordinal';
      case 'DV_SCALE':
        return 'Scale';
      case 'DV_QUANTITY':
        return 'Quantity';
      case 'DV_COUNT':
        return 'Integer';
      case 'DV_DATE_TIME':
        return 'Date/time';
      case 'DV_IDENTIFIER':
        return 'Identifier';

      default:
        if (isDataValue(rmType)) {
          return rmType
        } else {
          this.sb.append('|Unsupported RM type: ' + rmType);
        }
    }
  }
}
