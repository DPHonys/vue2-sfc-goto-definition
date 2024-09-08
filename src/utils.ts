export function joinOnOverlap(
  dirPath: string,
  filePath: string
): string | undefined {
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
  return "/" + newPathParts.join("/");
}
