const dom = {
    parser: new DOMParser(),
    parse: function (text, type = 'text/html') {
        return this.parser.parseFromString(text, type || 'text/xml');
    },
    _template: function (element, variables) {
        if (element == null || element.tagName == null) return;
        for (let template of element.querySelectorAll(`template[data-wait-for]`)) {
            const key = template.dataset.waitFor;
            let value = variables[key];
            if (value == null) continue;
            if (!isAsync(value)) continue;
            value().then(result => template.replaceWith(document.createTextNode((result != null ? result : '').toString()))).catch(console.error);
        }
    },
    _create: function (htm, variables) {
        const div = document.createElement('div');
        for (let key in variables || {}) {
            let value = variables[key];
            if (value == null) value = '';
            if (isAsync(value)) htm = htm.replaceAll('{' + key + '}', `<template data-wait-for="` + key + `"></template>`);
            else htm = htm.replaceAll('{' + key + '}', value);
        }
        div.innerHTML = htm;
        return div;
    },
    createMulti: function (htm, variables = {}) {
        const div = this._create(htm, variables), array = [];
        for (let node of div.childNodes) array.push(node);
        for (let element of array) this._template(element, variables);
        div.remove();
        return array;
    },
    createElement(tag, ...classes) {
        const element = document.createElement(tag);
        for (let node of classes) element.classList.add(node);
        return element;
    },
    create: function (htm, variables = {}) {
        const div = this._create(htm, variables);
        let element = div.firstElementChild;
        this._template(element, variables);
        div.remove();
        return element;
    },
    nodes: function (htm, variables) {
        const data = {outer: this.create(htm, variables)};
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

function isAsync(value) {
    return (value != null && typeof value === 'function' && value.constructor.name === 'AsyncFunction');
}

export {dom};
