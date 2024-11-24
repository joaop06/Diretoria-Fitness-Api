export class FileDto {
  path: string;
  size: number;
  buffer: Buffer;
  encoding: string;
  filename: string;
  mimetype: string;
  fieldname: string;
  destination: string;
  originalname: string;
}
