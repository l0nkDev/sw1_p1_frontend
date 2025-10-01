import {DataType} from './classproperty.interface';
import {Multiplicity} from './multiplicity.interface';

export interface DiagramObject {
  Classes: ClassObject[];
  Connectors: ConnectorObject[];
}

export interface ClassObject {
  Id: string;
  Title: string;
  Properties: Property[];
}

export interface Property {
  Name: string;
  Type: DataType;
}

export interface ConnectorObject {
  Source: Connection;
  Type: ConnectorType;
  Target: Connection;
}

export interface Connection {
  Class: ClassObject;
  Multiplicity: Multiplicity;
}

export enum ConnectorType {
  Association = 'Association',
  Composition = 'Composition',
  Inheritance = 'Inheritance',
  Dependency = 'Dependency',
  Aggregation = 'Aggregation'
}
