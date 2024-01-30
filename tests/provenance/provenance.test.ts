import { DocBuilder } from '../../src/DocBuilder';
import fs from 'fs';
import { Config, importConfig } from '../../src/BuilderConfig';
import { fetchADArchetype, updateArchetypeList } from '../../src/provenance/openEProvenance';

let builder: DocBuilder;

beforeAll(() => {
  // This will run once before all tests.
  const config:Config = importConfig('')
  const inDoc:string = fs.readFileSync('tests/resources/wt.json', { encoding: 'utf8', flag: 'r' });
  builder  = new DocBuilder(JSON.parse(inDoc), config, 'adoc', '')

});

describe('Provenance  tests', () => {

  test('Should list CKM archetypes used', () => {
    updateArchetypeList('openEHR','CKM-mirror', 'org.openehr', builder.archetypeList,true)
      .then(aList => console.log(aList))
      .catch((error) => {
        console.error("Error:", error)
      } )
  });

  test('Should fetch archetype original namespace', async() => {
    await fetchADArchetype('openEHR-EHR-ADMIN_ENTRY.visual_certification_uk.v0', builder.config.ADUsername, builder.config.ADPassword, builder.config.ADRepositoryId,)
      .then(data => {
       expect(data.description.otherDetails.original_namespace). toBe('uk-com.freshehr')
      })
      .catch((error) => {
        console.error("Error:", error)
      } )
  });


});

