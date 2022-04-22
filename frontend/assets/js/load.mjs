
import {GitHub} from './lib/github.mjs';
import {http} from "./lib/request.mjs";

const request = http.current();
if (request == null || request.id == null) window.location.pathname = 'home';
const github = new GitHub('https://api.github.com/repositories/' + request.id);

export {github}
export const pendingRepository = github.getRepository();
export const repository = await pendingRepository;
