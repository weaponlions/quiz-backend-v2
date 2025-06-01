import { Project } from "ts-morph";
import path from "path";
import fs from "fs";

// Set to your source directory
const sourceDir = "src";

// Initialize a TypeScript project
const project = new Project({
  tsConfigFilePath: "tsconfig.json",
});

// Add all .ts files in your project
project.addSourceFilesAtPaths(`${sourceDir}/**/*.ts`);

// Process each file
const sourceFiles = project.getSourceFiles();
sourceFiles.forEach((sourceFile) => {
  let hasModifications = false;

  sourceFile.getImportDeclarations().forEach((importDecl) => {
    const moduleSpecifier = importDecl.getModuleSpecifierValue();

    // Skip node_modules imports or already having .ts
    if (
      moduleSpecifier.startsWith(".") &&
      !moduleSpecifier.endsWith(".ts") &&
      !moduleSpecifier.endsWith(".js")
    ) {
      const importingFilePath = sourceFile.getFilePath();
      const importFilePath = path.resolve(
        path.dirname(importingFilePath),
        moduleSpecifier
      );

      // Check if .ts file exists
      if (fs.existsSync(importFilePath + ".ts")) {
        importDecl.setModuleSpecifier(moduleSpecifier + ".ts");
        hasModifications = true;
      }
    }
  });

  if (hasModifications) {
    sourceFile.saveSync();
    console.log(`Updated imports in: ${sourceFile.getFilePath()}`);
  }
});
