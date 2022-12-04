const {readText, camel, insertText} = require("./utils");
module.exports = async () => {
    const strings = (await readText()).trim();
    insertText(`const ${camel(strings)} = this.root.querySelector('.${strings}');
    ${camel(strings)}.addEventListener('click', evt => {
                evt.stopPropagation();
            });
    `);
};