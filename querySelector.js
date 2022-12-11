const vscode = require('vscode');
const {insertText, readText, camel} = require("./utils");

const COMMAND = 'extension.querySelector';

module.exports = (context) => {
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND, async () => {
        const strings = (await readText()).trim();
        insertText(`const ${camel(strings)} = this.root.querySelector('.${strings}');
    ${camel(strings)}.addEventListener('click', evt => {
                evt.stopPropagation();
            });
    `);
    }));
}

/*
require('./querySelector')();
*/