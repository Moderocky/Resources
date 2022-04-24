const http = require('http');
const system = require('fs');
const mime = require('mime');
const querystring = require('querystring');
const {fetch} = require('cross-fetch');

const {database, Query} = require('./data');

const {Octokit} = require("@octokit/rest");
let token = system.readFileSync('token.txt', 'utf8').trim();
let secret = system.readFileSync('secret.txt', 'utf8').trim();
const octokit = new Octokit({auth: token});
const usercache = {};

class RequestCache {
    clean = new Date();
    hours = 2;
    data = {};

    async get(url) {
        if (this.data.hasOwnProperty(url)) {
            const date = this.data[url].date;
            if (date.getTime() < new Date().getTime()) {
                const result = await octokit.request('GET ' + url);
                this.store(url, result).then();
                return result;
            } else {
                try {
                    const result = await octokit.request({
                        method: 'GET',
                        url: url,
                        headers: {
                            'If-Modified-Since': date.toUTCString()
                        },
                    });
                    if (result.status === 304) return this.data[url].value;
                    this.store(url, result).then();
                    return result;
                } catch (error) {
                    return this.data[url].value;
                }
            }
        } else {
            const result = await octokit.request('GET ' + url);
            this.store(url, result).then();
            return result;
        }
    }

    async store(url, value) {
        const date = new Date();
        date.setHours(date.getHours() + this.hours);
        this.data[url] = {
            value: value,
            date: date
        }
        this.cleanUp().then();
    }

    async cleanUp() {
        const date = new Date();
        for (let key in this.data) {
            if (this.data[key].date.getTime() < date.getTime()) delete this.data[key];
        }
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
            const data = getFrontendFile(request.url, response);
            response.write(data);
        } catch (error) {
            response.writeHead(500);
            response.write(error.toString());
        }
        response.end();
    }
}

function getFrontendFile(url, response) {
    let link = 'frontend' + url.split(/[?#]/)[0];
    if (link.indexOf('.') < 0) link = link + '.html';
    if (system.existsSync(link)) {
        const data = system.readFileSync(link, 'utf8');
        response.setHeader("Content-Type", mime.getType(link));
        response.writeHead(200);
        return data;
    } else {
        response.writeHead(404);
        return 'Page not found.';
    }
}

async function login(request, response) {
    response.writeHead(200);
    if (request.url.includes('?')) {
        const query = querystring.decode(request.url.substring(request.url.indexOf('?') + 1));
        let index = query.state.indexOf('->');
        const session = query.state.substring(0, index), exit = query.state.substring(index + 2);
        const user = {
            id: null,
            _id: null,
            octokit: null,
            ...await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                body: formEncode({client_id: 'Iv1.5b5f5c814012e08f', client_secret: secret, code: query.code}),
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(thing => thing.text()).then(querystring.decode)
        }
        user['octokit'] = () => new Octokit({auth: user.access_token});
        user.id = async () => {
            if (user._id != null) return user._id;
            let text = user.octokit().request('GET /user').then(result => result.data.id);
            return user._id = text;
        };
        user.id().then(id => database.putIfAbsent({id: id, admin: false, resources: [], roles: []}, 'users', id + '.json'));
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
                login('http://localhost:2040/test.html').then(); // todo
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
    if (content instanceof String) return content;
    else {
        const array = [];
        for (const key in content) if (content.hasOwnProperty(key)) array.push(key + '=' + encodeURI(content[key]));
        return array.join('&');
    }
}
