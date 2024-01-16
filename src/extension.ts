import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function ensureDirectoryExistence(filePath: string) {
	const dirname = path.dirname(filePath);
	if (!fs.existsSync(dirname)) {
		fs.mkdirSync(dirname, { recursive: true });
	}
}

function writeJsonToFile(filePath: string, obj: any) {
	ensureDirectoryExistence(filePath);
	fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), { encoding: 'utf8' });
}

export function activate(context: vscode.ExtensionContext) {
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
		const customFortranPath = config.get<string>('customFortranPath');
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

export function deactivate() { }
