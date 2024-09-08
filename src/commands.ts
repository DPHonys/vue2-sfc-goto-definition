import { window, workspace, ConfigurationTarget } from "vscode"

type Command = [string, () => void]

const ConfigurationTargetStrings = {
  [ConfigurationTarget.Global]: "Global",
  [ConfigurationTarget.Workspace]: "Workspace",
  [ConfigurationTarget.WorkspaceFolder]: "Workspace Folder"
}

const Commands = {
  [ConfigurationTarget.Global]: "global",
  [ConfigurationTarget.Workspace]: "workspace",
  [ConfigurationTarget.WorkspaceFolder]: "workspaceFolder"
}

export function setGoto(target: ConfigurationTarget): Command | undefined {
  if (!Commands[target]) {
    return undefined
  }

  return [
    `vue2SfcGotoDefinition.${Commands[target]}`,
    () => {
      const config = workspace.getConfiguration("editor")
      config.update("gotoLocation.multipleDefinitions", "goto", target).then(
        () => {
          window.showInformationMessage(
            `Set 'goto' on multiple definitions in ${ConfigurationTargetStrings[target]} settings`
          )
        },
        (e) => {
          window.showErrorMessage(
            `Failed to set 'goto' on multiple definitions in ${ConfigurationTargetStrings[target]} settings : ${e}`
          )
        }
      )
    }
  ]
}
