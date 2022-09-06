/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

'use strict';

import * as path from 'path';
import * as fs from 'fs'
import { commands, workspace, ExtensionContext, window } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions
} from 'vscode-languageclient/node';

let client: LanguageClient | null;

const reginoHome = (): string | null => {
    const config = workspace.getConfiguration("regino")

    const home = config.get<string>("home")
    if (home && fs.existsSync(home)) {
        return home
    }
    return null
}
const reginoBin = (): string | null => {
    const config = workspace.getConfiguration("regino")

    const bin = config.get<string>("compiler")
    window.showInformationMessage(
        bin
    );
    window.showInformationMessage(
        fs.existsSync(bin).toString()
    );
    return bin
    if (bin && fs.existsSync(bin)) {
        return bin
    }
    return null
}

export function newClient(): LanguageClient | null {
    const serverCommand = "regino"
    if (!serverCommand) {
        window.showInformationMessage(
            "No 'regino'(compiler) binary could be found in PATH environment variable",
        );
        return null;
    } else {
        const args: string[] = ["lsp"]
        let options = {
            // cwd: folder.uri.fsPath,
            detached: false,
            // shell: false,
        };
        const serverOptions: ServerOptions = {
            run: { command: serverCommand, args: args, options: options },
            debug: { command: serverCommand, args: args, options: options }
        };

        const clientOptions: LanguageClientOptions = {
            documentSelector: [{ scheme: 'file', language: 'regino' }],
            synchronize: {
                // Notify the server about file changes to '.clientrc files contained in the workspace
                fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
            }
        };

        // Create the language client and start the client.
        return new LanguageClient(
            'reginoLanguageServer',
            'Regino Language Server',
            serverOptions,
            clientOptions
        );
    }
}
export function activate(context: ExtensionContext) {
    // const serverCommand = reginoBin() + " lsp"

    // Initialize language client
    client = newClient()

    // Start the client. This will also launch the server
    client.start();

    // Register restart commands
    const command = "vscode-regino.restart-lsp"
    const commandHandler = () => {
        client.stop()
        client = newClient()
        client.start()
    }
    context.subscriptions.push(commands.registerCommand(command, commandHandler))
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}