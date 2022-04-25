
import {GitHub} from './lib/github.mjs';
import {http} from "./lib/request.mjs";

const request = http.current();
if (request == null || request.id == null) window.location.pathname = 'home';

export const repository = GitHub.getRepository(request.id);
