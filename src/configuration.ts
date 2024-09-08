import { workspace } from "vscode";

const configurationSection = "vue2SfcGotoDefinition";

export enum ConfigurationKeys {
    ENABLE = "enable",
    ALIAS = "alias",
    LOCATION = "location",
}

export enum ConfigurationFullKeys {
    ENABLE = configurationSection + "." + ConfigurationKeys.ENABLE,
    ALIAS = configurationSection + "." + ConfigurationKeys.ALIAS,
    LOCATION = configurationSection + "." + ConfigurationKeys.LOCATION,
}

export enum LocationOptions {
    NAME = "name",
    EXPORT_DEFAULT = "export default",
    TEMPLATE = "template",
}

export enum AliasOptions {
    '@' = "@",
    '~' = "~",
}

function getConfiguration() {
    return workspace.getConfiguration(configurationSection);
}

export const config = {
    isEnabled: () => getConfiguration().get<boolean>(ConfigurationKeys.ENABLE, true),
    getAlias: () => getConfiguration().get<string>(ConfigurationKeys.ALIAS, AliasOptions['@']),
    getLocation: () => getConfiguration().get<string>(ConfigurationKeys.LOCATION, LocationOptions.NAME),
};
