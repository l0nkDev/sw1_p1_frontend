export interface ClassProperty {
  id: string | null;
  name: string;
  type: DataType;
  delete: boolean;
}

export enum DataType {
  integer = 'Integer',
  long = 'Long',
  short = 'Short',
  float = 'Float',
  double = 'Double',
  string = 'String',
  boolean = 'Boolean',
  character = 'Character',
  byte = 'Byte',
  localdate = 'LocalDate',
  localdatetime = 'LocalDateTime'
}
