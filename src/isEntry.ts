export function isEntry(rmType: string) {
  return ['OBSERVATION', 'EVALUATION', 'INSTRUCTION', 'ACTION', 'ADMIN_ENTRY', 'GENERIC_ENTRY'].includes(rmType);
}

export function isEvent(rmType: string) {
  return ['EVENT', 'POINT_EVENT', 'INTERVAL_EVENT'].includes(rmType);
}
export function isSection(rmType: string) {
  return ['SECTION'].includes(rmType);
}

export function isDataValue(rmType: string) {
  return [
    'DV_CODED_TEXT',
    'DV_TEXT',
    'DV_DATE',
    'DV_DATE_TIME',
    'DV_TIME',
    'DV_ORDINAL',
    'DV_SCALE',
    'DV_COUNT',
    'DV_DURATION',
    'DV_URI',
    'DV_QUANTITY',
    'DV_BOOLEAN',
    'DV_IDENTIFIER',
    'DV_PROPORTION',
    'DV_EHR_URI',
    'DV_MULTIMEDIA',
    'DV_PARSABLE',
    'DV_STATE'
  ].includes(rmType);
}
