import {Multiplicity} from './../../interfaces/multiplicity.interface';
import {
  ClassProperty,
  DataType,
} from './../../interfaces/classproperty.interface';
import {
  Component,
  ViewEncapsulation,
  ViewChild,
  OnInit,
  inject,
} from '@angular/core';
import {
  DiagramComponent,
  IDragEnterEventArgs,
  SymbolInfo,
  MarginModel,
  SymbolPaletteModule,
  DiagramModule,
  ConnectorEditingService,
  UndoRedoService,
  DiagramContextMenuService,
  PrintAndExportService,
} from '@syncfusion/ej2-angular-diagrams';
import {
  NodeModel,
  ConnectorModel,
  Connector,
  PaletteModel,
  AnnotationConstraints,
} from '@syncfusion/ej2-diagrams';
import {ExpandMode} from '@syncfusion/ej2-navigations';
import {WebSocketService} from '../../services/websocket/websocket.service';
import {UMLElements} from '../../diagram/palettes';
import {Router} from '@angular/router';
import {GenericInterface} from '../../interfaces/generic.interface';
import {FormsModule} from '@angular/forms';
import {KeyValuePipe, NgFor} from '@angular/common';
import {
  ClassObject,
  ConnectorObject,
} from '../../interfaces/serializedDiagram.interface';

@Component({
  selector: 'app-canvas',
  templateUrl: 'canvas.component.html',
  styleUrls: ['canvas.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    SymbolPaletteModule,
    DiagramModule,
    FormsModule,
    NgFor,
    KeyValuePipe,
  ],
  providers: [
    ConnectorEditingService,
    UndoRedoService,
    DiagramContextMenuService,
    PrintAndExportService,
  ],
})
export class CanvasComponent implements OnInit {
  @ViewChild('diagram') public diagram!: DiagramComponent;

  readonly router = inject(Router);
  readonly clientid: string =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  public expandMode: ExpandMode = 'Multiple';
  public palettes: PaletteModel[] = UMLElements.palettes;
  public nodes: NodeModel[] = [];
  public connectors: ConnectorModel[] = [];
  SelectedClass: string | null = null;
  SelectedConnector: string | null = null;
  ClassName = '';
  ClassProperties: ClassProperty[] = [];
  DataType = DataType;
  Multiplicity = Multiplicity;
  SourceTitle = '';
  SourceMultiplicity: Multiplicity = Multiplicity.Many;
  TargetTitle = '';
  TargetMultiplicity: Multiplicity = Multiplicity.Many;

  websocket: WebSocketService = new WebSocketService(
      window.location.pathname.split('/').pop() || '',
  );

  ngOnInit(): void {
    if (this.getUrl() == '') {
      const id: string =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      this.router.navigate(['/session/' + id]);
      this.websocket = new WebSocketService(id);
    }
    this.websocket.getMessages().subscribe(
        (message: string) => {
          const json: any = JSON.parse(message);
          if (json.clientid == this.clientid) {
            console.log('Message from self, ignoring');
          } else {
            console.log('Received message from ' + json.clientid);
            if (json.diagram == null) {
              this.diagram.nodes = json.nodes;
              this.diagram.connectors = json.connectors;
            } else {
              const diagram: any = JSON.parse(json.diagram);
              this.diagram.nodes = diagram.nodes;
              this.diagram.connectors = diagram.connectors;
            }
            this.diagram.loadDiagram(this.diagram.saveDiagram());
          }
        },
        () => console.log('WebSocket connection completed.'),
    );
  }

  public getNodeDefaults(node: NodeModel): NodeModel {
    node.style = {fill: '#FFFFFF', strokeColor: 'black'};
    if (node.annotations!.length > 0) {
      for (const annotation of node.annotations!) {
        annotation.style!.color = 'black';
        annotation.constraints = AnnotationConstraints.ReadOnly;
      }
    }
    return node;
  }
  public created(): void {
    this.diagram.fitToPage();
  }

  public getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
    return connector;
  }
  public dragEnter(arg: IDragEnterEventArgs): void {
    if (arg.element instanceof Connector) {
      arg.element.targetPoint.x! += 100;
      arg.element.targetPoint.y! += 20;
    }
  }
  public getSymbolDefaults(symbol: NodeModel): void {
    symbol.width = 100;
    symbol.height = 100;
  }

  public getSymbolInfo(symbol: NodeModel): SymbolInfo {
    return {
      fit: true,
      description: {text: symbol.id},
      tooltip: symbol.addInfo ?
        (symbol.addInfo as GenericInterface).tooltip :
        symbol.id,
    };
  }
  public symbolMargin: MarginModel = {
    left: 12,
    right: 12,
    top: 12,
    bottom: 12,
  };

  public createProperty(name: string, type: string): object {
    return {name: name, type: type};
  }

  public createMethods(name: string, type: string): object {
    return {name: name, type: type};
  }

  public sendToServer() {
    const d: string = this.diagram.saveDiagram();
    this.websocket.sendMessage({
      clientid: this.clientid,
      diagram: d,
    } as unknown as string);
  }

  public onCollectionChange(args: GenericInterface): void {
    if (args.state == 'Changed') this.sendToServer();
  }

  public onPositionChange(args: GenericInterface): void {
    if (args.state == 'Completed') this.sendToServer();
  }

  public onPointChange(args: any): void {
    if (args.state == 'Completed') {
      const connector: ConnectorModel = this.diagram.getObject(
          args.connector.properties.id,
      );
      console.log(connector);
      if (
        args.connector.properties.sourceID ===
          args.connector.properties.targetID &&
        args.connector.properties.sourceID !== '' &&
        args.connector.properties.targetID !== ''
      ) {
        connector.type = 'Orthogonal';
      } else connector.type = 'Straight';
      console.log(args.connector.properties.sourceID);
      this.sendToServer();
    }
  }

  public getUrl(): string | undefined {
    return window.location.pathname.split('/').pop();
  }

  public PrintNodes(): void {
    console.log(this.diagram.nodes);
  }

  public PrintConnectors(): void {
    console.log(this.diagram.connectors);
  }
  public onClick(args: any): void {
    if (args.element != null && args.element.id != null) {
      const id: string = args.element.id;
      if (id.startsWith('class')) {
        if (this.SelectedClass === args.element.id) return;
        this.SelectedClass = args.element.id;
        this.SelectedConnector = null;
        this.ClassName = this.getClassTitle(this.SelectedClass!);
        this.fillProperties(this.SelectedClass!);
      } else if (
        id.startsWith('Association') ||
        id.startsWith('Composition') ||
        id.startsWith('Inheritance') ||
        id.startsWith('Aggregation') ||
        id.startsWith('Dependency')
      ) {
        this.SelectedConnector = args.element.id;
        this.SelectedClass = null;
        const connector = this.diagram.getConnectorObject(id);
        this.SourceTitle = connector.sourceID ?
          this.getClassTitle(connector.sourceID) :
          'undefined';
        this.TargetTitle = connector.targetID ?
          this.getClassTitle(connector.targetID) :
          'undefined';
        this.SourceMultiplicity = connector.annotations![0]
            .content as Multiplicity;
        this.TargetMultiplicity = connector.annotations![1]
            .content as Multiplicity;
      } else {
        if (this.SelectedClass === args.element.parentId) return;
        this.SelectedClass = args.element.parentId;
        this.SelectedConnector = null;
        this.ClassName = this.getClassTitle(this.SelectedClass!);
        this.fillProperties(this.SelectedClass!);
      }
    }
  }

  public fillProperties(nodeId: string): void {
    this.ClassProperties = [];
    const parent = this.diagram.getNodeObject(nodeId);
    parent.children?.forEach((child) => {
      const node = this.diagram.getNodeObject(child);
      if (node.annotations?.length == 1) {
        const split = node.annotations![0].content?.split(' ');
        const name = split![2];
        const type = split![4];
        this.ClassProperties.push({
          id: node.id!,
          name: name,
          type: type as DataType,
          delete: false,
        });
      }
    });
  }

  public getClassTitle(nodeId: string): string {
    return this.diagram.getNodeObject(
      this.diagram.getNodeObject(nodeId).children![0],
    ).annotations![0].content!;
  }

  public applyChanges(): void {
    if (this.SelectedClass != null) {
      this.ClassName = this.ClassName.replace(/\s/g, '');
      this.diagram.nodes.forEach((node) => {
        if (node.id === this.SelectedClass + '_umlClass_header') {
          node.annotations![0].content = this.ClassName;
        }

        if (node.id === this.SelectedClass) {
          this.ClassProperties.forEach((property) => {
            property.name = property.name.replace(/\s/g, '');
            console.log(property.id);
            if (property.id != null || property.delete) {
              this.diagram.remove(this.diagram.getNodeObject(property.id!));
            }
            if (!property.delete) {
              this.diagram.addChildToUmlNode(
                  node,
                  {name: property.name, type: property.type},
                  'Attribute',
              );
            }
          });
        }
      });
      this.fillProperties(this.SelectedClass!);
    }
    if (this.SelectedConnector != null) {
      this.diagram.connectors.forEach((connector) => {
        if (connector.id === this.SelectedConnector) {
          const source = this.SourceMultiplicity.split('...');
          const target = this.TargetMultiplicity.split('...');
          (connector.shape as any).multiplicity.source.lowerBounds = source[0];
          (connector.shape as any).multiplicity.source.upperBounds = source[1];
          (connector.shape as any).multiplicity.target.lowerBounds = target[0];
          (connector.shape as any).multiplicity.target.upperBounds = target[1];
          (connector.shape as any).multiplicity.type = 'ManyToMany';
          console.log(connector);
        }
      });
    }
    this.sendToServer();
    this.diagram.loadDiagram(this.diagram.saveDiagram());
  }

  setType(property: ClassProperty, type: DataType): void {
    property.type = type;
  }

  addProperty(): void {
    this.ClassProperties.push({
      id: null,
      name: 'newProperty',
      type: DataType.integer,
      delete: false,
    });
  }

  deleteProperty(property: ClassProperty): void {
    property.delete = true;
  }

  setSourceMult(mult: Multiplicity): void {
    this.SourceMultiplicity = mult;
  }

  setTargetMult(mult: Multiplicity): void {
    this.TargetMultiplicity = mult;
  }

  public addClass(newClass: ClassObject | null, randomizeName = true): void {
    console.log(newClass);
    if (newClass == null) return;
    const attributes: { name: string; type: DataType }[] = [];
    newClass.Properties.forEach((property) => {
      attributes.push({name: property.Name, type: property.Type});
    });
    const newClassObj: NodeModel = {
      id: randomizeName ?
        ('class_' + Math.random().toString(36).substring(2, 15)).replace(
            ' ',
            '',
        ) :
        newClass.Id,
      borderColor: 'white',
      shape: {
        type: 'UmlClassifier',
        classShape: {
          attributes: attributes,
          methods: [],
          name: newClass.Title,
        },
        classifier: 'Class',
      },
    };
    this.diagram.add(newClassObj);
  }

  public addConnector(newConnector: ConnectorObject | null): void {
    if (newConnector == null) return;
    const newConnectorObj: ConnectorModel = {
      id: (
        newConnector.Type + Math.random().toString(36).substring(2, 15)
      ).replace(' ', ''),
      sourceID: newConnector.Source.Class.Id,
      targetID: newConnector.Target.Class.Id,
      type:
        newConnector.Source.Class.Id === newConnector.Target.Class.Id ?
          'Orthogonal' :
          'Straight',
      shape: {
        type: 'UmlClassifier',
        relationship: newConnector.Type,
        multiplicity: {
          type: 'ManyToMany',
          source: {
            optional: true,
            lowerBounds: newConnector.Source.Multiplicity.split('...')[0],
            upperBounds: newConnector.Source.Multiplicity.split('...')[1],
          },
          target: {
            optional: true,
            lowerBounds: newConnector.Target.Multiplicity.split('...')[0],
            upperBounds: newConnector.Target.Multiplicity.split('...')[1],
          },
        },
      },
    };
    this.diagram.add(newConnectorObj as NodeModel);
  }
}
