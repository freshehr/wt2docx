import { FormList } from './FormList';

export interface FormInput {
  suffix?: string;
  type: string;
  list?: FormList[];
  listOpen?: boolean;
  terminology?: string;
  defaultValue?: any;
}
