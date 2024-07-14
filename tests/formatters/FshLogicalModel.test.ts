import { fshl } from '../../src/formatters/FshLogicalModelFormatter'
import { DocBuilder } from '../../src/DocBuilder';
import fs from 'fs';
import { Config, importConfig } from '../../src/BuilderConfig';
import { TemplateNode } from '../../src/TemplateNodes';
import { StringBuilder } from '../../src/StringBuilder';

let builder: DocBuilder;
let testBuilder: StringBuilder
beforeAll(() => {
  // This will run once before all tests.
  const config:Config = importConfig('')
  const inDoc:string = fs.readFileSync('tests/resources/wt.json', { encoding: 'utf8', flag: 'r' });
  builder  = new DocBuilder(JSON.parse(inDoc), config);
  testBuilder = new StringBuilder();
});

describe('fsh Logical test', () => {
  test('should  create FSH-LM template header', () => {

    testBuilder.clear()
    testBuilder.append('Logical: test_-_complete_template')
    testBuilder.append('Title: TEST - Complete template')

    const expectedOutput = testBuilder.toString()

    const template: string = `{
          "templateId" : "TEST - Complete template",
          "semVer" : "1.0.0",
          "version" : "2.3",
          "defaultLanguage" : "en",
          "languages" : [ "en" ],}
          `

      fshl.formatTemplateHeader(builder);

    expect(builder.sb.toString()).toEqual(expectedOutput);
  });

  test('should  create FSH-LM Composition header', () => {

    testBuilder.clear()
    testBuilder.append('Description:  "Interaction, contact or care event between a subject of care and healthcare provider(s)."')
    testBuilder.append('  * ^name = complete_template')
    testBuilder.append('  * ^status = #active')

    const expectedOutput = testBuilder.toString()

    const composition: string = `{
        "id": "complete_template",
        "name": "Complete template",
        "localizedName": "Complete template",
        "rmType": "COMPOSITION",
        "nodeId": "openEHR-EHR-COMPOSITION.encounter.v1",
        "min": 1,
        "max": 1,
        "localizedNames": {
          "en": "TEST - Complete template"
        },
        "localizedDescriptions": {
          "en": "Interaction, contact or care event between a subject of care and healthcare provider(s)."
        },
        "aqlPath": ""
      }`

    fshl.formatCompositionHeader(builder,JSON.parse(composition));

    expect(builder.sb.toString()).toEqual(expectedOutput);
  });

  test('should  create FSH-LM Node', () => {

    testBuilder.clear()
    testBuilder.append('* device_name 1..1 CodeableConcept "Device name" "Identification of the medical device, preferably by a common name, a formal fully descriptive name or, if required, by class or category of device."')

    const expectedOutput = testBuilder.toString()

    const codeableConceptNode: string = `{ 
             "id" : "device_name",
             "name" : "Device name",
            "localizedName" : "Device name",
            "rmType" : "DV_TEXT",
            "nodeId" : "at0001",
            "min" : 1,
            "max" : 1,
            "localizedNames" : {
              "en" : "Device name"
            },
            "localizedDescriptions" : {
              "en" : "Identification of the medical device, preferably by a common name, a formal fully descriptive name or, if required, by class or category of device."
            },
            "annotations" : {
              "comment" : "This data element will capture the term, phrase or category used in clinical practice. "
            },
            "aqlPath" : "/content[openEHR-EHR-SECTION.adhoc.v1,'Observations']/items[openEHR-EHR-OBSERVATION.blood_pressure.v2]/protocol[at0011]/items[openEHR-EHR-CLUSTER.device.v1]/items[at0001]/value",
            "inputs" : [ {
              "type" : "TEXT"
            } ]
          }`

    fshl.formatNodeContent(builder,JSON.parse(codeableConceptNode),false);

    expect(builder.sb.toString()).toEqual(expectedOutput);
  });
});
