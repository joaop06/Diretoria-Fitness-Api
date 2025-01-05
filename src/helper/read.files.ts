import * as fs from 'fs';

type encodingValues = "ascii" | "utf8" | "utf-8" | "utf16le" | "utf-16le" | "ucs2" | "ucs-2" | "base64" | "base64url" | "latin1" | "binary" | "hex";

function readFiles(path: string, encoding: encodingValues = 'base64') {
  try {
    path = fs.readFileSync(path, { encoding })
  } catch (e) {
    path = null;
  } finally {
    return path;
  }
}

export { readFiles };