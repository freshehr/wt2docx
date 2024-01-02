import { InputItem } from './InputItem';

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
