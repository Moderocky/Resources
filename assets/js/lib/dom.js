
const dom = {
    parser: new DOMParser(),
    parse: function (text, type= 'text/html') {
        return this.parser.parseFromString(text, type || 'text/xml');
    },
    createMulti: function (htm, variables = {}) {
        const div = document.createElement('div'), array = [];
        for (let key in variables) htm = htm.replaceAll('{' + key + '}', variables[key] || '');
        div.insertAdjacentHTML('afterbegin', htm);
        for (let node of div.childNodes) array.push(node);
        div.remove();
        return array;
    },
    createElement(tag, ...classes) {
        const element = document.createElement(tag);
        for (let node of classes) element.classList.add(node);
        return element;
    },
    create: function (htm, variables = {}) {
        const div = document.createElement('div');
        for (let key in variables) htm = htm.replaceAll('{' + key + '}', variables[key] || '');
        div.insertAdjacentHTML('afterbegin', htm);
        let element = div.childNodes[0];
        for (let node of div.childNodes) if (node.tagName != null) {
            element = node;
            break;
        }
        div.remove();
        return element;
    },
    nodes: function (htm, variables) {
        const data = { outer: this.create(htm, variables) };
        let node = data.outer, test;
        while (node.hasChildNodes() && (test = node.firstChild).tagName != null) node = test;
        data.inner = node;
        Object.freeze(data);
        return data;
    },
    rawText: function (element) {
        let text = '', line = true;
        function readChildren(children) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (child.nodeName === 'BR') {
                    text += '\n';
                    line = true;
                    continue;
                }
                if (child.nodeName === 'DIV' && line === false) text += '\n';
                line = false;
                if (child.nodeType === 3 && child.textContent) text += child.textContent;
                readChildren(child.childNodes);
            }
        }
        readChildren(element.childNodes);
        return text;
    }
}

export { dom };
