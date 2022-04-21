
import {cookie} from "./cookie.mjs";
import {date} from "./date.mjs";
const prime = 1000000000000066600000000000001;
let value = cookie.get('rbo_session_id', createId()).replaceAll(/[=_+\-*/%&#?.;]/g, '');
cookie.set('rbo_session_id', value, date.plus(24));
export const session = { id: value }

function createId() {
    return (btoa(hash(Math.random()*prime) + '') + btoa('' +(Math.random()*prime))).replaceAll(/[=_+\-*/%&#?.;]/g, '');
}

function hash (text) {
    let hash = 0, i, char;
    if (text == null || (text = text + '').length === 0) return hash;
    for (i = 0; i < text.length; i++) {
        char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    return hash;
}
