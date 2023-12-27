export interface TemplateList {
  value: string;
  label?: string;
  localizedLabels?: Record<string, string>;
  localizedDescriptions?: Record<string, string>;
  ordinal?: number;
  currentStates?: string;
}
