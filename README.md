<p align="center">
<img src="./assets/icon.png" height="180">
</p>

<h1 align="center">
Vue 2 SFC goto definition
</h1>

<p align="center">
Go to component definition in Vue 2 single file component.
</p>

## Motivation

When working on "legacy" projects that use Vue 2, you sometimes need to jump to a component you're using in another component. [The Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension for VSCode doesn't quite work for this—it goes to the nearest definition in the current file rather than the component file itself. So, I've created this small extension to make my day-to-day work a bit easier.


## Extension Settings

- `vue2SfcGotoDefinition.enable`: Enables or disables this extension.
- `vue2SfcGotoDefinition.location`: Specify location of the definition in the component. Where to jump to.
    - Possible values:
        - `name`: jump to name property in component (default)
        - `export default`: jump to 'export default' inside of script tag in file
        - `template`: jump to `<template>` tag in file
- `vue2SfcGotoDefinition.alias`: Alias for src directory. Usually '@' or '~' in jsconfig.json.
    - Possible values: 
        - `@` (default)
        - `~`


## Skip peek

If you're using [The Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension for VSCode alongside this extension, VSCode will display a peek preview with both the nearest definition and the component file. To go directly to the component file, set `"editor.gotoLocation.multipleDefinitions": "goto"` in your settings.json.

This extension provides commands to set this setting:
* `>Set 'goto' on multiple definitions globally (User)`: Sets 'goto' for Multiple Definitions in global (user) configuration target.
* `>Set 'goto' on multiple definitions in workspace`: Sets 'goto' for Multiple Definitions in workspace configuration target (current project).
* `>Set 'goto' on multiple definitions in workspace folder`: Sets 'goto' for Multiple Definitions in workspace folder configuration target (current project - .vscode folder).


## Expansion ideas

> While developing this extension, I came across a few ideas on how to expand it. I might be able to incorporate them someday. I'm open to contributions.

1. Definition provider for components property
    > Inside the script tag, components are defined in the "components" property. Currently, "go to definition" takes you to the nearest definition (likely an import statement) instead of the component file.
2. Definition provider for import lines
    > "Go to definition" on a component in an import statement doesn't work if the path doesn't end with ".vue".
3. Support global imports
    > The extension doesn't recognize globally registered components.
4. Support no alias or multiple
    > The extension may not work in projects without aliases set or with multiple aliases (this needs testing).

## License

[MIT](./LICENSE) License © 2024 [Daniel Petr Honys](https://github.com/DPHonys)