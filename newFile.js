const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const {changeExtension} = require("./utils");

const COMMAND = 'extension.generateNewFile';

function replaceParameters(obj, strings) {
    return strings.replaceAll(/{{([^}]+)}}/g,
        m => {
            return obj[/{{([^}]+)}}/.exec(m)[1]];
        });
}

function writeFile(fileName, template, obj) {
    if (!fs.existsSync(fileName)) {
        createFileIfNotExists(template);
        fs.writeFileSync(fileName, replaceParameters(obj, fs.readFileSync(template).toString()));
    }
}
function createWeChatPage(fileName, strings) {
    if (!strings.endsWith(".wxml")) return false;
    let dir = path.dirname(fileName);
    fileName = path.join(dir, strings);
    const obj = {
        name: substringBeforeLast(strings, '.'),
        Name: camel(substringBeforeLast(strings, '.'))
    };
    dir = "C:\\Users\\Administrator\\Desktop\\Resources\\模板";
    [
        ["微信页面Wxml.txt"],
        ["微信页面Wxss.txt", ".wxss"],
        ["微信页面Js.txt", ".js"],
        ["微信页面Json.txt", ".json"],
    ].forEach(k => {
        if (k.length < 2) {
            writeFile(fileName, path.join(dir, k[0]), obj);
        } else {
            writeFile(changeExtension(fileName, k[1]), path.join(dir, k[0]), obj);
        }
    })
}
function createWeChatComponents(fileName, strings) {
    if (!strings.endsWith(".wxss")) return false;
    let dir = path.dirname(fileName);
    fileName = path.join(dir, strings);
    const obj = {
        name: substringBeforeLast(strings, '.'),
        nameName: camel(substringBeforeLast(strings, '.')),
        NameName: upperCamel(substringBeforeLast(strings, '.'))
    };
    dir = "C:\\Users\\Administrator\\Desktop\\Resources\\模板";
    [
        ["微信Wxss.txt"],
        ["微信Wxml.txt", ".wxml"],
        ["微信Js.txt", ".js"],
        ["微信Json.txt", ".json"],
    ].forEach(k => {
        if (k.length < 2) {
            writeFile(fileName, path.join(dir, k[0]), obj);
        } else {
            writeFile(changeExtension(fileName, k[1]), path.join(dir, k[0]), obj);
        }
    })
    vscode.env.clipboard.writeText(`"${obj.name}":"../../components/${obj.name}"
    <${obj.name} bind:submit="on{{Name}}Submit"></${obj.name}>
    `)
}

function createGoFile(fileName, strings) {
    if (!strings.startsWith(".")) return false;
    const dir = path.dirname(fileName);
    strings = strings.slice(1);
    fileName = path.join(dir, strings + '.go');
    if (!fs.existsSync(fileName)) {
        const template = `C:\\Users\\Administrator\\Desktop\\Resources\\模板\\go.txt`;
        createFileIfNotExists(template);
        fs.writeFileSync(fileName, fs.readFileSync(template));
    }
    return true
}

function createRegularFile(fileName, strings) {
    const dir = path.dirname(fileName);
    fileName = path.join(dir, strings);
    if (!fs.existsSync(fileName)) {
        if (fileName.indexOf('.') !== -1) {
            fs.writeFileSync(fileName, ``);
        } else
            fs.mkdirSync(fileName);
    }
}

function createFileIfNotExists(f) {
    if (!fs.existsSync(f)) {
        fs.writeFileSync(f, ``);
    }
}

// https://crates.io/crates/convert_case
function upperCamel(string) {
    string = camel(string);
    return string.slice(0, 1).toUpperCase() + string.slice(1);
}

function camel(string) {
    return string.replaceAll(/[ _-]([a-zA-Z])/g, m => m[1].toUpperCase());
}

function snake(string) {
    return string.replaceAll(/(?<=[a-z])[A-Z]/g, m => `_${m}`).toLowerCase()
        .replaceAll(/[ -]([a-z])/g, m => `_${m[1]}`)
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

module.exports = (context) => {
    context.subscriptions.push(vscode.commands.registerCommand(COMMAND, async () => {
        const fileName = vscode.window.activeTextEditor.document.fileName;
        const strings = await vscode.env.clipboard.readText();
        if (createGoFile(fileName, strings)) return;
        if (createWeChatPage(fileName, strings)) return;
        if (createWeChatComponents(fileName, strings)) return;
        createRegularFile(fileName, strings);
    }));
}