import { webSocket } from 'rxjs/webSocket';
import { dia } from '@joint/plus';
/**
 * class-diagram sample
 */

import { Component, ViewEncapsulation, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { DiagramComponent, IDragEnterEventArgs, SymbolInfo, MarginModel, SymbolPaletteModule, DiagramModule } from '@syncfusion/ej2-angular-diagrams';
import { NodeModel, ConnectorModel, Connector, PaletteModel, UmlClassifierShapeModel } from '@syncfusion/ej2-diagrams';
import { ExpandMode } from '@syncfusion/ej2-navigations';
import { WebSocketService } from './websocket.service';
import { UMLElements } from './diagram/palettes';



/**
 * Sample for class diagram
 */
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ SymbolPaletteModule, DiagramModule ]
})
export class AppComponent {
  constructor(private websocket: WebSocketService) {}

  ngOnInit(): void {
    this.websocket.getMessages().subscribe(
      (message: string) => {
        this.diagram.nodes = message ? JSON.parse(message).nodes : [];
        this.diagram.connectors = message ? JSON.parse(message).connectors : [];
      },
      () => console.log('WebSocket connection completed.')
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
      for (let i: number = 0; i < node.annotations!.length; i++) {
        node.annotations![i].style!.color = 'black';
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
        if(arg.element instanceof Connector){
          arg.element.targetPoint.x! += 100;
          arg.element.targetPoint.y! += 20
        }
      }
  public getSymbolDefaults(symbol: NodeModel): void {
    symbol.width = 100;
    symbol.height = 100;
  }

  public createConnector( id: string, sourceID: string, targetID: string ): ConnectorModel {
    let connector: ConnectorModel = {};
    connector.id = id;
    connector.sourceID = sourceID;
    connector.targetID = targetID;
    return connector;
  }

  public createNode(id: string, offsetX: number, offsetY: number, className: string): NodeModel {
    let node: NodeModel = {};
    node.id = id;
    node.offsetX = offsetX;
    node.offsetY = offsetY;
    node.shape = {
      type: 'UmlClassifier',
      classShape: {
        name: className
      },
      classifier: 'Class'
    } as UmlClassifierShapeModel;
    return node;
  }

  public getSymbolInfo(symbol: NodeModel): SymbolInfo {
    return { fit: true, description: { text: symbol.id, }, tooltip: symbol.addInfo ? (symbol.addInfo as any)['tooltip'] : symbol.id };
  }
  public symbolMargin: MarginModel = {
    left: 12, right: 12, top: 12, bottom: 12
  };

  public createProperty(name: string, type: string): object {
    return { name: name, type: type };
  }

  public createMethods(name: string, type: string): object {
    return { name: name, type: type };
  }

  public saveToDevice() {
    var d: string = this.diagram.saveDiagram()
    this.websocket.sendMessage(d);
  }

  public Aux() {
    for (const node of this.diagram.nodes) {
      console.log(node);
    }
  }

  public onCollectionChange(args: any): void {
    if (args['state'] == 'Changed') this.saveToDevice();
  }

  public onPositionChange(args: any): void {
    if (args['state'] == 'Completed') this.saveToDevice();
  }

  public onPointChange(args: any): void {
    if (args['state'] == 'Completed') this.saveToDevice();
  }

  public onTextEdit(args: any): void {
    console.log(args);
    if (args['state'] == 'Completed') this.saveToDevice();
  }
}
