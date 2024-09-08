import { workspace } from "vscode";

const configurationSection = "vue2SfcGotoDefinition";

export enum configurationKeys {
    ENABLE = configurationSection + ".enable",
    ALIAS = configurationSection + ".alias",
    LOCATION = configurationSection + ".location",
}

export function getConfiguration() {
    return workspace.getConfiguration("vue2SfcGotoDefinition");
}

export function isEnabled() {
    return getConfiguration().get("enable");
}

export function getAlias() {
    return getConfiguration().get("alias");
}

export function getLocation() {
    return getConfiguration().get("location");
}
