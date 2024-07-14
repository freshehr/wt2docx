
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
  children?: TemplateNode[];
  depth?: number;
}

export interface TemplateNode extends WebTemplateNode{
  parentNode: TemplateNode;
  // Extensions to formal webTemplate
  original_namespace?: string;
  original_publisher?: string;
  custodian_namespace?: string;
  custodian_organisation?: string;
  revision?: string;
  lifecycleState?:string;
  build_id?:string;
}


export interface TemplateInput {
  suffix?: string;
  type: string;
  list?: InputItem[];
  validation?: AmountValidation;
  listOpen?: boolean;
  terminology?: string;
  defaultValue?: any;
}

interface AmountValidation {
  range: {
    "minOp"?: string;
    "min"? : number;
    "maxOp"? : string;
    "max"? : number;
  }
}

export interface InputItem {
  value: string;
  label?: string;
  localizedLabels?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
  ordinal?: number;
  currentStates?: string;
}

export interface TemplateRange {
  minOp: string;
  min: number;
}


interface TemplateValidation {
  range: TemplateRange;
}

export interface TemplateAnnotation {
  comment: string;
}


export function findParentNodeId (formElement: TemplateNode) :TemplateNode{

  let currentElement: TemplateNode = formElement

  while (currentElement !== null && currentElement.nodeId === null) {
    currentElement = currentElement.parentNode
  }
  return currentElement?.parentNode
}

