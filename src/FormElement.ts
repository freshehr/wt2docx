import { FormInput } from './FormInput';
import { FormAnnotation } from './FormAnnotation';

export interface FormElement {
  id: string;
  name: string;
  localizedName: string;
  rmType: string;
  nodeId: string;
  min: number;
  max: number;
  localizedNames: Record<string, string>;
  localizedDescriptions: Record<string, string>;
  annotations?: FormAnnotation;
  aqlPath: string;
  inputs?: FormInput[];
  inContext?: boolean;
  children: FormElement[];
}
