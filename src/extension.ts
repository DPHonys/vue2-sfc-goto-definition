import { ExtensionContext, workspace } from "vscode";
import { vue2SfcGotoDefinitionProvider } from "./definitionProvider";
import { configurationKeys, isEnabled } from "./configuration";

function enableDefinitionProvider(context: ExtensionContext) {
  context.subscriptions.push(vue2SfcGotoDefinitionProvider());
}

function disableDefinitionProvider(context: ExtensionContext) {
  context.subscriptions.forEach((subscription) => {
    subscription.dispose();
  });
  context.subscriptions.splice(0, context.subscriptions.length);
}

export function activate(context: ExtensionContext) {
  if (isEnabled()) {
    enableDefinitionProvider(context);
  }

  // Watch for configuration changes
  workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration(configurationKeys.ENABLE)) {
      if (isEnabled()) {
        enableDefinitionProvider(context);
      } else {
        disableDefinitionProvider(context);
      }
    } 
  });
}

export function deactivate() {}
