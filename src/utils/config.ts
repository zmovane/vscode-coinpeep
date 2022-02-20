import { workspace } from "vscode";

const extensionName = "coinpeep";
export class Config {
  static get(key: string, defaultValue?: any): any {
    return workspace.getConfiguration(extensionName).get(key) ?? defaultValue;
  }

  static set(key: string, value: Array<any> | string | number | Object) {
    return workspace.getConfiguration(extensionName).update(key, value, true);
  }
}
