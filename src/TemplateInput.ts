import { TemplateList } from './TemplateList';

export interface TemplateInput {
  suffix?: string;
  type: string;
  list?: TemplateList[];
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
