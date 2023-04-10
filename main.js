const http = require('http');
const system = require('fs');
const mime = require('mime');
const querystring = require('querystring');
const {fetch} = require('cross-fetch');
const process = require('child_process');

const {database, Query} = require('./data');

const {Octokit} = require("@octokit/rest");
let token = system.readFileSync('token.txt', 'utf8').trim();
let secret = system.readFileSync('secret.txt', 'utf8').trim();
const debugMode = false;
const octokit = new Octokit({
    auth: token, throttle: {
        onRateLimit: (retryAfter, options) => {
            octokit.log.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
            if (options.request.retryCount <= 2) {
                console.log(`Retrying after ${retryAfter} seconds!`);
                return true;
            }
        }, onSecondaryRateLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(`Secondary quota detected for request ${options.method} ${options.url}`);
        }
    },
});
const usercache = {};

class RequestCache {
    clean = new Date();
    hours = 2;
    data = {};

    async get(url) {
        if (this.data.hasOwnProperty(url)) {
            if (debugMode) console.log('Knows: ' + url);
            const date = this.data[url].date;
            const now = new Date();
            const difference = Math.abs(Math.floor(((now.getTime() - date.getTime()) / 1000) / 60));
            if (difference < 2) return this.data[url].value;
            if (debugMode) console.log('Data is ' + difference + ' minutes old.');
            const etag = this.data[url].etag || '';
            try {
                const result = await octokit.request({
                    method: 'GET', url: url, headers: {
                        'If-None-Match': etag
                    }
                });
                if (debugMode) console.log("Asked, got " + result.status);
                if (result.status === 304) return this.data[url].value;
                this.store(url, result).then();
                if (debugMode) console.log("Replaced data.");
                return result;
            } catch (error) {
                return this.data[url].value;
            }
        } else try {
            if (debugMode) console.log('Wanting: ' + url);
            const result = await octokit.request('GET ' + url);
            this.store(url, result).then();
            if (debugMode) console.log("Fetched data.");
            return result;
        } catch (error) {
            if (debugMode) {
                console.log("Error.");
                console.log(error);
            }
            return null;
        }
    }

    async store(url, value) {
        if (value.headers) this.data[url] = {
            value: value, etag: value.headers.etag, date: new Date()
        }; else this.data[url] = {
            value: value, date: new Date()
        }
        this.cleanUp().then();
    }

    async cleanUp() {
        return; // todo
        // const date = new Date();
        // date.setHours(date.getHours() - this.hours);
        // for (let key in this.data) {
        //     if (this.data[key].date.getTime() < date.getTime()) delete this.data[key];
        // }
    }
}

const cache = new RequestCache();

http.createServer(handle).listen(2040);

async function handle(request, response) {
    if (request.url.startsWith('/login')) {
        await login(request, response);
    } else if (request.url.startsWith('/api')) {
        await api(request, response);
    } else {
        try {
            if (request.url.startsWith('/activity_graph')) await prepareGraph(request.url);
            const data = getFrontendFile(request.url, response);
            response.write(data);
        } catch (error) {
            console.log(error);
            response.writeHead(500);
            response.write(error.toString());
        }
        response.end();
    }
}

async function prepareGraph(url) {
    const file = 'frontend' + url;
    if (system.existsSync(file)) {
        const stat = system.statSync(file);
        if ((Math.abs(stat.birthtime - new Date()) / 36e5) < 2) return;
    }
    const name = url.substring('/activity_graph/'.length, url.length - 4);
    let data = '' + process.execSync('githubchart -c halloween -u ' + name).toString();
    data = data.replace(/#EEEEEE/g, 'rgba(210,210,210,0.3)');
    data = data.replace(/#FFEE4A/g, 'rgba(169,154,255,1)');
    data = data.replace(/#FFC501/g, 'rgba(154,121,255,1)');
    data = data.replace(/#FE9600/g, 'rgba(178,106,255,1)');
    data = data.replace(/#03001C/g, 'rgba(207,85,255,1)');
    data = data.replace(/#767676/g, 'rgba(210,210,210,1)');
    system.writeFileSync(file, data);
}

function getFrontendFile(url, response) {
    let link = 'frontend' + url.split(/[?#]/)[0];
    if (url === '/') link = link + 'home';
    if (link.indexOf('.') < 0) link = link + '.html';
    if (system.existsSync(link)) {
        const data = system.readFileSync(link, 'utf8');
        response.setHeader("Content-Type", mime.getType(link));
        response.writeHead(200);
        return data;
    } else {
        response.writeHead(404);
        if (debugMode) return `No page found at ` + link; else return `<script>window.location = 'https://resources.byteskript.org/home';</script>`;
    }
}

async function login(request, response) {
    response.writeHead(200);
    if (request.url.includes('?')) {
        const query = querystring.decode(request.url.substring(request.url.indexOf('?') + 1));
        let index = query.state.indexOf('->');
        const session = query.state.substring(0, index), exit = query.state.substring(index + 2);
        const user = {
            id: null, _id: null, octokit: null, ...await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                body: formEncode({client_id: 'Iv1.5b5f5c814012e08f', client_secret: secret, code: query.code}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).catch(error => (console.log(error))).then(thing => thing.text()).then(querystring.decode)
        }
        user['octokit'] = () => new Octokit({auth: user.access_token});
        user.id = async () => {
            if (user._id != null) return user._id;
            let text = user.octokit().request('GET /user').then(result => result.data.id);
            return user._id = text;
        };
        user.id().then(id => database.putIfAbsent({
            id: id, admin: false, resources: [], roles: []
        }, 'users', id + '.json'));
        usercache[session] = user;
        response.write(`<script>window.location = '` + exit + `';</script>`);
        response.end();
    } else {
        if (request.method === 'POST') {
            const buffers = [];
            for await (const chunk of request) buffers.push(chunk);
            const data = Buffer.concat(buffers).toString();
            try {
                const user = usercache[querystring.parse(data).session];
                const id = await user.id();
                if (id) {
                    const request = await database.fetch('users', ((await user.id()) + '')).then(Query.value);
                    response.write(JSON.stringify(request, null, 2));
                } else response.write('null');
            } catch (error) {
                response.write('null');
            }
            response.end();
        } else {
            response.write(`<script type="module">
                import {login} from "./assets/js/lib/login.mjs";
                login().then(); //'https://resources.byteskript.org/home'
            </script>`);
            response.end();
        }
    }
}

async function api(request, response) {
    try {
        let data, text;
        if (request.url.startsWith('/api/git')) {
            data = await cache.get(request.url.substring(8));
            text = JSON.stringify(data);
        } else if (request.url.startsWith('/api/')) {
            text = await database.fetch(request.url.substring(5)).then(Query.text);
        }
        response.setHeader("Content-Type", 'application/json');
        response.writeHead(200);
        response.write(text);
    } catch (error) {
        console.log(error);
        response.writeHead(500);
        response.write(error.toString());
    }
    response.end();
}

function formEncode(content) {
    if (content instanceof String) return content; else {
        const array = [];
        for (const key in content) if (content.hasOwnProperty(key)) array.push(key + '=' + encodeURI(content[key]));
        return array.join('&');
    }
}
