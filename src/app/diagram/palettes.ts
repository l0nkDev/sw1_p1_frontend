import {PaletteModel} from '@syncfusion/ej2-angular-diagrams';
import {DataType} from '../interfaces/classproperty.interface';

export class UMLElements {
  public static palettes: PaletteModel[] = [
    {
      id: 'umlConnectors',
      expanded: true,
      title: '',
      symbols: [
        {
          id: 'class',
          borderColor: 'white',
          shape: {
            type: 'UmlClassifier',
            classShape: {
              attributes: [{
                name: 'name', type: DataType.string,
              }],
              methods: [],
              name: 'Class',
            },
            classifier: 'Class',
          },
        },
        {
          id: 'Association',
          type: 'Straight',
          sourcePoint: {x: 700, y: 200},
          targetPoint: {x: 800, y: 300},
          shape: {
            type: 'UmlClassifier',
            relationship: 'Association',
            multiplicity: {
              type: 'ManyToMany',
              source: {
                optional: true,
                lowerBounds: '1',
                upperBounds: '1',
              },
              target: {optional: true, lowerBounds: '1', upperBounds: '1'},
            },
          },
        },
        {
          id: 'Dependency',
          type: 'Straight',
          sourcePoint: {x: 700, y: 200},
          targetPoint: {x: 800, y: 300},
          shape: {
            type: 'UmlClassifier',
            relationship: 'Dependency',
            multiplicity: {
              type: 'ManyToMany',
              source: {
                optional: true,
                lowerBounds: '1',
                upperBounds: '1',
              },
              target: {optional: true, lowerBounds: '1', upperBounds: '1'},
            },
          },
        },
        {
          id: 'Aggregation',
          type: 'Straight',
          sourcePoint: {x: 700, y: 200},
          targetPoint: {x: 800, y: 300},
          shape: {
            type: 'UmlClassifier',
            relationship: 'Aggregation',
            multiplicity: {
              type: 'ManyToMany',
              source: {
                optional: true,
                lowerBounds: '0',
                upperBounds: '1',
              },
              target: {optional: true, lowerBounds: '0', upperBounds: '*'},
            },
          },
        },
        {
          id: 'Composition',
          sourcePoint: {x: 100, y: 200},
          targetPoint: {x: 200, y: 300},
          type: 'Straight',
          shape: {
            type: 'UmlClassifier',
            relationship: 'Composition',
            multiplicity: {
              type: 'ManyToMany',
              source: {
                optional: true,
                lowerBounds: '1',
                upperBounds: '1',
              },
              target: {optional: true, lowerBounds: '1', upperBounds: '*'},
            },
          },
        },
        {
          id: 'Inheritance',
          type: 'Straight',
          sourcePoint: {x: 900, y: 200},
          targetPoint: {x: 1000, y: 300},
          shape: {
            type: 'UmlClassifier',
            relationship: 'Inheritance',
            multiplicity: {
              type: 'ManyToMany',
              source: {
                optional: true,
                lowerBounds: '1',
                upperBounds: '1',
              },
              target: {optional: true, lowerBounds: '1', upperBounds: '1'},
            },
          },
        },
      ],
    },
  ];
}
