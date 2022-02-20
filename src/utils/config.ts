import { workspace } from "vscode";

const extensionID = "coinpeep";
export class Config {
  static get(key: string, defaultValue?: any): any {
    return workspace.getConfiguration(extensionID).get(key) ?? defaultValue;
  }

  static set(key: string, value: Array<any> | string | number | Object) {
    return workspace.getConfiguration(extensionID).update(key, value, true);
  }
}
