import { FormList } from './FormList';

export interface TemplateInput {
  suffix?: string;
  type: string;
  list?: FormList[];
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
