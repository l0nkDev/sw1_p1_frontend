import { DataType } from "./classproperty.interface";
import { Multiplicity } from "./multiplicity.interface";

export interface Property {
  Name: string;
  Type: DataType;
}

export interface Connection {
  Class: ClassObject;
  Multiplicity: Multiplicity;
}

export interface ClassObject {
  Id: string;
  Title: string;
  Properties: Property[];
}

export interface ConnectorObject {
  Source: Connection;
  Target: Connection;
}

export interface DiagramObject {
  Classes: ClassObject[];
  Connectors: ConnectorObject[];
}