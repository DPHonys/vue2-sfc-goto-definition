import { languages, Uri, Location, Position, workspace } from "vscode";
import { dirname } from "node:path";
import { existsSync } from "node:fs";
import { config } from "./configuration";

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

        // Find the position
        let position = new Position(0, 0);
        await workspace.openTextDocument(uri).then((doc) => {
          const text = doc.getText();
          const startPosition = text.indexOf(
            (() => {
              switch (config.getLocation()) {
                case "name":
                  return "export default";
                case "export default":
                  return "<script>";
                default:
                  return "";
              }
            })()
          );
          const index = text.indexOf(
            (() => {
              switch (config.getLocation()) {
                case "name":
                  return componentName;
                case "export default":
                  return "export default";
                case "template":
                  return "<template>";
                default:
                  return "";
              }
            })(),
            startPosition
          );
          if (index !== -1) {
            const a = doc.positionAt(index);
            position = new Position(a.line, a.character);
          }
        });

        // Open the file in the editor
        const location = new Location(uri, position);
        return location;
      },
    }
  );
}
