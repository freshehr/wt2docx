import { FormElement } from './FormElement';

export interface WebTemplate {
  templateId: string;
  semVer: string;
  version: string;
  defaultLanguage: string;
  languages: string[];
  tree: FormElement;
}
