"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_morph_1 = require("ts-morph");
var path_1 = require("path");
var fs_1 = require("fs");
// Set to your source directory
var sourceDir = "src";
// Initialize a TypeScript project
var project = new ts_morph_1.Project({
    tsConfigFilePath: "tsconfig.json",
});
// Add all .ts files in your project
project.addSourceFilesAtPaths("".concat(sourceDir, "/**/*.ts"));
// Process each file
var sourceFiles = project.getSourceFiles();
sourceFiles.forEach(function (sourceFile) {
    var hasModifications = false;
    sourceFile.getImportDeclarations().forEach(function (importDecl) {
        var moduleSpecifier = importDecl.getModuleSpecifierValue();
        // Skip node_modules imports or already having .ts
        if (moduleSpecifier.startsWith(".") &&
            !moduleSpecifier.endsWith(".ts") &&
            !moduleSpecifier.endsWith(".js")) {
            var importingFilePath = sourceFile.getFilePath();
            var importFilePath = path_1.default.resolve(path_1.default.dirname(importingFilePath), moduleSpecifier);
            // Check if .ts file exists
            if (fs_1.default.existsSync(importFilePath + ".ts")) {
                importDecl.setModuleSpecifier(moduleSpecifier + ".ts");
                hasModifications = true;
            }
        }
    });
    if (hasModifications) {
        sourceFile.saveSync();
        console.log("Updated imports in: ".concat(sourceFile.getFilePath()));
    }
});
