import {dom} from "./dom.mjs";

const yes = () => dom.create(`<i data-check-icon class="fa-solid fa-square-check text-emerald-500 w-4"></i>`),
    no = () => dom.create(`<i data-check-icon class="fa-solid fa-square-xmark text-rose-500 w-4"></i>`);

function mark(element, state = false) {
    element.querySelector('i[data-check-icon]').replaceWith(state ? yes() : no());
}

class Checklist {

    container;
    checks = {};

    constructor(node) {
        this.container = node;
        for (let element of node.querySelectorAll('[data-check]')) {
            const key = element.dataset['check'];
            if (!key) continue;
            this.checks[key] = element;
        }
    }

    check(key, value = true) {
        if ((typeof id === 'string' || id instanceof String)) mark(this.checks[key], value);
        else mark(key, value);
    }

    uncheck(key) {
        if ((typeof id === 'string' || id instanceof String)) mark(this.checks[key], false);
        else mark(key, false);
    }

    uncheckAll() {
        for (let key in this.checks) mark(this.checks[key], false);
    }

}

export {Checklist}
