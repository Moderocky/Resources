const http = require('http');
const system = require('fs');
const mime = require('mime');
const { database, Query } = require('./data');

const { Octokit } = require("@octokit/rest");
let token = system.readFileSync('token.txt', 'utf8').trim();
const octokit = new Octokit({ auth: token });

// todo
database.fetch('users')
    .then(Query.first)
    .then(Query.find)
    .then(Query.value)
    .then(user => {
        console.log(user); // todo
        console.log(JSON.stringify(user));
        user['count']++;
        user.save();
});
database.fetch('users', 'test?')
    .then(Query.value)
    .then(console.log);
// todo

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
    if (request.url.startsWith('/api')) {
        await api(request, response);
    } else {
        try {
            const link = 'frontend' + request.url.split(/[?#]/)[0];
            const data = system.readFileSync(link, 'utf8');
            response.setHeader("Content-Type", mime.getType(link));
            response.writeHead(200);
            response.write(data);
        } catch (err) {
            response.writeHead(404);
            response.write(err.toString());
        }
    }
    response.end();
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
        response.writeHead(500);
        response.write(error.toString());
    }
}
