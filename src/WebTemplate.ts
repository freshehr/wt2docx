import { TemplateElement } from './TemplateElement';

export interface WebTemplate {
  templateId: string;
  semVer: string;
  version: string;
  defaultLanguage: string;
  languages: string[];
  tree: TemplateNode;
}
