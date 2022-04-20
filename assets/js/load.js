
import {GitHub} from './lib/github.js';
import {http} from "./lib/request.js";

// export const github = new GitHub('https://api.github.com/repos/Moderocky/ByteSkript/');
// export const github = new GitHub('https://api.github.com/repos/ByteSkript/Tutorials/');
// const github = new GitHub('https://api.github.com/repos/Ankoki/SkJade/');
// export const github = new GitHub('https://api.github.com/repos/SkriptLang/Skript/');
const request = http.current();
const github = (request.id) ? new GitHub('https://api.github.com/repositories/' + request.id) : new GitHub('https://api.github.com/repos/Ankoki/SkJade/');

export {github}
export const repository = await github.getRepository();
