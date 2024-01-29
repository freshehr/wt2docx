import { fshl } from '../../src/formatters/FshLogicalModelFormatter'
import { DocBuilder } from '../../src/DocBuilder';
import fs from 'fs';
import { Config, importConfig } from '../../src/BuilderConfig';
import { TemplateElement } from '../../src/TemplateNodes';

let builder: DocBuilder;

beforeAll(() => {
  // This will run once before all tests.
  const config:Config = importConfig('')
  const inDoc:string = fs.readFileSync('/test/resources/wt.json', { encoding: 'utf8', flag: 'r' });
  builder  = new DocBuilder(JSON.parse(inDoc), config, 'adoc', '')

});

describe('fsh Logical test', () => {
  test('should  create FSH logical model header', () => {

    const expectedOutput =
      `Logical:  MyLogical 
       Title:    MyLogical
       Description:  "dddd dddd "
         * ^name = MylogicalExtension
         ^status = #active`

    const element:TemplateElement = {
      children: [], inputs: [], parentNode: undefined,
      annotations: undefined,
      aqlPath: '',
      id: '',
      inContext: false,
      localizedDescriptions: undefined,
      localizedName: '',
      localizedNames: undefined,
      max: 0,
      min: 0,
      name: '',
      nodeId: '',
      rmType: 'Composition',
      rmTypeText: 'Composition'
    }
    const result = fshl.formatCompositionHeader(builder,element);

    expect(result).toEqual(expectedOutput);
  });
});
