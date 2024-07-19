export function extractTextInBrackets(input: string): string[] {
  // The regular expression matches text within square brackets.
  const regex = /\[(.*?)]/g;
  let match;
  const matches: string[] = [];

  // tslint:disable-next-line:no-conditional-assignment
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}


