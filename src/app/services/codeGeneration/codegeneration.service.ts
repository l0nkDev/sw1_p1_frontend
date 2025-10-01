import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {Diagram} from '@syncfusion/ej2-angular-diagrams';
import {DataType} from '../../interfaces/classproperty.interface';
import {Multiplicity} from '../../interfaces/multiplicity.interface';
import {ClassObject, ConnectorObject, ConnectorType, DiagramObject}
  from '../../interfaces/serializedDiagram.interface';

export class CodeGenerationService {
  public static async generateZipDownload(diagram: Diagram) {
    const zip = new JSZip();
    const jsonData = this.objectFromDiagram(diagram);
    const response = await fetch('generated.zip');
    const zipTemplate = await response.arrayBuffer();
    const loadedZip = await zip.loadAsync(zipTemplate);
    jsonData.Classes.forEach((classObj) => {
      loadedZip.file(
          `src/main/java/com/umlonk/generated/controller/` +
          `${this.pascalCase(classObj.Title)}Controller.java`,
          this.classToController(classObj),
      );
      loadedZip.file(
          `src/main/java/com/umlonk/generated/dto/` +
          `${this.pascalCase(classObj.Title)}DTO.java`,
          this.classToDTO(classObj, jsonData.Connectors),
      );
      loadedZip.file(
          `src/main/java/com/umlonk/generated/model/`+
          `${this.pascalCase(classObj.Title)}.java`,
          this.classToEntity(classObj, jsonData.Connectors),
      );
      loadedZip.file(
          `src/main/java/com/umlonk/generated/repo/` +
          `${this.pascalCase(classObj.Title)}Repo.java`,
          this.classToRepo(classObj),
      );
      loadedZip.file(
          `src/main/java/com/umlonk/generated/service/` +
          `${this.pascalCase(classObj.Title)}Service.java`,
          this.classToService(classObj, jsonData.Connectors),
      );
    });
    loadedZip.generateAsync({type: 'blob'}).then((content) => {
      saveAs(content, 'generated_files.zip');
    });
  }

  static objectFromDiagram(diagram: Diagram): DiagramObject {
    const Classes: ClassObject[] = this.classesFromDiagram(diagram);
    const Connectors: ConnectorObject[] = this.connectorsFromDiagram(
        diagram,
        Classes,
    );
    return {Classes: Classes, Connectors: Connectors};
  }

  static classesFromDiagram(diagram: Diagram): ClassObject[] {
    const res: ClassObject[] = [];
    diagram.nodes.forEach((node) => {
      if (node.children != null && node.children.length! > 0) {
        const classInstance = diagram.getNodeObject(node.id!);
        const classHeader = diagram.getNodeObject(node.children[0]);
        const classObject: ClassObject = {
          Id: classInstance.id!,
          Title: classHeader.annotations![0].content!,
          Properties: [],
        };
        node.children.forEach((childID) => {
          if (
            !childID.endsWith('_umlClass_header') &&
            !childID.endsWith('_path')
          ) {
            const child = diagram.getNodeObject(childID);
            const splitAnnotation = child.annotations![0].content!.split(' ');
            classObject.Properties.push({
              Name: splitAnnotation[2],
              Type: splitAnnotation[4] as DataType,
            });
          }
        });
        res.push(classObject);
      }
    });
    return res;
  }

  static connectorsFromDiagram(
      diagram: Diagram,
      classes: ClassObject[],
  ): ConnectorObject[] {
    const res: ConnectorObject[] = [];
    diagram.connectors.forEach((connector) => {
      if (connector.sourceID != null && connector.targetID != null) {
        res.push({
          Source: {
            Class: this.getClassObject(connector.sourceID, classes)!,
            Multiplicity: connector.annotations![0].content as Multiplicity,
          },
          Type: connector.id?.startsWith('Association') ?
          ConnectorType.Association : connector.id?.startsWith('Inheritance') ?
          ConnectorType.Inheritance : ConnectorType.Composition,
          Target: {
            Class: this.getClassObject(connector.targetID, classes)!,
            Multiplicity: connector.annotations![1].content as Multiplicity,
          },
        });
      }
    });
    return res;
  }

  static camelCase(string: string): string {
    return string[0].toLowerCase() + string.substring(1);
  }

  static pascalCase(string: string): string {
    return string[0].toUpperCase() + string.substring(1);
  }
  static snakeCase(string: string): string {
    return string.replace(' ', '').replace('-', '').toLowerCase();
  }

  static getClassObject(
      classID: string,
      classes: ClassObject[],
  ): ClassObject | undefined {
    return classes.find((classObj) => classID === classObj.Id);
  }

  static classToController(classObject: ClassObject): string {
    const Ptitle = this.pascalCase(classObject.Title);
    const Ctitle = this.camelCase(classObject.Title);
    const string =

`package com.umlonk.generated.controller;

import com.umlonk.generated.dto.${Ptitle}DTO;
import com.umlonk.generated.service.${Ptitle}Service;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1/${Ptitle}s")
public class ${Ptitle}Controller {

    @Autowired
    private ${Ptitle}Service ${Ctitle}Service;

    @GetMapping("")
    public List<${Ptitle}DTO> get${Ptitle}() {
        return ${Ctitle}Service.getAll${Ptitle}s();
    }

    @PostMapping("")
    public ${Ptitle}DTO save${Ptitle}(@RequestBody ${Ptitle}DTO ${Ctitle}DTO) {
        return ${Ctitle}Service.save${Ptitle}(${Ctitle}DTO);
    }

    @PutMapping("")
    public ${Ptitle}DTO update${Ptitle}(@RequestBody ${Ptitle}DTO ${Ctitle}DT` +
    `O) {
        return ${Ctitle}Service.update${Ptitle}(${Ctitle}DTO);
    }

    @DeleteMapping("{Id}")
    public String delete${Ptitle}(@PathVariable int Id) {
        return ${Ctitle}Service.delete${Ptitle}(Id);
    }
}`
;
    return string;
  }

  static classToDTO(classObject: ClassObject, connectors: ConnectorObject[]):
  string {
    const Ptitle = this.pascalCase(classObject.Title);
    let string =

`package com.umlonk.generated.dto;

import jakarta.persistence.Entity;
import java.util.List;
import lombok.*;
import java.time.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${Ptitle}DTO {
    private Long id;
`;
    classObject.Properties.forEach((property) => {
      string +=
      `    private ${property.Type} ${this.camelCase(property.Name)};\n`;
    });
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        if (this.isOneToOne(connector) ||
        (this.isOneToMany(connector) && !isSource) ||
        (this.isManyToOne(connector) && isSource)) {
          string +=`    private Long ` +
          `${this.camelCase(isSource ? target.Title : source.Title)}Id;\n`;
        } else {
          string += `    private List<Long> ` +
          `${this.camelCase(isSource ? target.Title : source.Title)}Ids;\n`;
        }
      }
    });
    string += `}`;
    return string;
  }

  static classToEntity(classObject: ClassObject, connectors: ConnectorObject[]):
  string {
    let string =
`import jakarta.persistence.*;
import java.util.List;
import lombok.*;
import java.time.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ${this.pascalCase(classObject.Title)} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
`;
    classObject.Properties.forEach((property) => {
      string += `    private ` +
      `${property.Type} ${this.camelCase(property.Name)};\n`;
    });
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = connector.Source.Class.Id === classObject.Id;
        const belongsToSource =
        connector.Source.Multiplicity === Multiplicity.ZeroToOne ||
        connector.Target.Multiplicity === Multiplicity.One;
        if (this.isOneToOne(connector)) {
          string += `    @OneToOne(${isSource === belongsToSource ?
            'cascade=CascadeType.ALL' :
            `mappedBy="${this.camelCase(isSource ?
              source.Title : target.Title)}"`})\n`;
          if (isSource === belongsToSource) {
            string +=
            `    @JoinColumn(name="` +
            `${this.snakeCase(isSource ? target.Title : source.Title)}_id")\n`;
          }
          string += `    private ${this.pascalCase(isSource ?
            target.Title : source.Title)} ${this.camelCase(isSource ?
              target.Title : source.Title)};\n`;
        }
        if (this.isOneToMany(connector) && !isSource ||
        this.isManyToOne(connector) && isSource) {
          string += `    @ManyToOne\n`;
          string += `    @JoinColumn(name="` +
          `${this.snakeCase(isSource ? target.Title : source.Title)}_id")\n`;
          string += `    private ${this.pascalCase(isSource ?
            target.Title : source.Title)} ${this.camelCase(isSource ?
              target.Title : source.Title)};\n`;
        }
        if (this.isOneToMany(connector) && isSource ||
        this.isManyToOne(connector) && !isSource) {
          string += `    @OneToMany(mappedBy="` +
          `${this.camelCase(isSource ? source.Title : target.Title)}")\n`;
          string += `    private List<${this.pascalCase(isSource ?
            target.Title : source.Title)}> ${this.camelCase(isSource ?
              target.Title : source.Title)}s;\n`;
        }
        if (this.isManyToMany(connector)) {
          string += `    @ManyToMany${isSource ?
            '' : `(mappedBy="${this.camelCase(target.Title)}s")`}\n`;
          if (isSource) {
            string += `    @JoinTable(\n`;
            string += `        name="${this.camelCase(source.Title)}_` +
            `${this.camelCase(target.Title)}",\n`;
            string += `        joinColumns = @JoinColumn(name="` +
            `${this.snakeCase(isSource ? source.Title : target.Title)}_id"),\n`;
            string += `        inverseJoinColumns = @JoinColumn(name="` +
            `${this.snakeCase(isSource ? target.Title : source.Title)}_id"))\n`;
          }
          string += `    private List<${this.pascalCase(isSource ?
            target.Title : source.Title)}> ${this.camelCase(isSource ?
              target.Title : source.Title)}s;\n`;
        }
      }
    });
    string += `}`;
    return 'package com.umlonk.generated.model;\n\n' + string;
  }

  static classToRepo(classObject: ClassObject): string {
    const Ptitle = this.pascalCase(classObject.Title);
    const string =
`package com.umlonk.generated.repo;

import com.umlonk.generated.model.${Ptitle};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${Ptitle}Repo extends JpaRepository<${Ptitle}, Long> {
}`;
    return string;
  }

  static classToService(classObject: ClassObject, connectors: ConnectorObject[])
  : string {
    const Ptitle = this.pascalCase(classObject.Title);
    const Ctitle = this.camelCase(classObject.Title);
    let string =
`package com.umlonk.generated.service;

import com.umlonk.generated.model.*;
import com.umlonk.generated.dto.${Ptitle}DTO;
import com.umlonk.generated.repo.${Ptitle}Repo;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import org.modelmapper.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ${Ptitle}Service {

    @Autowired
    private ${Ptitle}Repo ${Ctitle}Repository;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EntityManager entityManager;

    private void mapperSetup() {
        try {
            modelMapper.addMappings(new PropertyMap<${Ptitle}DTO, ${Ptitle}>() {
                @Override
                protected void configure() {
`;
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        if (this.isOneToOne(connector) ||
        (this.isOneToMany(connector) && !isSource) ||
        (this.isManyToOne(connector) && isSource)) {
          string += `                    skip(destination.get` +
          `${this.pascalCase(isSource ? target.Title : source.Title)}());\n`;
        } else {
          string += `                    skip(destination.get` +
            `${this.pascalCase(isSource ? target.Title : source.Title)}s());\n`;
        }
      }
    },
    );
    string += `           }
            });
      } catch(ConfigurationException a) {}
    }

    public List<${Ptitle}DTO> getAll${Ptitle}s() {
        List<${Ptitle}> ${Ctitle}List = ${Ctitle}Repository.findAll();
        return modelMapper.map(${Ctitle}List, new TypeToken<List<` +
        `${Ptitle}DTO>>() {}.getType());
    }

    public ${Ptitle}DTO save${Ptitle}(${Ptitle}DTO ${Ctitle}DTO) {
        mapperSetup();
        ${Ptitle} ${Ctitle} = modelMapper.map(${Ctitle}DTO, ${Ptitle}.class);
`;
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        const property = this.pascalCase(isSource ?
          target.Title : source.Title);
        if (this.isOneToOne(connector)) {
          string +=
`        if (${Ctitle}DTO.get${property}Id() != null) {
            ${Ctitle}.set${property}(entityManager.getReference(${property}` +
`.class, ${Ctitle}DTO.get${property}Id()));
            ${Ctitle}.get${property}().set${Ptitle}(${Ctitle});
        }
        else ${Ctitle}.set${property}(null);\n`;
        }
      }
    });
    string +=
`        ${Ctitle}Repository.save(${Ctitle});
        return ${Ctitle}DTO;
    }

    public ${Ptitle}DTO update${Ptitle}(${Ptitle}DTO ${Ctitle}DTO) {
        mapperSetup();
        ${Ptitle} ${Ctitle} = ${Ctitle}Repository.findById(${Ctitle}` +
        `DTO.getId()).orElseThrow();
        modelMapper.map(${Ctitle}DTO, ${Ctitle});
`;
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        const property = this.pascalCase(isSource ?
          target.Title : source.Title);
        if (this.isOneToOne(connector)) {
          string +=
`        if (${Ctitle}DTO.get${property}Id() != null)
            ${Ctitle}.set${property}(entityManager.getReference(${property}` +
`.class, ${Ctitle}DTO.get${property}Id()));
        else ${Ctitle}.set${property}(null);\n`;
        }
      }
    });
    string +=
`        ${Ctitle}Repository.save(${Ctitle});
        return ${Ctitle}DTO;
    }

    public String delete${Ptitle}(long ${Ctitle}Id) {
        ${Ctitle}Repository.deleteById((${Ctitle}Id));
        return "${Ptitle} deleted";
    }
}`;
    return string;
  }

  static isOneToOne(connector: ConnectorObject): boolean {
    return ((
      connector.Source.Multiplicity === Multiplicity.One ||
      connector.Source.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Target.Multiplicity === Multiplicity.One ||
      connector.Target.Multiplicity === Multiplicity.ZeroToOne
    ));
  }

  static isOneToMany(connector: ConnectorObject): boolean {
    return ((
      connector.Source.Multiplicity === Multiplicity.One ||
      connector.Source.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Target.Multiplicity === Multiplicity.Many ||
      connector.Target.Multiplicity === Multiplicity.OneToMany ||
      connector.Target.Multiplicity === Multiplicity.ZeroToMany
    ));
  }

  static isManyToOne(connector: ConnectorObject): boolean {
    return ((
      connector.Target.Multiplicity === Multiplicity.One ||
      connector.Target.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Source.Multiplicity === Multiplicity.Many ||
      connector.Source.Multiplicity === Multiplicity.OneToMany ||
      connector.Source.Multiplicity === Multiplicity.ZeroToMany
    ));
  }

  static isManyToMany(connector: ConnectorObject): boolean {
    return ((
      connector.Target.Multiplicity === Multiplicity.Many ||
      connector.Target.Multiplicity === Multiplicity.OneToMany ||
      connector.Target.Multiplicity === Multiplicity.ZeroToMany) && (
      connector.Source.Multiplicity === Multiplicity.Many ||
      connector.Source.Multiplicity === Multiplicity.OneToMany ||
      connector.Source.Multiplicity === Multiplicity.ZeroToMany
    ));
  }
}
