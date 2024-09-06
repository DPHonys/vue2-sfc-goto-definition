import * as vscode from "vscode";
import { dirname } from "node:path";

function joinOnOverlap(dirPath: string, filePath: string): string | undefined {
  const dirParts = dirPath.split("/").splice(1);
  const fileParts = filePath.split("/").splice(1);

  let overlap = 0;
  let overlapFound = false;
  for (let i = 0; i < dirParts.length; i++) {
    if (fileParts.includes(dirParts[i])) {
      overlap = i;
      overlapFound = true;
      break;
    }
  }

  if (!overlapFound) {
    return undefined;
  }

  const newPathParts = [...dirParts.slice(0, overlap), ...fileParts];
  return '/' + newPathParts.join("/");
}

export function activate(context: vscode.ExtensionContext) {
  const provider = vscode.languages.registerDefinitionProvider(
    { scheme: "file", language: "vue" },
    {
      provideDefinition(document, position) {
        // Only run for .vue files
        if (!document.uri.fsPath.endsWith(".vue")) {
          return null;
        }

        // Check if in template section
        const lines = document.getText().split("\n");
        const templateStartLine = lines.findIndex((line) =>
          line.includes("<template>")
        );
        const templateEndLine = lines.findIndex((line) =>
          line.includes("</template>")
        );
        if (
          position.line < templateStartLine ||
          position.line > templateEndLine
        ) {
          return null;
        }

        // Check if component
        const componentName = document.getText(
          document.getWordRangeAtPosition(position)
        );
        const fullLine = document.lineAt(position.line).text;
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
        let file = importPath.endsWith(".vue") ? importPath : importPath + ".vue"; // Add .vue extension if missing
        file = file.startsWith("@") ? file.slice(1) : file; // Remove @ symbol if present
        const joinedPath = joinOnOverlap(dirname(document.uri.fsPath), file);
        if (!joinedPath) {
          return null;
        }

        // TODO: Check if file exists

        vscode.commands.executeCommand("vscode.open", vscode.Uri.file(joinedPath));
      },
    }
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
