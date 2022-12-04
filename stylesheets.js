const vscode = require('vscode');
const {replaceSelection} = require("./utils");
module.exports = () => {
    replaceSelection(async (s) => {
        const text = await vscode.env.clipboard.readText();
        return `<div style="${text.replaceAll(/[\d.]+rem/g, m => {
            return parseFloat(m) * 100 + 'px'
        })}">
</div>`;
    })
};