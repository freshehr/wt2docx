
import { TemplateInput } from "./TemplateInput";

export interface TemplateElement {
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
  children: TemplateElement[];
  parentNode: TemplateElement;
}

export interface TemplateXNode {

}

export function findParentNodeId (formElement: TemplateElement) :TemplateElement{

  let currentElement: TemplateElement = formElement

  while (currentElement !== null && currentElement.nodeId === null) {
    currentElement = currentElement.parentNode
  }
  return currentElement?.parentNode
}

