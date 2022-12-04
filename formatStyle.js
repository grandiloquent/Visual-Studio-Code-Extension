const vscode = require('vscode');
const {getFileName, changeExtension} = require("./utils");
const fs = require('fs');

module.exports = () => {
    const editor = vscode.window.activeTextEditor;

    const selection = editor.selection;
    const s = editor.document.getText(selection);
    let k, ss;

    const match = /(<*?[a-zA-Z0-9_-]+) (style="([^"]+)")/.exec(s);
    k = match[1]
    ss = match[3];


    let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
    let validFullRange = editor.document.validateRange(invalidRange);
    const text = editor.document.getText()
    if (text.indexOf("</style>") !== -1) {
        let str =k.startsWith('<') ? text
            .replace('</style>', `${k.slice(1)}{
            ${ss}
            }
            </style>
            `)
            .replaceAll(match[2], ``) : text
            .replace('</style>', `.${k}{
            ${ss}
            }
            </style>
            `).replace(match[0], `class="${k}"`)
            .replaceAll(match[2], `class="${k}"`);
        editor.edit(
            edit =>
                edit.replace(validFullRange, str));
    } else {
        console.log(k)
        let fileName = changeExtension(getFileName(), ".css");
        if (fs.existsSync(fileName)) {
            let string = fs.readFileSync(fileName).toString();
            string += k.startsWith('<') ? `${k.slice(1)}{
            ${ss}
            }` : `.${k}{
            ${ss}
            }`
            fs.writeFileSync(fileName, string);
        }
        let str = k.startsWith('<') ? text
            .replaceAll(match[2], ``) : text
            .replace(match[0], `class="${k}"`)
            .replaceAll(match[2], `class="${k}"`);
        editor.edit(
            edit =>
                edit.replace(validFullRange, str));
    }

}