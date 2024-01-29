
import { TemplateInput } from "./TemplateInput";

export interface WebTemplateNode {
  id: string;
  name: string;
  localizedName: string;
  rmType: string;
  rmTypeText: string
  nodeId: string;
  min: number;
  max: number;
  localizedNames: Record<string, string>;
  localizedDescriptions: Record<string, string>;
  annotations?:  Record<string, string> ;
  aqlPath: string;
  inputs?: TemplateInput[];
  inContext?: boolean;
  children: TemplateNode[];
}

export interface TemplateElement extends WebTemplateNode{
  parentNode: TemplateElement;
  // Extensions to formal webTemplate
  originalNamespace?: string;
  originalPublisher?: string;
  custodianNamespace?: string;
  custodianOrganisation?: string;
}


export function findParentNodeId (formElement: TemplateNode) :TemplateNode{

  let currentElement: TemplateNode = formElement

  while (currentElement !== null && currentElement.nodeId === null) {
    currentElement = currentElement.parentNode
  }
  return currentElement?.parentNode
}

