const vscode = require('vscode');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36';
const fs = require('fs');
const {
    camel,
    changeExtension,
    executeSQL,
    fetchStringAsync,
    getSelectionText,
    substringAfter,
    substringAfterLast,
    substringBefore,
    substringBeforeLast,
    upperCamel, sortFunctions, replaceSelection, formatHtml, createSplitFile, compileC, formatClasses, translate,
    capitalize
} = require("./utils");


function activate(context) {

    require('./newFile')(context);
    // Ctrl+W
    let disposable = vscode.commands.registerCommand('extension.generateGetterAndSetters', async function () {
        //compileC()
        // const s = await vscode.env.clipboard.readText();
        // const k = [...s.matchAll(/class="([^"]+)"/g)].map(x => x[1]);
        // let value = '';
        // const b1 = [];
        // const b2 = [];
        // const b3 = [];
        // const b4 = [];
        // for (const string of k) {
        //     b1.push(`const ${camel(string)} = this.root.querySelector('.${string}');`);
        //     b2.push(`else if (attrName === '${string}') {
        //     this.root.querySelector('.${string}').textContent = newVal;
        //     }`);
        //     b3.push(`"${string}"`)
        //     b4.push(`element.setAttribute("${string}","");`)
        // }
        // value = `/*
        // ${b3.join(',')}
        // ${b1.join('\n')}${b2.join('\n')}
        // ${b4.join('\n')}
        // */`
        // const editor = vscode.window.activeTextEditor;
        // if (!editor)
        //     return; // No open text editor
        // try {
        //
        //     editor.edit(
        //         edit => editor.selections.forEach(
        //             selection => {
        //                 edit.replace(selection, value);
        //             }
        //         )
        //     );
        //     vscode.commands.executeCommand('editor.action.formatSelection');
        // } catch (error) {
        //     console.log(error);
        //     vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
        // }

        require('./querySelector')();
    });

    context.subscriptions.push(disposable);

    // Ctrl+Q
    let generateCode = vscode.commands.registerCommand('extension.generateCode', async function () {
        replaceSelection(async (text) => {
            // return `${camel(text)}`;
            /*return `static async Task<String> ${capitalize(camel(await translate(text)))}(String url){
var client = new HttpClient(new HttpClientHandler
    {
        UseProxy = false
    });
  return  await client.GetStringAsync(url);
}`;*/
            return `${camel(await translate(text))}`;
        })
    });
    context.subscriptions.push(generateCode);

    // Ctrl+D
    let generateTranslate = vscode.commands.registerCommand('extension.generateTranslate', async function () {
        replaceSelection(async (text) => {
            return JSON.parse(await fetchStringAsync({
                method: "GET",
                hostname: "kingpunch.cn",
                path: "/translate?q=" + encodeURIComponent(text),
            }))['sentences'].map(x => x['trans']).join('\n');
        })
    });
    context.subscriptions.push(generateTranslate);

    context.subscriptions.push(vscode.commands.registerCommand('extension.formatClasses', function () {
        require('./formatStyle')()
    }));

    let generateReplace = vscode.commands.registerCommand('extension.generateReplace', async function () {

        const editor = vscode.window.activeTextEditor;

        const selection = editor.selection;
        const s = editor.document.getText(selection);
        let k, ss;

        const match = /([a-zA-Z0-9-]+) (style="([^"]+)")/.exec(s);
        k = match[1]
        ss = match[3];

        let invalidRange = new vscode.Range(0, 0, editor.document.lineCount, 0);
        let validFullRange = editor.document.validateRange(invalidRange);
        let str = editor.document.getText().replace(match[0], `class="${k}"`);
        str = str.replaceAll(match[2], `class="${k}"`);
        editor.edit(
            edit =>
                edit.replace(validFullRange, str));
        /*

            .replace('</style>', `.${k}{
            ${ss}
            }
            </style>
            `)
        */
        let fileName = changeExtension(vscode.window.activeTextEditor.document.fileName, ".wxss");
        if (fs.existsSync(fileName)) {
            let content = fs.readFileSync(fileName)
            content += `.${k}{
            ${ss}
            }
            `
            fs.writeFileSync(fileName, content);
        }
    });
    context.subscriptions.push(generateReplace);


    let generateTemplate = vscode.commands.registerCommand('extension.generateTemplate', async function () {
        var editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.edit(function (edit) {
                for (let index = 0; index < editor.document.lineCount; index++) {
                    let line = editor.document.lineAt(index);
                    if (line.isEmptyOrWhitespace) {
                        edit.delete(line.rangeIncludingLineBreak);
                    }
                }

            }).then(function () {
                //add save feature
                if (autoSaveOption) {
                    editor.document.save();
                }
            });

        }

    });
    context.subscriptions.push(generateTemplate);

    let generateComponent = vscode.commands.registerCommand('extension.generateComponent', async function () {
        // try {
        //     const res = await executeSQL(getSelectionText(vscode))
        //     // https://code.visualstudio.com/api/references/vscode-api
        //     vscode.window.showInformationMessage(JSON.stringify(res.rows));
        // } catch (e) {
        //     vscode.window.showErrorMessage(e.message);
        // }
        require('./components')();
    });
    context.subscriptions.push(generateComponent);
    context.subscriptions.push(vscode.commands.registerCommand('extension.formatStyleSheet', () => {
        require("./stylesheets")();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('extension.formatWeixinStyleSheet', () => {
        replaceSelection(async (s) => {
            const text = await vscode.env.clipboard.readText();
            return `<view style="${substringAfter(text.replaceAll(/([\d.]+)px/g, m => {
                return parseFloat(m) * 2 + 'rpx'
            }).replaceAll(/[\t\r\n]+/g, '')
                .replaceAll(/;\s+/g, ';'), '-webkit-font-smoothing: antialiased;')}">
</view>`;
        });
    }));
    let generateSort = vscode.commands.registerCommand('extension.generateSort', async function () {
        await replaceSelection((data) => {
            return sortFunctions(data)
        })
    });
    context.subscriptions.push(generateSort);

    context.subscriptions.push(vscode.commands.registerCommand('extension.generateComments', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor)
                return; // No open text editor

            const selection = editor.selection;
            const text = editor.document.getText(selection);
            try {
                if (text.length < 1) {
                    const value = `/*
${await vscode.env.clipboard.readText()}         
 */`
                    editor.edit(
                        edit => editor.selections.forEach(
                            selection => {
                                edit.replace(selection, value);
                            }
                        )
                    );
                } else {
                    formatHtml();
                }

                vscode.commands.executeCommand('editor.action.formatSelection');
            } catch (error) {
                console.log(error);
                vscode.window.showErrorMessage('Something went wrong! Try that the properties are in this format: "private String name;"');
            }
        }
    ))
    ;
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}

exports.deactivate = deactivate;















