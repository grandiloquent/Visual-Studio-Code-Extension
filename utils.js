const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36';
const {exec} = require("child_process");
// https://github.com/brianc/node-postgres
const {Client} = require('pg');
const https = require('https');
const vscode = require('vscode');

function camel(string) {
    string = string.replaceAll(/[ _-]([a-zA-Z])/g, m => m[1].toUpperCase());
    return string.slice(0, 1).toLowerCase() + string.slice(1);
}

function changeExtension(path, extension) {
    let s = path;
    for (let i = path.length; --i >= 0;) {
        if (path[i] === '.') {
            s = path.substring(0, i);
            break;
        }
    }
    if (extension != null && path.length !== 0) {
        if (extension.length === 0 || extension[0] !== '.') {
            s = s + ".";
        }
        s = s + extension;
    }
    return s;
}

function executeSQL(text) {
    return new Promise(((resolve, reject) => {
        const client = new Client({
            user: '',
            host: '',
            database: '',
            password: '',
            port: 3389,
        })
        client.connect()
        client.query(text, (err, res) => {
            if (err) {
                reject(err)
                return
            }
            console.log(res)
            resolve(res)
        })
    }))
}

function fetchStringAsync(args, isRaw, data) {
    const options = Object.assign({
        port: 80,
    }, args);
    if (!options.headers) {
        options.headers = {
            'User-Agent': USER_AGENT
        };
    } else if (!options.headers['User-Agent']) {
        options.headers['User-Agent'] = USER_AGENT;
    }
    return new Promise((reslove, reject) => {
        const req = require('http').request(options, res => {
            //let data = '';
            const chunks = [];
            res.on('data', chunk => {
                //data += d;
                chunks.push(chunk);
            });
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                if (isRaw) {
                    reslove(body);
                } else {
                    reslove(body.toString());
                }
            });
        });
        req.on('error', error => {
            reject(error);
        })
        req.on('timeout', () => {
            reject(new Error('timeout'));
        });
        if (data) {
            req.write(data);
        }
        req.end();
    })
}

function getSelectionText(vscode) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return; // No open text editor
    const selection = editor.selection;
    return editor.document.getText(selection);
}

function getStringAsync(args, isRaw) {
    const options = Object.assign({
        port: 443,
    }, args);
    if (!options.headers) {
        options.headers = {
            'User-Agent': USER_AGENT
        };
    } else if (!options.headers['User-Agent']) {
        options.headers['User-Agent'] = USER_AGENT;
    }
    return new Promise((reslove, reject) => {
        const req = https.request(options, res => {
            //let data = '';
            const chunks = [];
            res.on('data', chunk => {
                //data += d;
                chunks.push(chunk);
            });
            res.on('end', () => {
                const body = Buffer.concat(chunks);
                if (isRaw) {
                    reslove(body);
                } else {
                    reslove(body.toString());
                }
            });
        });
        req.on('error', error => {
            reject(error);
        })
        req.on('timeout', () => {
            reject(new Error('timeout'));
        });
        req.end();
    })
}

function kebab(string) {
    return string.replaceAll(/(?<=[a-z])[A-Z]/g, m => `_${m}`).toLowerCase()
        .replaceAll(/[ -]([a-z])/g, m => `-${m[1]}`)
}

function snake(string) {
    return string.replaceAll(/(?<=[a-z])[A-Z]/g, m => `_${m}`).toLowerCase()
        .replaceAll(/[ -]([a-z])/g, m => `_${m[1]}`)
}

function sortFunctions(string) {
    return toBlocks(string.replaceAll(/{}/g,"<<<--->>>"))
        .sort((x, y) => {
            return substringAfterLast(substringBefore(x, '(').trim(), ' ').localeCompare(substringAfterLast(substringBefore(y, '(').trim(), ' '))
        }).join('').replaceAll(/<<<--->>>/g,"{}");
}

function substringAfter(string, delimiter, missingDelimiterValue) {
    const index = string.indexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

function substringAfterLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(index + delimiter.length);
    }
}

function substringBefore(string, delimiter, missingDelimiterValue) {
    const index = string.indexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function substringBeforeLast(string, delimiter, missingDelimiterValue) {
    const index = string.lastIndexOf(delimiter);
    if (index === -1) {
        return missingDelimiterValue || string;
    } else {
        return string.substring(0, index);
    }
}

function toBlocks(string) {
    let count = 0;
    let buf = [];
    const blocks = [];
    for (let i = 0; i < string.length; i++) {
        buf.push(string[i])
        if (string[i] === '{') {
            count++;
        } else if (string[i] === '}') {
            count--;
            if (count === 0) {
                blocks.push(buf.join(''))
                buf = [];
            }
        }
    }
    return blocks;
}

function toPascalCase(str) {
    return str.replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1));
}

function upperCamel(string) {
    string = camel(string);
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}

async function replaceSelection(action) {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return; // No open text editor

    const selection = editor.selection;
    const text = editor.document.getText(selection);

    // if (text.length < 1) {
    //     vscode.window.showErrorMessage('No selected properties.');
    //     return;
    // }
    try {
        const value = await action(text);
        editor.edit(
            edit => editor.selections.forEach(
                selection => {
                    edit.replace(selection, value);
                }
            )
        );
        vscode.commands.executeCommand('editor.action.formatSelection');
    } catch (error) {
        console.log(error);
        vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
    }
}

function formatHtml() {
    require("./Beautifier").default.beautify(vscode.window.activeTextEditor.document);
}

function createSplitFile() {
    let fileName = vscode.window.activeTextEditor.document.fileName;
    // https://nodejs.org/api/fs.html
    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    const s = editor.document.getText(selection) || 'utils';
    if (fileName.endsWith(".js")) {
        fileName = substringBeforeLast(fileName, ".") + "." + s + ".js"

        if (!fs.existsSync(fileName))
            fs.writeFileSync(fileName, `
        /*
        <!--
        <script src="${substringAfterLast(fileName, "\\")}"></script>
        -->
        */
        `);
    } else if (fileName.endsWith(".java")) {
        const name = s.slice(0, 1).toUpperCase() +
            s.slice(1);
        fileName = substringBeforeLast(fileName, ".") + name + ".java"

        if (!fs.existsSync(fileName))
            fs.writeFileSync(fileName, `
       public static class ${name}{
            }
        `);
    } else if (fileName.endsWith(".md")) {
        fileName = substringBeforeLast(fileName, "\\") + "\\" + s + ".md"
        if (!fs.existsSync(fileName))
            fs.writeFileSync(fileName, ``);
    } else if (fileName.endsWith(".go")) {
        fileName = substringBeforeLast(fileName, "\\") + "\\" + s.slice(0, 1).toLowerCase() +
            s.slice(1) + ".go"
        if (!fs.existsSync(fileName))
            fs.writeFileSync(fileName, `package app`);
    }
}

function compileC() {
    const fileName = vscode.window.activeTextEditor.document.fileName;
    if (fileName.endsWith(".c")) {
        const string = fs.readFileSync(fileName).toString();
        fs.unlink("C:\\Users\\Administrator\\Desktop\\main.exe", () => {
        });
        exec(`start cmd /K gcc "${fileName}" -o "C:\\Users\\Administrator\\Desktop\\main.exe" ${string.match(/\/\/(.+)/)[1]}`)
    }
    if (fileName.endsWith(".cpp")) {
        const string = fs.readFileSync(fileName).toString();
        fs.unlink("C:\\Users\\Administrator\\Desktop\\main.exe", () => {
        });
        exec(`cmd /K g++ "${fileName}" -o "C:\\Users\\Administrator\\Desktop\\main.exe" ${string.match(/\/\/(.+)/)[1]} `)
    }
}

function formatClasses() {
    const editor = vscode.window.activeTextEditor;

    const selection = editor.selection;
    const s = editor.document.getText(selection);
    let k, ss;

    const match = /([a-zA-Z0-9-]+) (style="([^"]+)")/.exec(s);
    k = match[1]
    ss = match[3];


    let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
    let validFullRange = editor.document.validateRange(invalidRange);
    let str = editor.document.getText()
        .replace('</style>', `.${k}{
            ${ss}
            }
            </style>
            `).replace(match[0], `class="${k}"`)
        .replaceAll(match[2], `class="${k}"`);
    editor.edit(
        edit =>
            edit.replace(validFullRange, str));
}

async function formatWeChatEventHandler() {
    const fileName = changeExtension(vscode.window.activeTextEditor.document.fileName, ".js");

    // https://nodejs.org/api/fs.html
    const s = await vscode.env.clipboard.readText();
    const content = fs.readFileSync(fileName)
    fs.writeFileSync(fileName, content.toString().replace('},', `
        },
 ${s}(evt) {
        const id = evt.currentTarget.dataset.id;
        },
        `));

    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    editor.edit(
        edit => editor.selections.forEach(
            selection => {
                edit.replace(selection, ` catchtap="${s}" `);
            }
        )
    );
}

async function translate(text) {
    return JSON.parse(await fetchStringAsync({
        method: "GET",
        hostname: "kingpunch.cn",
        path: "/translate?q=" + encodeURIComponent(text),
    }))['sentences'][0]['trans'];
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function getFileName() {
    return vscode.window.activeTextEditor.document.fileName;
}

async function readText() {
    return await vscode.env.clipboard.readText();
}

function insertText(text) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, text);
        });
    }
}

module.exports = {
    camel,
    changeExtension,
    executeSQL,
    fetchStringAsync,
    getSelectionText,
    getStringAsync,
    kebab,
    snake,
    compileC,
    sortFunctions,
    substringAfter,
    substringAfterLast,
    substringBefore,
    substringBeforeLast,
    toBlocks,
    toPascalCase,
    upperCamel, replaceSelection,
    formatHtml,
    createSplitFile,
    formatClasses,
    formatWeChatEventHandler,
    translate,
    capitalize,
    getFileName, readText,
    insertText
}
