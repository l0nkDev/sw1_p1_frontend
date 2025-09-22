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
        this.ClassToService(classObj),
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
            Multiplicity: connector.annotations![0].content as Multiplicity,
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

  static GetClassObject(
    classID: string,
    classes: ClassObject[],
  ): ClassObject | undefined {
    return classes.find((classObj) => classID === classObj.Id);
  }

  static ClassToController(classObject: ClassObject): string {
    const string =
`package com.umlonk.generated.controller;

import com.umlonk.generated.dto.${this.PascalCase(classObject.Title)}DTO;
import com.umlonk.generated.service.${this.PascalCase(classObject.Title)}Service;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
@RequestMapping(value = "api/v1/")
public class ${this.PascalCase(classObject.Title)}Controller {

    @Autowired
    private ${this.PascalCase(classObject.Title)}Service ${this.CamelCase(classObject.Title)}Service;

    @GetMapping("/get${this.CamelCase(classObject.Title)}s")
    public List<${this.PascalCase(classObject.Title)}DTO> get${this.PascalCase(classObject.Title)}() {
        return ${this.CamelCase(classObject.Title)}Service.getAll${this.PascalCase(classObject.Title)}s();
    }

    @PostMapping("/save${this.CamelCase(classObject.Title)}")
    public ${this.PascalCase(classObject.Title)}DTO save${this.PascalCase(classObject.Title)}(@RequestBody ${this.PascalCase(classObject.Title)}DTO ${this.CamelCase(classObject.Title)}DTO) {
        return ${this.CamelCase(classObject.Title)}Service.save${this.PascalCase(classObject.Title)}(${this.CamelCase(classObject.Title)}DTO);
    }

    @PutMapping("/update${this.CamelCase(classObject.Title)}")
    public ${this.PascalCase(classObject.Title)}DTO update${this.PascalCase(classObject.Title)}(@RequestBody ${this.PascalCase(classObject.Title)}DTO ${this.CamelCase(classObject.Title)}DTO) {
        return ${this.CamelCase(classObject.Title)}Service.update${this.PascalCase(classObject.Title)}(${this.CamelCase(classObject.Title)}DTO);
    }

    @DeleteMapping("delete${this.CamelCase(classObject.Title)}/{${this.CamelCase(classObject.Title)}Id}")
    public String delete${this.PascalCase(classObject.Title)}(@PathVariable int ${this.CamelCase(classObject.Title)}Id) {
        return ${this.CamelCase(classObject.Title)}Service.delete${this.PascalCase(classObject.Title)}(${this.CamelCase(classObject.Title)}Id);
    }
}`;
    return string;
  }

  static ClassToDTO(classObject: ClassObject, connectors: ConnectorObject[]): string {
    let string =
`package com.umlonk.generated.dto;

import jakarta.persistence.Entity;
import java.util.List;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ${this.PascalCase(classObject.Title)}DTO {
    private Long id;
`;
    classObject.Properties.forEach((property) => {
      string += `   private ${property.Type} ${this.CamelCase(property.Name)};\n`;
    });
    connectors.forEach((connector) => {
      if (connector.Source.Class.Id === classObject.Id) {
        const sourceMult = connector.Source.Multiplicity;
        const targetMult = connector.Target.Multiplicity;
        if (this.IsOneToOne(connector)) {
          if (sourceMult !== Multiplicity.One || targetMult !== Multiplicity.ZeroToOne) {
            string += `    private Long ${this.CamelCase(connector.Target.Class.Title)}Id;`;
          }
        }
      }
      if (connector.Target.Class.Id === classObject.Id) {
        const sourceMult = connector.Source.Multiplicity;
        const targetMult = connector.Target.Multiplicity;
        if (this.IsOneToOne(connector)) {
          if (sourceMult === Multiplicity.One && targetMult === Multiplicity.ZeroToOne) {
            string += `    private Long ${this.CamelCase(connector.Source.Class.Title)}Id;`;
          }
        }
      }
    });
    string += `}`;
    return string;
  }

  static ClassToEntity(classObject: ClassObject, connectors: ConnectorObject[]): string {
    let string =
`import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToMany;
import java.util.List;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;

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
      if (connector.Source.Class.Id === classObject.Id) {
        const sourceMult = connector.Source.Multiplicity;
        const targetMult = connector.Target.Multiplicity;
        if (this.IsOneToOne(connector)) {
          if (sourceMult !== Multiplicity.One || targetMult !== Multiplicity.ZeroToOne) {
            string = `import com.umlonk.generated.model.${this.PascalCase(connector.Target.Class.Title)};\n` + string;
            string += `    @OneToOne\n    private ${this.PascalCase(connector.Target.Class.Title)} ${this.CamelCase(connector.Target.Class.Title)};`;
          }
        }
      }
      if (connector.Target.Class.Id === classObject.Id) {
        const sourceMult = connector.Source.Multiplicity;
        const targetMult = connector.Target.Multiplicity;
        if (this.IsOneToOne(connector)) {
          if (sourceMult === Multiplicity.One && targetMult === Multiplicity.ZeroToOne) {
            string = `import com.umlonk.generated.model.${this.PascalCase(connector.Source.Class.Title)};\n` + string;
            string += `   @OneToOne \n    private ${this.PascalCase(connector.Source.Class.Title)} ${this.CamelCase(connector.Source.Class.Title)};`;
          }
        }
      }
    });
    string += `}`;
    return 'package com.umlonk.generated.model;\n\n' + string;
  }

  static ClassToRepo(classObject: ClassObject): string {
    const string =
`package com.umlonk.generated.repo;

import com.umlonk.generated.model.${this.PascalCase(classObject.Title)};
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ${this.PascalCase(classObject.Title)}Repo extends JpaRepository<${this.PascalCase(classObject.Title)}, Long> {
}`;
    return string;
  }

  static ClassToService(classObject: ClassObject): string {
    const string =
`package com.umlonk.generated.service;

import com.umlonk.generated.model.${this.PascalCase(classObject.Title)};
import com.umlonk.generated.dto.${this.PascalCase(classObject.Title)}DTO;
import com.umlonk.generated.repo.${this.PascalCase(classObject.Title)}Repo;
import jakarta.transaction.Transactional;
import java.util.List;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ${this.PascalCase(classObject.Title)}Service {

    @Autowired
    private ${this.PascalCase(classObject.Title)}Repo ${this.CamelCase(classObject.Title)}Repository;

    @Autowired
    private ModelMapper modelMapper;

    public List<${this.PascalCase(classObject.Title)}DTO> getAll${this.PascalCase(classObject.Title)}s() {
        List<${this.PascalCase(classObject.Title)}> ${this.CamelCase(classObject.Title)}List = ${this.CamelCase(classObject.Title)}Repository.findAll();
        return modelMapper.map(${this.CamelCase(classObject.Title)}List, new TypeToken<List<${this.PascalCase(classObject.Title)}DTO>>() {}.getType());
    }

    public ${this.PascalCase(classObject.Title)}DTO save${this.PascalCase(classObject.Title)}(${this.PascalCase(classObject.Title)}DTO ${this.CamelCase(classObject.Title)}DTO) {
        ${this.CamelCase(classObject.Title)}Repository.save(modelMapper.map(${this.CamelCase(classObject.Title)}DTO, ${this.PascalCase(classObject.Title)}.class));
        return ${this.CamelCase(classObject.Title)}DTO;
    }

    public ${this.PascalCase(classObject.Title)}DTO update${this.PascalCase(classObject.Title)}(${this.PascalCase(classObject.Title)}DTO ${this.CamelCase(classObject.Title)}DTO) {
        ${this.CamelCase(classObject.Title)}Repository.save(modelMapper.map(${this.CamelCase(classObject.Title)}DTO, ${this.PascalCase(classObject.Title)}.class));
        return ${this.CamelCase(classObject.Title)}DTO;
    }

    public String delete${this.PascalCase(classObject.Title)}(long ${this.CamelCase(classObject.Title)}Id) {
        ${this.CamelCase(classObject.Title)}Repository.deleteById((${this.CamelCase(classObject.Title)}Id));
        return "${this.PascalCase(classObject.Title)} deleted";
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
