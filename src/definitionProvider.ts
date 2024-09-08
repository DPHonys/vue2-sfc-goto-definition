import { languages, Uri, Location, Position, workspace, Range } from "vscode";
import { dirname } from "node:path";
import { existsSync } from "node:fs";
import { config, LocationOptions, LocationTextStartLines } from "./configuration";

type MaybePositionOrRange = Position | Range;

async function getPositionOrRange(
  uri: Uri,
  componentName: string
): Promise<MaybePositionOrRange> {
  const doc = await workspace.openTextDocument(uri);
  const text = doc.getText();
  const index = text.indexOf(
    (() => {
      switch (config.getLocation()) {
        case LocationOptions.NAME:
          return componentName;
        case LocationOptions.EXPORT_DEFAULT:
          return "export default";
        case LocationOptions.TEMPLATE:
          return "<template>";
        default:
          return "";
      }
    })(),
    text.indexOf(LocationTextStartLines[config.getLocation()]
    )
  );
  
  if (index === -1) {
    return new Position(0, 0);
  }

  const rangeStart = doc.positionAt(index);
  switch (config.getLocation()) {
    case LocationOptions.NAME:
      const rangeEnd = doc.positionAt(index + componentName.length);
      return new Range(rangeStart, rangeEnd);
    case LocationOptions.EXPORT_DEFAULT:
      return new Position(rangeStart.line, rangeStart.character);
    case LocationOptions.TEMPLATE:
      return new Position(rangeStart.line, rangeStart.character).with(0, 1);
    default:
      return new Position(0, 0);
  }
}

function joinOnOverlap(dirPath: string, filePath: string): string | undefined {
  const dirParts = dirPath.split("/").splice(1);
  const fileParts = filePath.split("/").splice(1);

  let overlap = -1;
  for (let i = 0; i < dirParts.length; i++) {
    if (fileParts.includes(dirParts[i])) {
      overlap = i;
      break;
    }
  }

  if (overlap === -1) {
    return undefined;
  }

  const newPathParts = [...dirParts.slice(0, overlap), ...fileParts];
  return "/" + newPathParts.join("/");
}

export function vue2SfcGotoDefinitionProvider() {
  return languages.registerDefinitionProvider(
    { scheme: "file", language: "vue" },
    {
      async provideDefinition(triggerDocument, triggerPosition) {
        // Only run for .vue files
        if (!triggerDocument.uri.fsPath.endsWith(".vue")) {
          return null;
        }

        // Check if in template section
        const lines = triggerDocument.getText().split("\n");
        const templateStartLine = lines.findIndex((line) =>
          line.includes("<template>")
        );
        const templateEndLine = lines.findIndex((line) =>
          line.includes("</template>")
        );
        if (
          triggerPosition.line < templateStartLine ||
          triggerPosition.line > templateEndLine
        ) {
          return null;
        }

        // Check if component
        const componentName = triggerDocument.getText(
          triggerDocument.getWordRangeAtPosition(triggerPosition)
        );
        const fullLine = triggerDocument.lineAt(triggerPosition.line).text;
        if (!fullLine.includes("<" + componentName)) {
          return null;
        }

        // Try to find the import line
        const scriptStartLine = lines.findIndex((line) =>
          line.includes("<script>")
        );
        const scriptEndLine = lines.findIndex((line) =>
          line.includes("</script>")
        );
        const importRegex = new RegExp(
          `import\\s+.*\\b${componentName}\\b.*\\s+from\\s+['"].*['"]`,
          "i"
        );
        let importLine: string | null = null;
        for (let i = scriptStartLine; i < scriptEndLine; i++) {
          if (importRegex.test(lines[i])) {
            importLine = lines[i];
            break;
          }
        }
        if (!importLine) {
          return null;
        }

        // Get the path from the import line
        const importPath = importLine.match(/['"](.*?)['"]/)?.[1];
        if (!importPath) {
          return null;
        }

        // Map the path to the file
        let file = importPath.endsWith(".vue")
          ? importPath
          : importPath + ".vue"; // Add .vue extension if missing
        file = file.startsWith(config.getAlias()) ? file.slice(1) : file; // Remove alias symbol if present
        const joinedPath = joinOnOverlap(
          dirname(triggerDocument.uri.fsPath),
          file
        );
        if (!joinedPath) {
          return null;
        }

        // Check if file exists
        const uri = Uri.file(joinedPath);
        if (!existsSync(uri.fsPath)) {
          return null;
        }

        // Find position or range
        const positionOrRange = await getPositionOrRange(uri, componentName);

        // Open the file in the editor
        const location = new Location(uri, positionOrRange);
        return location;
      },
    }
  );
}
