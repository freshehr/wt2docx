export class StringBuilder {
  arr: string[] = [];
  constructor() {
    this.arr = [];
  }

  backTick = (inString: string): string => `\`${inString}\``

  append = (s: string): StringBuilder => {
    this.arr.push(s);
    return this;
  }

  toString = (): string  => this.arr.join('\r\n');

  newline = (s?: string)=>  {
    if (s)
      this.append(s);
    this.append('\n');
    return this;
  }
}
