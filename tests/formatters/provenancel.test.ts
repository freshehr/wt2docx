import { DocBuilder } from '../../src/DocBuilder';
import fs from 'fs';
import { Config } from '../../src/Config';
import { importConfig } from '../../src/BuilderConfig';
import { TemplateElement } from '../../src/TemplateElement';
import { updateArchetypeList } from '../../src/provenance/openEProvenance';

let builder: DocBuilder;

beforeAll(() => {
  // This will run once before all tests.
  const config:Config = importConfig('')
  const inDoc:string = fs.readFileSync('tests/resources/wt.json', { encoding: 'utf8', flag: 'r' });
  builder  = new DocBuilder(JSON.parse(inDoc), config, 'adoc', '')

});

describe('Provenance tests', () => {

  test('Should list archetypes used', () => {
    updateArchetypeList('openEHR/CKM-mirror', 'org.openehr', builder.archetypeList,true)
      .then(aList => console.log(aList))
  });

});

