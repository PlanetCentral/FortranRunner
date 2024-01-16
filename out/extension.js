"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}
function writeJsonToFile(filePath, obj) {
    ensureDirectoryExistence(filePath);
    fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), { encoding: 'utf8' });
}
function activate(context) {
    let disposable = vscode.commands.registerCommand('fortran-configurator.createConfigFiles', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('Open a workspace before running this command.');
            return;
        }
        const currentWorkspacePath = workspaceFolders[0].uri.fsPath;
        const vscodeDirPath = path.join(currentWorkspacePath, '.vscode');
        ensureDirectoryExistence(vscodeDirPath);
        const config = vscode.workspace.getConfiguration('fortranConfigurator');
        const customFortranPath = config.get('customFortranPath');
        const fortranCommand = customFortranPath || "gfortran";
        const launchConfig = {
            "version": "0.2.0",
            "configurations": [
                {
                    "name": "Run Fortran",
                    "type": "cppvsdbg",
                    "request": "launch",
                    "program": "${fileDirname}\\${fileBasenameNoExtension}.exe",
                    "args": [],
                    "stopAtEntry": false,
                    "cwd": "${workspaceFolder}",
                    "environment": [],
                    "console": "integratedTerminal",
                    "preLaunchTask": "Build Fortran"
                }
            ]
        };
        const taskConfig = {
            "version": "2.0.0",
            "tasks": [
                {
                    "label": "Build Fortran",
                    "type": "shell",
                    "command": fortranCommand,
                    "args": [
                        "-g",
                        "${file}",
                        "-o",
                        "${fileDirname}\\${fileBasenameNoExtension}.exe"
                    ],
                    "group": {
                        "kind": "build",
                        "isDefault": true
                    }
                }
            ]
        };
        writeJsonToFile(path.join(vscodeDirPath, 'launch.json'), launchConfig);
        writeJsonToFile(path.join(vscodeDirPath, 'tasks.json'), taskConfig);
        vscode.window.showInformationMessage('Success! Fortran launch and tasks config files have been created.');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map