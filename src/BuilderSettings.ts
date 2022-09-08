import fs from 'fs';

export class BuilderSettings {

  get hideComments(): boolean {
    return this._hideComments;
  }

  set hideComments(value: boolean) {
    this._hideComments = value;
  }
  get excludedRMTags(): string[] {
    return this._excludedRMTags;
  }

  set excludedRMTags(value: string[]) {
    this._excludedRMTags = value;
  }

  private _hideParticipations : boolean = true;

  private _hideComments : boolean = true;

  private _excludedRMTags: string[] = ['territory','language', 'encoding','subject', 'transition','category','context', 'current_state', 'careflow_step'];

  private static instance: BuilderSettings;

  constructor() {
    if (BuilderSettings.instance)
      return BuilderSettings.instance;
    BuilderSettings.instance = this;
  }

  public static getInstance(): BuilderSettings {
    if (!BuilderSettings.instance) {
      BuilderSettings.instance = new BuilderSettings();
    }

    return BuilderSettings.instance;
  }

  get hideParticipations(): boolean {
    return this._hideParticipations;
  }

  set hideParticipations(value: boolean) {
    this._hideParticipations = value;
  }

  public importConfig (settingsFile: string) {

    const settingsFileExist = fs.existsSync(settingsFile);

    if (settingsFileExist) {
      const settingsData = fs.readFileSync(settingsFile, { encoding: 'utf8', flag: 'r' });
      [this._hideParticipations] = JSON.parse(settingsData);
    }
  }

}


