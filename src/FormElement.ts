import { FormInput } from './FormInput';

export interface FormElement {
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
  inputs?: FormInput[];
  inContext?: boolean;
  children: FormElement[];
  parentNode: FormElement;
}


export function findParentNodeId (formElement: FormElement) :FormElement{

  while (formElement !== null && formElement.nodeId === null) {
    formElement = formElement.parentNode;
  }
  return formElement;

}

