import { PaletteModel } from "@syncfusion/ej2-angular-diagrams";

  export class UMLElements {
    public static palettes: PaletteModel[] = [
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
        id: 'umlConnectors', expanded: true, title: 'UML Classifier Connectors', symbols: [
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
}