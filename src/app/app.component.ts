import { webSocket } from 'rxjs/webSocket';
import { dia } from '@joint/plus';
/**
 * class-diagram sample
 */

import { Component, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { DiagramComponent, IDragEnterEventArgs, SymbolInfo, MarginModel, SymbolPaletteModule, DiagramModule } from '@syncfusion/ej2-angular-diagrams';
import { Diagram, NodeModel, ConnectorModel, Connector, PaletteModel, UmlClassifierShapeModel } from '@syncfusion/ej2-diagrams';
import { ExpandMode } from '@syncfusion/ej2-navigations';
import { WebSocketService } from './websocket.service';
import { Subscription } from 'rxjs';



/**
 * Sample for class diagram
 */
@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [ SymbolPaletteModule, DiagramModule]
})
export class AppComponent implements OnInit{
  constructor(private websocket: WebSocketService) {}
  private messageSubscription!: Subscription;

  ngOnInit(): void {
    this.messageSubscription = this.websocket.getMessages().subscribe(
      (message: string) => {
        this.diagram.loadDiagram(message);
      },
      () => console.log('WebSocket connection completed.')
    );
  }

  @ViewChild('diagram') public diagram!: DiagramComponent;

  public expandMode: ExpandMode = 'Multiple';
  // Initialize the palettes displayed in the symbol palette
  public palettes: PaletteModel[] = [
    {
      id: 'UmlActivity', expanded: true, title: 'UML Classifier Nodes', symbols: [
      {
          id: 'class',
          borderColor: 'white',
          shape: {
              type: 'UmlClassifier',
              classShape: {
                  attributes: [],
                  methods: [],
                  name: 'Class'
              },
              classifier: 'Class'
          },
      },
      ]
  },
  {
    id: 'umlConnectorrs', expanded: true, title: 'UML Classifier Connectors', symbols: [
      {
        id: 'Composition',
        sourcePoint: { x: 100, y: 200 },
        targetPoint: { x: 200, y: 300 },
        type: 'Straight',
        shape: { type: 'UmlClassifier', relationship: 'Composition' }
    },
    {
        id: 'BiDirectional',
        type: 'Straight',
        sourcePoint: { x: 300, y: 200 },
        targetPoint: { x: 400, y: 300 },
        shape: { type: 'UmlClassifier', relationship: 'Aggregation', associationType: 'BiDirectional' }
    },
    {
        id: 'Directional',
        type: 'Straight',
        sourcePoint: { x: 500, y: 200 },
        targetPoint: { x: 600, y: 300 },
        shape: { type: 'UmlClassifier', relationship: 'Association', associationType: 'Directional' }
    },
    {
        id: 'Association',
        type: 'Straight',
        sourcePoint: { x: 700, y: 200 },
        targetPoint: { x: 800, y: 300 },
        shape: { type: 'UmlClassifier', relationship: 'Association' }
    },
    {
        id: 'Inheritance',
        type: 'Straight',
        sourcePoint: { x: 900, y: 200 },
        targetPoint: { x: 1000, y: 300 },
        shape: { type: 'UmlClassifier', relationship: 'Inheritance' }
    },
    {
        id: 'Interfaces',
        type: 'Straight',
        sourcePoint: { x: 100, y: 400 },
        targetPoint: { x: 200, y: 500 },
        shape: { type: 'UmlClassifier', relationship: 'Interface' }
    },
    {
        id: 'Dependency',
        type: 'Straight',
        sourcePoint: { x: 300, y: 400 },
        targetPoint: { x: 400, y: 500 },
        shape: { type: 'UmlClassifier', relationship: 'Dependency' }
    },
    {
        id: 'Realization',
        type: 'Straight',
        sourcePoint: { x: 500, y: 400 },
        targetPoint: { x: 600, y: 500 },
        shape: { type: 'UmlClassifier', relationship: 'Realization' }
    },
    {
        id: "OneToMany",
        type: 'Straight',
        sourcePoint: {
            x: 700,
            y: 400
        },
        targetPoint: {
            x: 800,
            y: 500
        },
        annotations: [{
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 20
                }
            }
        ],
        shape: {
            type: "UmlClassifier",
            relationship: 'Dependency',
            multiplicity: {
                type: 'OneToMany',
                source: {
                    optional: true,
                    lowerBounds: '89',
                    upperBounds: '67'
                },
                target: { optional: true, lowerBounds: '78', upperBounds: '90' }
            }
        }
    },
    {
        id: "ManyToMany",
        sourcePoint: {
            x: 900,
            y: 400
        },
        targetPoint: {
            x: 1000,
            y: 500
        },
        annotations: [{
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 20
                }
            }
        ],
        shape: {
            type: "UmlClassifier",
            relationship: 'Dependency',
            multiplicity: {
                type: 'ManyToMany',
                source: {
                    optional: true,
                    lowerBounds: '89',
                    upperBounds: '67'
                },
                target: { optional: true, lowerBounds: '78', upperBounds: '90' }
            }
        }
    },
    {
        id: "OneToOne",
        sourcePoint: { x: 100, y: 600 },
        targetPoint: { x: 200, y: 700 },
        annotations: [{
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 20
                }
            }
        ],
        shape: {
            type: "UmlClassifier",
            relationship: 'Dependency',
            multiplicity: {
                type: 'OneToOne',
                source: {
                    optional: true,
                    lowerBounds: '89',
                    upperBounds: '67'
                },
                target: { optional: true, lowerBounds: '78', upperBounds: '90' }
            }
        }
    },
    {
        id: "ManyToOne",
        sourcePoint: { x: 300, y: 600 },
        targetPoint: { x: 400, y: 700 },
        annotations: [{
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 20
                }
            }
        ],
        shape: {
            type: "UmlClassifier",
            relationship: 'Dependency',
            multiplicity: {
                type: 'ManyToOne',
                source: {
                    optional: true,
                    lowerBounds: '89',
                    upperBounds: '67'
                },
                target: { optional: true, lowerBounds: '78', upperBounds: '90' }
            }
        }
    },
    {
        id: "OneToMany",
        sourcePoint: { x: 500, y: 600 },
        targetPoint: { x: 600, y: 700 },
        annotations: [{
                margin: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 20
                }
            }
        ],
        shape: {
            type: "UmlClassifier",
            relationship: 'Dependency',
            multiplicity: {
                type: 'OneToMany',
            }
        }
    }
    ]
  }
  ];
 //Initialize nodes for the diagram.
  public nodes: NodeModel[] = [];
 //Initialize connector for the diagram.
  public connectors: ConnectorModel[] = [];

  // Set the default values of nodes.
  public getNodeDefaults(node: NodeModel): NodeModel {
    node.style = { fill: '#26A0DA', strokeColor: 'white' };
    if (node.annotations!.length > 0) {
      for (let i: number = 0; i < node.annotations!.length; i++) {
        node.annotations![i].style!.color = 'white';
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


  // Create and return a connector object with specified properties during initial rendering.
  public createConnector( id: string, sourceID: string, targetID: string ): ConnectorModel {
    let connector: ConnectorModel = {};
    connector.id = id;
    connector.sourceID = sourceID;
    connector.targetID = targetID;
    return connector;
  }

  // Create and return a node object with specified properties during initial rendering.
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
    return { fit: true,description: { text: symbol.id, } ,tooltip: symbol.addInfo ? (symbol.addInfo as any)['tooltip'] : symbol.id };
 }
 public symbolMargin: MarginModel = {
  left: 12, right: 12, top: 12, bottom: 12
};
  // create class Property
  public createProperty(name: string, type: string): object {
    return { name: name, type: type };
  }

  // create class Methods
  public createMethods(name: string, type: string): object {
    return { name: name, type: type };
  }

  public saveToDevice() {
    var d: string = this.diagram.saveDiagram()
    this.websocket.sendMessage(d);
  }
}
