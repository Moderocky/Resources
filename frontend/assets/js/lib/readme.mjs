import {dom} from "./dom.mjs";

function fixMarkdown(element) {
    for (let pre of element.querySelectorAll('pre')) pre.classList.add('rounded-xl', 'bg-gray-200', 'dark:bg-gray-600');
    for (let code of element.querySelectorAll('p > code')) code.classList.add('rounded-sm', 'bg-gray-200', 'dark:bg-gray-600');
    for (let a of element.querySelectorAll('a')) a.classList.add('text-sky-600', 'hover:text-sky-500', 'transition-colors');
    for (let summary of element.querySelectorAll('details > summary')) summary.classList.add('cursor-pointer', 'transition-colors');
    for (let ul of element.querySelectorAll('ul')) {
        ul.classList.add('list-disc', 'ml-6');
        for (let li of ul.querySelectorAll('li')) li.classList.add('mb-2');
    }
    for (let ol of element.querySelectorAll('ol')) {
        ol.classList.add('list-decimal', 'ml-6');
        for (let li of ol.querySelectorAll('li')) li.classList.add('mb-2');
    }
    return element;
}

function generateMarkdown(text, container) {
    const htm = marked.parse(text);
    const elements = dom.createMulti(htm);
    let current = dom.createElement('div', 'section', 'py-6', 'px-6', 'mb-4', 'rounded-xl', 'bg-slate-900', 'dark:bg-white', 'dark:bg-opacity-10', 'bg-opacity-10', 'shadow-xl');
    let has = false;
    for (let element of elements) {
        if (element.tagName != null && element.tagName.startsWith('H') && has === true) {
            if (current != null && current.childNodes.length > 0) container.appendChild(current);
            current = dom.createElement('div', 'section', 'py-6', 'px-6', 'mb-4', 'rounded-xl', 'bg-white', 'bg-opacity-10', 'shadow-xl');
            has = false;
        } else if (element.tagName != null && (element.tagName === 'P' || element.tagName === 'UL' || element.tagName === 'OL' || element.tagName === 'PRE' || element.tagName === 'CODE')) has = true;
        if (element.tagName === 'H1') element.classList.add('border-b-2', 'border-gray-200', 'dark:border-gray-600');
        current.appendChild(element);
    }
    if (current != null) container.appendChild(current);
    return container;
}

export {generateMarkdown, fixMarkdown}
