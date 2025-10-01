import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Component, inject, Input, OnInit, ViewChild} from '@angular/core';
import {ConnectorObject, DiagramObject}
  from '../../interfaces/serializedDiagram.interface';
import {CanvasComponent} from '../canvas/canvas.component';
import {FormsModule} from '@angular/forms';
import {CodeGenerationService}
  from '../../services/codeGeneration/codegeneration.service';
import {VoiceRecognitionService}
  from '../../services/voice-recognition/voice-recognition.service';
import {saveAs} from 'file-saver';

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  imports: [FormsModule],
})
export class NavbarComponent implements OnInit {
  public voiceRecognitionService = inject(VoiceRecognitionService);
  @ViewChild('PromptInput') private promptInput!: HTMLInputElement;
  @Input() canvas: CanvasComponent | null = null;
  readonly http = inject(HttpClient);
  processing = false;
  prompt = '';
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
    Type: ConnectorType;
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
  }

  export enum ConnectorType {
    Association = 'Association',
    Composition = 'Composition',
    Inheritance = 'Inheritance',
    Dependency = 'Dependency',
    Aggregation = 'Aggregation'
  }`;

  ngOnInit() {
    this.voiceRecognitionService.init();
  }

  public async submitPrompt(prompt: string) {
    this.processing = true;
    switch (this.selectedValue) {
      case 'class': {await this.submitClassPrompt(prompt); break;}
      case 'compClass': {await this.submitCompClassPrompt(prompt); break;}
      case 'relation': {await this.submitRelationPrompt(prompt); break;}
    }
  }

  public async submitClassPrompt(prompt: string): Promise<void> {
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          'system_instruction': {
            'parts': [
              {
                'text': 'Eres un simple traductor de lenguaje natural a un ' +
                  'objeto en formato JSON. Tu proposito es recibir un ' +
                  'concepto o descripcion de una clase para el diseño de una' +
                  ' base de datos. El objeto tiene un \'Title\' que va a ser ' +
                  'su nombre, formateado en PascalCase. Y también tiene una ' +
                  'lista de propiedades llamada \'Properties\'. Debes generar' +
                  ' las propiedades de la clase que estas creando, con dos ' +
                  'campos. El campo \'Name\' que será el nombre de la ' +
                  'propiedad formateado en PascalCase y el campo \'Type\' ' +
                  'en el cual debes escoger el tipo mas adecuado para la ' +
                  'propiedad entre las siguientes opciones: Integer, Long, ' +
                  'Short, Float, Double, String, Boolean, Character, Byte, ' +
                  'LocalDate y LocalDateTime. ' +
                  'No agregues una propiedad Id o similar.',
              },
            ],
          },
          'contents': [
            {
              'parts': [
                {
                  'text': prompt,
                },
              ],
            },
          ],
        }, {headers: new HttpHeaders()
            .set('X-goog-api-key', 'AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')},
    ).subscribe((response: any) => {
      const formattedText: string =
        response.candidates![0].content!.parts[0].text;
      const textJson: string =
        formattedText.substring(8, formattedText.length - 4);
      const json = JSON.parse(textJson);
      this.canvas?.addClass(json);
      this.processing = false;
      this.prompt = '';
    });
  }

  public async submitRelationPrompt(prompt: string): Promise<void> {
    if (this.canvas == null) return;
    const diagram: DiagramObject =
      CodeGenerationService.objectFromDiagram(this.canvas.diagram);
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          'system_instruction':
        {
          'parts': [
            {
              'text': `Eres un simple traductor de lenguaje natural a una lis` +
              `ta de objectos en formato JSON. Tu proposito es recibir un con` +
              `cepto o descripcion de una relacion o relaciones que se desean` +
              ` añadir a un diagrama de base de datos. Se te será proporciona` +
              `da un objecto con una lista de clases y los conectores entre e` +
              `stos. Con esta informacion debes crear una lista de nuevos con` +
              `ectores que veas conveniente añadir basado en la informacion y` +
              ` la descripcion que se te dió. La clase 'Connector' tiene: Dos` +
              ` clases 'Connection', una llamada 'Source' y otra 'Target' que` +
              ` representan los dos lados de la asociacion. La clase 'Connect` +
              `ion' tiene un objeto 'Class' el cual tiene una propiedad 'Id'.` +
              ` Ademas 'Connection' tiene una propiedad 'Multiplicity' la cua` +
              `l puede representar la cardinalidad en el lado correspondiente` +
              ` de la conexion con las siguientes opciones: '0...0', '0...1',` +
              ` '1...1', '0...*', '1...*' y '*...*'. 'Conector' también tiene` +
              ` una propiedad 'Type' la cual indica el tipo de relacion que r` +
              `epresenta y puede tener los valores: 'Association', 'Inheritan` +
              `ce', 'Composition', 'Dependency' y 'Aggregation'`,
            },
          ],
        },
          'contents': [
            {
              'parts': [
                {
                  'text': prompt + '\n\n' + JSON.stringify(diagram),
                },
              ],
            },
          ],
        }, {headers: new HttpHeaders()
            .set('X-goog-api-key', 'AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')},
    ).subscribe((response: any) => {
      const formattedText: string =
        response.candidates![0].content!.parts[0].text;
      const textJson: string =
        formattedText.substring(8, formattedText.length-4);
      const json: ConnectorObject[] = JSON.parse(textJson);
      console.log(json);
      json.forEach((connector) => {
        this.canvas?.addConnector(connector);
      });
      this.processing = false;
      this.prompt = '';
    });
  }

  public async submitCompClassPrompt(prompt: string): Promise<void> {
    if (this.canvas == null) return;
    const connectors: DiagramObject =
      CodeGenerationService.objectFromDiagram(this.canvas.diagram);
    await this.http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          'system_instruction':
        {
          'parts': [
            {
              'text': `Eres un simple traductor de lenguaje natural a un ` +
              `objeto en formato JSON. Tu proposito es recibir un concepto o ` +
              `descripcion de una clase para el diseño de una base de datos y` +
              ` crear un conjunto de clases y sus relaciones a como veas conv` +
              `eniente. Siguiendo la descripción que se te dió, crea un Objet` +
              `o de tipo DiagramObject que contenga las nuevas clases y relac` +
              `iones que creas necesarias. La definición de DiagramObject y s` +
              `us componentes es: ${this.classDefinitions} \n\n Cuando pueble` +
              `s el campo 'Id' de 'Class' haz que este Id empiece con 'class_` +
              `' seguido de un conjunto aleatorio de 15 caracteres alfabetico` +
              `s mayusculas y minusculas. Evita que los caracteres aleatorios` +
              ` esten ordenados y que las mayusculas y minusculas tengan un p` +
              `atron aleatorio no intercalado. Los 'Title' en 'Class' deben c` +
              `umplir el formato PascalCase y no agregues ninguna propiedad d` +
              `e tipo Id a la lista 'Properties'. Al poblar el campo 'Multipl` +
              `icity' limitate a llenarlo con: '0...0', '0...1', '1...1', '0.` +
              `..*', '1...*' y '*...*'. Asegurate de crear los tipos de relac` +
              `iones que veas mas adecuado para cada relación. Las relaciones` +
              `pueden ser de tipo: 'Association', 'Inheritance', 'Composition` +
              `', 'Dependency' y 'Aggregation'`,
            },
          ],
        },
          'contents': [
            {
              'parts': [
                {
                  'text': prompt + '\n\n' + JSON.stringify(connectors),
                },
              ],
            },
          ],
        }, {headers: new HttpHeaders()
            .set('X-goog-api-key', 'AIzaSyBkL1ki9-D_DBf31IXI5FODpfSfRwMb3ik')},
    ).subscribe((response: any) => {
      const formattedText: string =
        response.candidates![0].content!.parts[0].text;
      const textJson: string =
        formattedText.substring(8, formattedText.length-4);
      const json: DiagramObject = JSON.parse(textJson);
      console.log(json);
      json.Classes.forEach((classObj) => {
        this.canvas?.addClass(classObj, false);
      });
      json.Connectors.forEach((connector) => {
        this.canvas?.addConnector(connector);
      });
      this.processing = false;
      this.prompt = '';
    });
  }

  generatePNG(): void {
    this.canvas?.diagram.exportDiagram({format: 'PNG'});
  }

  generateJava(): void {
    CodeGenerationService.generateZipDownload(this.canvas!.diagram);
  }

  generateJson(): void {
    const data: string = this.canvas?.diagram.saveDiagram() as string;
    const blob = new Blob([data], {type: 'application/json'});
    saveAs( blob, 'diagram.json');
  }

  async loadJson(): Promise<void> {
    // Check for API support
    if (!('showOpenFilePicker' in window)) {
      alert('Your browser does not support the File System Access API.');
      return;
    }

    try {
      // Prompt the user to select one or more files
      const fileHandles = await window.showOpenFilePicker({
        multiple: true,
      });
      for (const handle of fileHandles) {
        const file = await handle.getFile();
        const content = await file.text();
        this.canvas?.diagram.loadDiagram(content);
      }
    } catch (err) {
      console.error('File access error:', err);
    }
  }

  onSpeechRecognitionButton(): void {
    if (this.voiceRecognitionService.isListening) this.stopSpeechRecognition();
    else this.startSpeechRecognition();
  }

  startSpeechRecognition(): void {
    this.voiceRecognitionService.start();
  }

  stopSpeechRecognition(): void {
    this.voiceRecognitionService.stop();
    this.prompt = this.voiceRecognitionService.text;
    this.voiceRecognitionService.text = '';
  }
}
