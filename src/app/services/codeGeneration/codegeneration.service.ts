import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Diagram } from '@syncfusion/ej2-angular-diagrams';
import { DataType } from '../../interfaces/classproperty.interface';
import { Multiplicity } from '../../interfaces/multiplicity.interface';

interface Property {
  Name: string;
  Type: DataType;
}

interface Connection {
  Class: ClassObject;
  Multiplicity: Multiplicity;
}

interface ClassObject {
  Id: string;
  Title: string;
  Properties: Property[];
}

interface ConnectorObject {
  Source: Connection;
  Target: Connection;
}

interface DiagramObject {
  Classes: ClassObject[];
  Connectors: ConnectorObject[];
}

export class CodeGenerationService {
  public static async generateZipDownload(diagram: Diagram) {
    const zip = new JSZip();
    const jsonData = this.ObjectFromDiagram(diagram);
    const response = await fetch('generated.zip');
    const zipTemplate = await response.arrayBuffer();
    const loadedZip = await zip.loadAsync(zipTemplate);
    jsonData.Classes.forEach((classObj) => {
      loadedZip.file(
        `src/main/java/com/umlonk/generated/controller/${this.PascalCase(classObj.Title)}Controller.java`,
        this.ClassToController(classObj),
      );
      loadedZip.file(
        `src/main/java/com/umlonk/generated/dto/${this.PascalCase(classObj.Title)}DTO.java`,
        this.ClassToDTO(classObj, jsonData.Connectors),
      );
      loadedZip.file(
        `src/main/java/com/umlonk/generated/model/${this.PascalCase(classObj.Title)}.java`,
        this.ClassToEntity(classObj, jsonData.Connectors),
      );
      loadedZip.file(
        `src/main/java/com/umlonk/generated/repo/${this.PascalCase(classObj.Title)}Repo.java`,
        this.ClassToRepo(classObj),
      );
      loadedZip.file(
        `src/main/java/com/umlonk/generated/service/${this.PascalCase(classObj.Title)}Service.java`,
        this.ClassToService(classObj, jsonData.Connectors),
      );
    });
    loadedZip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'generated_files.zip');
    });
  }

  static ObjectFromDiagram(diagram: Diagram): DiagramObject {
    const Classes: ClassObject[] = this.ClassesFromDiagram(diagram);
    const Connectors: ConnectorObject[] = this.ConnectorsFromDiagram(
      diagram,
      Classes,
    );
    return { Classes: Classes, Connectors: Connectors };
  }

  static ClassesFromDiagram(diagram: Diagram): ClassObject[] {
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

  static ConnectorsFromDiagram(
    diagram: Diagram,
    classes: ClassObject[],
  ): ConnectorObject[] {
    const res: ConnectorObject[] = [];
    diagram.connectors.forEach((connector) => {
      if (connector.sourceID != null && connector.targetID != null)
        res.push({
          Source: {
            Class: this.GetClassObject(connector.sourceID, classes)!,
            Multiplicity: connector.annotations![0].content as Multiplicity,
          },
          Target: {
            Class: this.GetClassObject(connector.targetID, classes)!,
            Multiplicity: connector.annotations![1].content as Multiplicity,
          },
        });
    });
    return res;
  }

  static CamelCase(string: string): string {
    return string[0].toLowerCase() + string.substring(1);
  }

  static PascalCase(string: string): string {
    return string[0].toUpperCase() + string.substring(1);
  }
  static SnakeCase(string: string): string {
    return string.replace(' ', '').replace('-', '').toLowerCase()
  }

  static GetClassObject(
    classID: string,
    classes: ClassObject[],
  ): ClassObject | undefined {
    return classes.find((classObj) => classID === classObj.Id);
  }

  static ClassToController(classObject: ClassObject): string {
    const Ptitle = this.PascalCase(classObject.Title);
    const Ctitle = this.CamelCase(classObject.Title);
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
    public ${Ptitle}DTO update${Ptitle}(@RequestBody ${Ptitle}DTO ${Ctitle}DTO) {
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

  static ClassToDTO(classObject: ClassObject, connectors: ConnectorObject[]): string {
    const Ptitle = this.PascalCase(classObject.Title);
    let string =

`package com.umlonk.generated.dto;

import jakarta.persistence.Entity;
import java.util.List;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${Ptitle}DTO {
    private Long id;
`;
    classObject.Properties.forEach((property) => {
      string += `    private ${property.Type} ${this.CamelCase(property.Name)};\n`;
    });
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        if (this.IsOneToOne(connector)) {
          string += `    private Long ${this.CamelCase(isSource ? target.Title : source.Title)}Id;\n`;
        }
      }
    });
    string += `}`;
    return string;
  }

  static ClassToEntity(classObject: ClassObject, connectors: ConnectorObject[]): string {
    let string =
`import jakarta.persistence.*;
import java.util.List;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
public class ${this.PascalCase(classObject.Title)} {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
`;
    classObject.Properties.forEach((property) => {
      string += `    private ${property.Type} ${this.CamelCase(property.Name)};\n`;
    });
    connectors.forEach((connector) => {
        const source = connector.Source.Class;
        const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = connector.Source.Class.Id === classObject.Id;
        if (this.IsOneToOne(connector)) {
          const belongsToSource = connector.Source.Multiplicity === Multiplicity.ZeroToOne || connector.Target.Multiplicity === Multiplicity.One;
          console.log(connector.Source.Class.Title + ' - ' + connector.Target.Class.Title)
          console.log(`Class: ${classObject.Title}`)
          console.log(`isSource: ${isSource}`)
          console.log(`belongsToSource: ${belongsToSource}`)
          string += `    @OneToOne(${isSource === belongsToSource ? 'cascade=CascadeType.ALL' : `mappedBy = "${this.CamelCase(isSource ? source.Title : target.Title)}"`})\n`;
          if (isSource === belongsToSource) string += `    @JoinColumn(name="${this.SnakeCase(isSource ? target.Title : source.Title)}_id")\n`;
          string += `    private ${this.PascalCase(isSource ? target.Title : source.Title)} ${this.CamelCase(isSource ? target.Title : source.Title)}\n;`;
        }
      }
    });
    string += `}`;
    return 'package com.umlonk.generated.model;\n\n' + string;
  }

  static ClassToRepo(classObject: ClassObject): string {
    const Ptitle = this.PascalCase(classObject.Title);
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

  static ClassToService(classObject: ClassObject, connectors: ConnectorObject[]): string {
    const Ptitle = this.PascalCase(classObject.Title);
    const Ctitle = this.CamelCase(classObject.Title);
    let string =
`package com.umlonk.generated.service;

import com.umlonk.generated.model.${Ptitle};
import com.umlonk.generated.dto.${Ptitle}DTO;
import com.umlonk.generated.repo.${Ptitle}Repo;
`;
    connectors.forEach((connector) => {
        const source = connector.Source.Class;
        const target = connector.Target.Class;
        if (source.Id === classObject.Id || target.Id === classObject.Id) {
          const isSource = source.Id === classObject.Id;
          if (this.IsOneToOne(connector)) {
            string += `import com.umlonk.generated.model.${this.PascalCase(isSource ? target.Title : source.Title)};\n`;
          }
        }
    });
string += `import jakarta.persistence.EntityManager;
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
        if (this.IsOneToOne(connector))
          string += `                    skip(destination.get${this.PascalCase(isSource ? target.Title : source.Title)}());\n`
        }
      }
    );
    string += `           }
            });
      } catch(ConfigurationException a) {}
    }

    public List<${Ptitle}DTO> getAll${Ptitle}s() {
        List<${Ptitle}> ${Ctitle}List = ${Ctitle}Repository.findAll();
        return modelMapper.map(${Ctitle}List, new TypeToken<List<${Ptitle}DTO>>() {}.getType());
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
        const property = this.PascalCase(isSource ? target.Title : source.Title);
        if (this.IsOneToOne(connector))
          string +=
`        if (${Ctitle}DTO.get${property}Id() != null)
            ${Ctitle}.set${property}(entityManager.getReference(${property}.class, ${Ctitle}DTO.get${property}Id()));
        else ${Ctitle}.set${property}(null);\n`
      }
    });
        string +=
`        ${Ctitle}Repository.save(${Ctitle});
        return ${Ctitle}DTO;
    }

    public ${Ptitle}DTO update${Ptitle}(${Ptitle}DTO ${Ctitle}DTO) {
        mapperSetup();
        ${Ptitle} ${Ctitle} = ${Ctitle}Repository.findById(${Ctitle}DTO.getId()).orElseThrow();
        modelMapper.map(${Ctitle}DTO, ${Ctitle});
`;
    connectors.forEach((connector) => {
      const source = connector.Source.Class;
      const target = connector.Target.Class;
      if (source.Id === classObject.Id || target.Id === classObject.Id) {
        const isSource = source.Id === classObject.Id;
        const property = this.PascalCase(isSource ? target.Title : source.Title);
        if (this.IsOneToOne(connector))
          string +=
`        if (${Ctitle}DTO.get${property}Id() != null)
            ${Ctitle}.set${property}(entityManager.getReference(${property}.class, ${Ctitle}DTO.get${property}Id()));
        else ${Ctitle}.set${property}(null);\n`
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

  static IsOneToOne(connector: ConnectorObject): boolean {
    return ((
      connector.Source.Multiplicity === Multiplicity.One ||
      connector.Source.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Target.Multiplicity === Multiplicity.One ||
      connector.Target.Multiplicity === Multiplicity.ZeroToOne
    ))
  }

  static IsOneToMany(connector: ConnectorObject): boolean {
    return ((
      connector.Source.Multiplicity === Multiplicity.One ||
      connector.Source.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Target.Multiplicity === Multiplicity.Many ||
      connector.Target.Multiplicity === Multiplicity.OneToMany ||
      connector.Target.Multiplicity === Multiplicity.ZeroToMany
    ))
  }

  static IsManyToOne(connector: ConnectorObject): boolean {
    return ((
      connector.Target.Multiplicity === Multiplicity.One ||
      connector.Target.Multiplicity === Multiplicity.ZeroToOne) && (
      connector.Source.Multiplicity === Multiplicity.Many ||
      connector.Source.Multiplicity === Multiplicity.OneToMany ||
      connector.Source.Multiplicity === Multiplicity.ZeroToMany
    ))
  }

  static IsManyToMany(connector: ConnectorObject): boolean {
    return ((
      connector.Target.Multiplicity === Multiplicity.Many ||
      connector.Target.Multiplicity === Multiplicity.OneToMany ||
      connector.Target.Multiplicity === Multiplicity.ZeroToMany) && (
      connector.Source.Multiplicity === Multiplicity.Many ||
      connector.Source.Multiplicity === Multiplicity.OneToMany ||
      connector.Source.Multiplicity === Multiplicity.ZeroToMany
    ))
  }
}
