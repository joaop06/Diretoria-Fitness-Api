import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const logger = new Logger();

type encodingValues =
  | 'ascii'
  | 'utf8'
  | 'utf-8'
  | 'utf16le'
  | 'utf-16le'
  | 'ucs2'
  | 'ucs-2'
  | 'base64'
  | 'base64url'
  | 'latin1'
  | 'binary'
  | 'hex';

function readFiles(path: string, encoding: encodingValues = 'base64') {
  try {
    if (!!path === false)
      throw new Error('Caminho para arquivo ou diretório inválido');

    path = fs.readFileSync(path, { encoding });
  } catch (e) {
    path = null;
    logger.error(e);
  } finally {
    return path;
  }
}

export { readFiles };
