/* eslint-disable @typescript-eslint/no-explicit-any */
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
} from '@syncfusion/ej2-angular-diagrams';
import {
  NodeModel,
  ConnectorModel,
  Connector,
  PaletteModel,
  UmlClassifierShapeModel,
} from '@syncfusion/ej2-diagrams';
import { ExpandMode } from '@syncfusion/ej2-navigations';
import { WebSocketService } from '../../websocket.service';
import { UMLElements } from '../../diagram/palettes';
import { Router } from '@angular/router';
import { GenericInterface } from '../../interfaces/generic.interface';

@Component({
  selector: 'app-root',
  templateUrl: 'canvas.component.html',
  styleUrls: ['canvas.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [SymbolPaletteModule, DiagramModule],
  providers: [ConnectorEditingService, UndoRedoService, DiagramContextMenuService],
})
export class CanvasComponent implements OnInit {
  readonly router = inject(Router);
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
        this.diagram.nodes = message ? JSON.parse(message).nodes : [];
        this.diagram.connectors = message ? JSON.parse(message).connectors : [];
      },
      () => console.log('WebSocket connection completed.'),
    );
  }

  @ViewChild('diagram') public diagram!: DiagramComponent;

  public expandMode: ExpandMode = 'Multiple';

  public palettes: PaletteModel[] = UMLElements.palettes;

  public nodes: NodeModel[] = [];

  public connectors: ConnectorModel[] = [];

  public getNodeDefaults(node: NodeModel): NodeModel {
    node.style = { fill: '#FFFFFF', strokeColor: 'black' };
    if (node.annotations!.length > 0) {
      for (const annotation of node.annotations!) {
        annotation.style!.color = 'black';
      }
    }
    return node;
  }
  public created(): void {
    this.diagram.fitToPage();
  }
  // Set the default values of connectors.
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

  public createConnector(
    id: string,
    sourceID: string,
    targetID: string,
  ): ConnectorModel {
    const connector: ConnectorModel = {};
    connector.id = id;
    connector.sourceID = sourceID;
    connector.targetID = targetID;
    return connector;
  }

  public createNode(
    id: string,
    offsetX: number,
    offsetY: number,
    className: string,
  ): NodeModel {
    const node: NodeModel = {};
    node.id = id;
    node.offsetX = offsetX;
    node.offsetY = offsetY;
    node.shape = {
      type: 'UmlClassifier',
      classShape: {
        name: className,
      },
      classifier: 'Class',
    } as UmlClassifierShapeModel;
    return node;
  }

  public getSymbolInfo(symbol: NodeModel): SymbolInfo {
    return {
      fit: true,
      description: { text: symbol.id },
      tooltip: symbol.addInfo ? (symbol.addInfo as GenericInterface).tooltip : symbol.id,
    };
  }
  public symbolMargin: MarginModel = {
    left: 12,
    right: 12,
    top: 12,
    bottom: 12,
  };

  public createProperty(name: string, type: string): object {
    return { name: name, type: type };
  }

  public createMethods(name: string, type: string): object {
    return { name: name, type: type };
  }

  public saveToDevice() {
    const d: string = this.diagram.saveDiagram();
    this.websocket.sendMessage(d);
  }

  public Aux() {
    //window.location.replace('/session/' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const sessionid: string =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    this.router.navigate(['/session/' + sessionid]);
    this.websocket = new WebSocketService(sessionid);
  }

  public onCollectionChange(args: GenericInterface): void {
    if (args.state == 'Changed') this.saveToDevice();
  }

  public onPositionChange(args: GenericInterface): void {
    if (args.state == 'Completed') {
      console.log(this.diagram.nodes);
      this.saveToDevice();
    }
  }

  public onPointChange(args: any): void {
    if (args.state == 'Completed') {
      const connector: ConnectorModel = this.diagram.getObject(args.connector.properties.id);
      console.log(connector);
      if (args.connector.properties.sourceID === args.connector.properties.targetID) 
        connector.type = 'Orthogonal';
      else connector.type = 'Straight';
    }
  }

  public onTextEdit(args: GenericInterface): void {
    console.log(args);
    if (args.state == 'Completed') this.saveToDevice();
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
}
