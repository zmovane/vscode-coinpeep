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
import {
  window,
  ViewColumn,
  WebviewPanel,
  WebviewPanelOptions,
  WebviewOptions,
} from "vscode";
import { Telemetry } from "./Telemetry";

let telemetry: Telemetry | any = null;
module ReusedWebviewPanel {
  const webviewPanelsPool: Map<string, WebviewPanel> = new Map(); // webviewPanel池

  /**
   * 创建webviewPanel
   * @param viewType 唯一标识
   * @param title 标题
   * @param showOptions 显示位置
   * @param options 可选选项
   */
  export function create(
    viewType: string,
    title: string,
    showOptions = ViewColumn.Active,
    options?: WebviewPanelOptions & WebviewOptions
  ) {
    const oldPanel = webviewPanelsPool.get(viewType);

    if (oldPanel) {
      oldPanel.title = title;
      oldPanel.reveal();
      return oldPanel;
    }

    const newPanel = window.createWebviewPanel(
      viewType,
      title,
      showOptions,
      options
    );

    newPanel.onDidDispose(() => webviewPanelsPool.delete(viewType));
    webviewPanelsPool.set(viewType, newPanel);

    console.log("webviewPanelsPool.size:", webviewPanelsPool.size);

    try {
      telemetry.sendEvent(viewType, { title });
    } catch (err) {
      console.error(err);
    }

    return newPanel;
  }

  /**
   * 销毁webviewPanel
   * @param viewType 唯一标识
   */
  export function destroy(viewType: string) {
    const target = webviewPanelsPool.get(viewType);

    if (target) {
      webviewPanelsPool.delete(viewType);
      // createWebviewPanel是异步的，setTimeout避免创建未完成时调用dispose报错
      setTimeout(() => target.dispose(), 0);
    }
  }
}

export default ReusedWebviewPanel;
