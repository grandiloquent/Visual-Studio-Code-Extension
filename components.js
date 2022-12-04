const vscode = require('vscode');
const {camel, capitalize, substringBeforeLast} = require("./utils");

const fs = require('fs');

module.exports = () => {
    const editor = vscode.window.activeTextEditor;
    const selection = editor.selection;
    let filename = editor.document.getText(selection);
    filename = filename.trim();
    //const filename = await vscode.env.clipboard.readText();
    const Name = capitalize(camel(filename));
    const name = filename;
    const strings = `class Custom${Name} extends HTMLElement {

    constructor() {
        super();

        this.root = this.attachShadow({mode: 'open'});

this.root.innerHTML=\`
<style>
        </style>
\`;
    }

 
    static get observedAttributes() {
        return ['title'];
    }
  

    connectedCallback() {

this.root.host.style.userSelect='none';
        
      // this.dispatchEvent(new CustomEvent());
/*
const close = evt => {
            evt.stopPropagation();
            this.remove();
        };
        this.root.querySelectorAll('').forEach(x => {
            x.addEventListener('click', close);
        })
this.dispatchEvent(new CustomEvent('submit', {
                detail: 0
            }));
*/
    }
    disconnectedCallback() {
       
    }
    
    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'title') {
            this.root.querySelector('.title').textContent = newVal;
        }
    }
   
}
customElements.define('custom-${name}', Custom${Name});
/*
<!--\\
<custom-${name}></custom-${name}>
<script src="custom-${name}.js"></script>

const custom${Name} = document.querySelector('custom-${name}');
custom${Name}.addEventListener('submit', evt => {
            evt.stopPropagation();
        });

const custom${Name} = document.createElement('custom-${name}');
custom${Name}.setAttribute('title','');
document.body.appendChild(custom${Name});
this.dispatchEvent(new CustomEvent('submit', {
detail: evt.currentTarget.dataset.index
}))
-->
*/`;
    let fileName = vscode.window.activeTextEditor.document.fileName;
    fileName = `${substringBeforeLast(fileName, "\\")}\\custom-${filename}.js`;
    if (!fs.existsSync(fileName))
        fs.writeFileSync(fileName, strings);


    editor.edit(
        edit => editor.selections.forEach(
            selection => {
                edit.replace(selection, `
<custom-${name}></custom-${name}>
<script src="custom-${name}.js"></script>
                `);
            }
        )
    );
}