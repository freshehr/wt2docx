import { TemplateNode } from './TemplateNodes';

export interface WebTemplate {
  templateId: string;
  semVer: string;
  version: string;
  defaultLanguage: string;
  languages: string[];
  tree: TemplateNode;
}
