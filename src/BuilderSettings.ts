import fs from 'fs';

export class BuilderSettings {
  get displayTechnicalOccurrences(): boolean {
    return this._displayTechnicalOccurrences;
  }

  set displayTechnicalOccurrences(value: boolean) {
    this._displayTechnicalOccurrences = value;
  }


  private static instance: BuilderSettings;

  private _hideParticipations : boolean = true;
  private _hideComments : boolean = true;
  private _hideNodeIds : boolean = false
  private _excludedRMTags: string[] = ['territory','language', 'encoding','subject', 'transition','category','context', 'current_state', 'careflow_step'];
  private _skippedAQLPaths: string[] = ["/content[openEHR-EHR-SECTION.adhoc.v1,'PD extensions']"];
  private _includedAnnotations: string[] = ['comments'];
  private _hideAQLPath: boolean = true;
  private _displayTechnicalOccurrences: boolean = false;

  get hideNodeIds(): boolean {
    return this._hideNodeIds;
  }

  set hideNodeIds(value: boolean) {
    this._hideNodeIds = value;
  }

  get skippedAQLPaths(): string[] {
    return this._skippedAQLPaths;
  }

  set skippedAQLPaths(value: string[]) {
    this._skippedAQLPaths = value;
  }
  get includedAnnotations(): string[] {
    return this._includedAnnotations;
  }

  set includedAnnotations(value: string[]) {
    this._includedAnnotations = value;
  }

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


