
import {GitHub} from './lib/github.mjs';
import {http} from "./lib/request.mjs";

// export const github = new GitHub('https://api.github.com/repos/Moderocky/ByteSkript/');
// export const github = new GitHub('https://api.github.com/repos/ByteSkript/Tutorials/');
// const github = new GitHub('https://api.github.com/repos/Ankoki/SkJade/');
// export const github = new GitHub('https://api.github.com/repos/SkriptLang/Skript/');
const request = http.current();
const github = (request.id) ? new GitHub('https://api.github.com/repositories/' + request.id) : new GitHub('https://api.github.com/repos/SkriptLang/Skript/');

export {github}
export const pendingRepository = github.getRepository();
export const repository = await pendingRepository;
