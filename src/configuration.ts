import { workspace } from "vscode"

const configurationSection = "vue2SfcGotoDefinition"

export enum ConfigurationKeys {
  ENABLE = "enable",
  ALIAS = "alias",
  LOCATION = "location"
}

export enum ConfigurationFullKeys {
  ENABLE = configurationSection + "." + ConfigurationKeys.ENABLE,
  ALIAS = configurationSection + "." + ConfigurationKeys.ALIAS,
  LOCATION = configurationSection + "." + ConfigurationKeys.LOCATION
}

export enum LocationOptions {
  NAME = "name",
  EXPORT_DEFAULT = "export default",
  TEMPLATE = "template"
}

export const LocationTextStartLines: Record<LocationOptions, string> = {
  [LocationOptions.NAME]: "export default",
  [LocationOptions.EXPORT_DEFAULT]: "<script>",
  [LocationOptions.TEMPLATE]: ""
}

export enum AliasOptions {
  "@" = "@",
  "~" = "~"
}

function getConfiguration() {
  return workspace.getConfiguration(configurationSection)
}

export const config = {
  isEnabled: () =>
    getConfiguration().get<boolean>(ConfigurationKeys.ENABLE, true),
  getAlias: () =>
    getConfiguration().get<AliasOptions>(
      ConfigurationKeys.ALIAS,
      AliasOptions["@"]
    ),
  getLocation: () =>
    getConfiguration().get<LocationOptions>(
      ConfigurationKeys.LOCATION,
      LocationOptions.NAME
    )
}
