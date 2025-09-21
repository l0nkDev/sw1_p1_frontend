export interface ClassProperty {
  id: string | null;
  name: string;
  type: DataType;
  delete: boolean;
}

export enum DataType {
  integer = "int",
  long = "long",
  short = "short",
  float = "float",
  double = "double",
  string = "string",
  boolean = "boolean",
  character = "char",
  byte = "byte"
}
