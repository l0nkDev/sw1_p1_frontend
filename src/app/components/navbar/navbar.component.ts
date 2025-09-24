/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, inject, Input } from '@angular/core';
import { ConnectorObject, DiagramObject } from '../../interfaces/serializedDiagram.interface';
import { CanvasComponent } from '../canvas/canvas.component';
import { FormsModule } from '@angular/forms';
import { CodeGenerationService } from '../../services/codeGeneration/codegeneration.service';
//import saveAs from 'file-saver';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  imports: [FormsModule]
})
export class NavbarComponent {
  @Input() canvas: CanvasComponent | null = null;
  readonly http = inject(HttpClient)
  selectedValue = 'class';
  classDefinitions = 

  `export interface DiagramObject {
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
  export enum DataType {
    integer = "Integer",
    long = "Long",
    short = "Short",
    float = "Float",
    double = "Double",
    string = "String",
    boolean = "Boolean",
    character = "Character",
    byte = "Byte"
  }
  
  export interface ConnectorObject {
    Source: Connection;
    Target: Connection;
  }
  
  export interface Connection {
    Class: ClassObject;
    Multiplicity: Multiplicity;
  }
  
  export enum Multiplicity {
    ZeroToOne = '0...1',
    One = '1...1',
    Many = '*...*',
    ZeroToMany = '0...*',
    OneToMany = '1...*',
  }`

  public SubmitPrompt(prompt: string) {
    switch (this.selectedValue) {
      case 'class': { this.SubmitClassPrompt(prompt); break; }
      case 'compClass': { this.SubmitCompClassPrompt(prompt); break; }
      case 'relation': { this.SubmitRelationPrompt(prompt); break; }
    }
  }

  public async SubmitClassPrompt(prompt: string): Promise<void> {
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', 
      {
        "system_instruction":
        {
            "parts": [
              {
                "text": "Eres un simple traductor de lenguaje natural a un objecto en formato JSON. Tu proposito es recibir un concepto o descripcion de una clase para el diseño de una base de datos. El objeto tiene un 'Title' que va a ser su nombre, formateado en PascalCase. Y también tiene una lista de propiedades llamada 'Properties'. Debes generar las propiedades de la clase que estas creando, con dos campos. El campo 'Name' que será el nombre de la propiedad formateado en PascalCase y el campo 'Type' en el cual debes escoger el tipo mas adecuado para la propiedad entre las siguientes opciones: Integer, Long, Short, Float, Double, String, Boolean, Character y Byte. No agregues una propiedad Id o similar."
              }
            ]
          },
        "contents": [
          {
            "parts": [
              {
                "text": prompt
              }
            ]
          }
        ]
      }, {headers: new HttpHeaders().set('X-goog-api-key','AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')}
    ).subscribe((response: any) => {
      const formattedText: string = response.candidates![0].content!.parts[0].text;
      const textJson: string = formattedText.substring(8, formattedText.length-4);
      const json = JSON.parse(textJson);
      this.canvas?.AddClass(json);
    });
  }

  public async SubmitRelationPrompt(prompt: string): Promise<void> {
    if (this.canvas == null) return;
    const diagram: DiagramObject = CodeGenerationService.ObjectFromDiagram(this.canvas.diagram);
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', 
      {
        "system_instruction":
        {
            "parts": [
              {
                "text": `Eres un simple traductor de lenguaje natural a una lista de objectos en formato JSON. Tu proposito es recibir un concepto o descripcion de una relacion o relaciones que se desean añadir a un diagrama de base de datos. Se te será proporcionada un objecto con una lista de clases y los conectores entre estos. Con esta informacion debes crear una lista de nuevos conectores que veas conveniente añadir basado en la informacion y la descripcion que se te dió. La clase 'Connector' tiene: Dos clases 'Connection', una llamada 'Source' y otra 'Target' que representan los dos lados de la asociacion. La clase 'Connection' tiene un objeto 'Class' el cual tiene una propiedad 'Id'. Ademas 'Connection' tiene una propiedad 'Multiplicity' la cual puede representar la cardinalidad en el lado correspondiente de la conexion con las siguientes opciones: '0...0', '0...1', '1...1', '0...*', '1...*' y '*...*'`
              }
            ]
          },
        "contents": [
          {
            "parts": [
              {
                "text": prompt + '\n\n' + JSON.stringify(diagram)
              }
            ]
          }
        ]
      }, {headers: new HttpHeaders().set('X-goog-api-key','AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')}
    ).subscribe((response: any) => {
      const formattedText: string = response.candidates![0].content!.parts[0].text;
      const textJson: string = formattedText.substring(8, formattedText.length-4);
      const json: ConnectorObject[] = JSON.parse(textJson);
      console.log(json);
      json.forEach((connector) => {
        this.canvas?.AddConnector(connector);
      });
    });
  }

  public async SubmitCompClassPrompt(prompt: string): Promise<void> {
    if (this.canvas == null) return;
    const connectors: DiagramObject = CodeGenerationService.ObjectFromDiagram(this.canvas.diagram);
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', 
      {
        "system_instruction":
        {
            "parts": [
              {
                "text": `Eres un simple traductor de lenguaje natural a un objecto en formato JSON. Tu proposito es recibir un concepto o descripcion de una clase para el diseño de una base de datos y crear un conjunto de clases y sus relaciones a como veas conveniente. Siguiendo la descripción que se te dió, crea un Objeto de tipo DiagramObject que contenga las nuevas clases y relaciones que creas necesarias. La definición de DiagramObject y sus componentes es: ${this.classDefinitions} \n\n Cuando puebles el campo 'Id' de 'Class' haz que este Id empiece con 'class_' seguido de un conjunto aleatorio de 15 caracteres alfabeticos mayusculas y minusculas. Evita que los caracteres aleatorios esten ordenados y que las mayusculas y minusculas tengan un patron aleatorio no intercalado. Los 'Title' en 'Class' deben cumplir el formato PascalCase y no agregues ninguna propiedad de tipo Id a la lista 'Properties'. Al poblar el campo 'Multiplicity' limitate a llenarlo con: '0...0', '0...1', '1...1', '0...*', '1...*' y '*...*'`
              }
            ]
          },
        "contents": [
          {
            "parts": [
              {
                "text": prompt + '\n\n' + JSON.stringify(connectors)
              }
            ]
          }
        ]
      }, {headers: new HttpHeaders().set('X-goog-api-key','AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')}
    ).subscribe((response: any) => {
      const formattedText: string = response.candidates![0].content!.parts[0].text;
      const textJson: string = formattedText.substring(8, formattedText.length-4);
      const json: DiagramObject = JSON.parse(textJson);
      console.log(json)
      json.Classes.forEach((classObj) => {
        this.canvas?.AddClass(classObj, false);
      });
      json.Connectors.forEach((connector) => {
        this.canvas?.AddConnector(connector);
      });
    });
  }
  
  GeneratePNG(): void {
    this.canvas?.diagram.exportDiagram({format: 'PNG'});
  }
  
  GenerateJava(): void {
    CodeGenerationService.generateZipDownload(this.canvas!.diagram);
  }
}
