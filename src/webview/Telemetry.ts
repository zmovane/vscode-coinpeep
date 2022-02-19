/*
Copyright 2020 Nickbing Lao<giscafer@outlook.com>
All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the author nor the names of contributors may be used to
  endorse or promote products derived from this software without specific prior
  written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import * as vscode from "vscode";
const os = require("os");
const publicIp = require("public-ip");
const Amplitude = require("amplitude");

export class Telemetry {
  amplitude: any;
  userId: string;
  ip: string;
  isTelemetryEnabled: boolean;

  constructor() {
    this.userId = vscode.env.machineId;
    this.isTelemetryEnabled = false;
    this.ip = "";

    this.getSettingFromConfig();
    this.setup();
    vscode.workspace.onDidChangeConfiguration(this.configurationChanged, this);
  }

  async setup() {
    if (!this.isTelemetryEnabled) {
      return;
    }

    if (this.amplitude) {
      return;
    }

    this.amplitude = new Amplitude("d3c2366d3c3e0712bdf2efdb3dd498c2");

    let extension = vscode.extensions.getExtension("giscafer.leek-fund");
    let extensionVersion = extension ? extension.packageJSON.version : "<none>";

    // Store
    this.ip = await publicIp.v4();

    // Amplitude
    this.amplitude.identify({
      user_id: this.userId,
      language: vscode.env.language,
      platform: os.platform(),
      app_version: extensionVersion,
      ip: this.ip,
      user_properties: {
        vscodeSessionId: vscode.env.sessionId,
        vscodeVersion: vscode.version,
      },
    });
  }

  sendEvent(eventName: string, params?: any) {
    if (!this.isTelemetryEnabled) {
      return;
    }

    let data = {
      ...params,
      distinct_id: this.userId,
      ip: this.ip,
    };

    // Amplitude
    this.amplitude.track({
      event_type: eventName,
      event_properties: params,
      user_id: this.userId,
      ip: this.ip,
    });
  }

  configurationChanged(e: vscode.ConfigurationChangeEvent) {
    // vscode.window.showInformationMessage('Updated');
    this.getSettingFromConfig();
  }

  private getSettingFromConfig() {
    let config = vscode.workspace.getConfiguration("telemetry");
    if (config) {
      let enableTelemetry = config.get<boolean>("enableTelemetry");
      this.isTelemetryEnabled = !!enableTelemetry;
    }
    if (this.isTelemetryEnabled) {
      this.setup();
    }
  }
}
