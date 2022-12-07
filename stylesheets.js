const vscode = require('vscode');
const {replaceSelection, substringAfter} = require("./utils");
module.exports = () => {
    replaceSelection(async (s) => {
        const text = await vscode.env.clipboard.readText();
        return `<view style="${formatWeChat(text)}">
</view>`;
    })
};

/*
 return `<div style="${text.replaceAll(/[\d.]+rem/g, m => {
            return parseFloat(m) * 100 + 'px'
        })}">
</div>`;
 */
function formatWeChat(strings) {
    const lines = strings.split(';').map(x => x.trim());
    const properties = lines.filter(x => x.startsWith('--')).map(x => {
        const pieces = x.split(':');
        if (pieces.length > 1)
            return {
                key: pieces[0].trim(),
                value: pieces[1].trim()
            }
    });
    const source = lines.filter(x => !x.startsWith('--'))
        .map(x => {

            return x.replace(/var\([^\)]+\)/g, m => {
                const key = /--[a-zA-Z0-9-]+/.exec(m)[0];
                const founded = properties.filter(x => x.key === key);
                return founded ? founded[0]["value"] : ''
            });
        });
    const s = source.join(';').replaceAll(/[\d.]+px/g, m => {
        return parseFloat(m) * 2 + 'rpx'
    }).replaceAll(/font: \d+ \d+rpx\/\d+rpx[^;]+;/g, m => {
        const r = /font: (\d+) (\d+rpx)\/(\d+rpx)[^;]+;/.exec(m);
        return `font-weight: ${r[1]};font-size: ${r[2]};line-height: ${r[3]};`;
    });
    return substringAfter(s,"-webkit-tap-highlight-color: transparent;")
}