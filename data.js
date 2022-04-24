
const system = require('fs');
const path = require('path');

class CacheMap {

    static _current() {
        return Math.floor(Date.now() / 1000);
    }

    constructor(max = 10, lifetime = 120) {
        if (max < 1) max = 1;
        if (lifetime < 1) lifetime = 1;
        this.pending = new WeakMap();
        this.map = new Map();
        this.max = max;
        this.timer = lifetime;
    }

    keySet() {
        const keys = [];
        for (let key in this.map) keys.push(key);
        return keys;
    }

    values() {
        const values = [];
        for (let key in this.map) values.push(this.map[key]);
        return values;
    }

    get(key) {
        const value = this.map.get(key);
        if (value) this.pending.get(value).push(CacheMap._current());
        return value;
    }

    has(key) {
        return this.map.has(key);
    }

    _clean = async () => {
        if (this.map.size !== this.max) return;
        let keys = this.map.keys(), found, number = null;
        const now = CacheMap._current();
        for (const key of keys) {
            const value = this.map.get(key);
            const total = this.pending.get(value);
            const since = total.filter(count => count > (now - this.timer));
            this.pending.set(value, total);
            if (number === null || since.length < number) {
                number = since.length;
                found = key;
            }
        }
        this.map.delete(found);
    }

    set(key, value) {
        if (this.map.has(key)) this.map.set(key, value);
        else {
            this._clean().then();
            this.map.set(key, value);
        }
        this.pending.set(value, []);
    }

    size() {
        return this.map.size;
    }

}

class Query {

    constructor(database, value, ...location) {
        this.database = database;
        this.location = location;
        this.target = () => {
            let text = location.join('/');
            if (text.endsWith('.json')) text = text.substring(0, text.length-5);
            return text;
        }
        this.getValue = () => value;
    }

    static first = (query) => query.getFirst();
    static last = (query) => query.getLast();
    static find = (query) => query.fetch(query.getValue());
    static value = (query) => query.getValue();
    static text = (query) => JSON.stringify({target: query.target(), value: query.getValue()}, null, 2);

    async fetch(...url) {
        return await this.database.fetch(...this.location, ...url);
    }

    async getFirst() {
        let thing = this.getValue();
        if (Array.isArray(thing)) thing = thing[0];
        return new Query(database, thing, ...this.location);
    }

    async getLast() {
        let thing = this.getValue();
        if (Array.isArray(thing)) thing = thing[thing.length];
        return new Query(database, thing, ...this.location);
    }

}

class Database {
    constructor(path = './data') {
        this.path = path;
        setInterval(() => {
            for (let key in this.lock) this.lock[key].then(delete this.lock[key]);
        }, 300000);
    }

    lock = {};
    data = { get: (name) => this[name] || (this[name] = new CacheMap(16, 200)) };
    _list = async (path) => system.readdirSync(path, {withFileTypes: true}).filter(item => !item.isDirectory()).map(item => item.name.substring(0, item.name.lastIndexOf('.')))
    _getContent = async (path) => {
        try {
            let lock = this.lock[path] || (this.lock[path] = Promise.resolve()), promise;
            this.lock[path] = promise = lock.then(() => system.readFileSync(path)).catch(() => '{}');
            return (await promise).toString();
        } catch (error) {
            return '{}';
        }
    }
    _setContent = async (path, text) => {
        let lock = this.lock[path] || (this.lock[path] = Promise.resolve()), promise;
        this.lock[path] = promise = lock.then(() => system.writeFileSync(path, text));
        return await promise;
    }

    _getPath = (...location) => path.resolve(__dirname, this.path, ...location);

    async getContent(...location) {
        const target = this._getPath(...location);
        let cache = this.data.get(location[1]), value;
        if (cache.has(target)) return cache.get(target);
        cache.set(target, value = await this._getContent(target).then(toString));
        return value;
    }

    async putIfAbsent(object, ...location) {
        const target = this._getPath(...location);
        if (system.existsSync(target)) return false;
        await this.mergeWrite(object, ...location);
        return true;
    }

    async getObject(...location) {
        const target = this._getPath(...location), database = this;
        let cache = this.data.get(location[1]), object;
        if (cache.has(target)) return cache.get(target);
        cache.set(target, object = await database._getContent(target).then(JSON.parse));
        object.save = () => database._setContent(target, JSON.stringify(object));
        return object;
    }

    async mergeWrite(object, ...location) {
        try {
            const data = await this.getObject(...location);
            Object.assign(data, object);
            await data.save();
        } catch (error) { console.log(error); }
    }

    async fetch(...url) {
        url = url.join('/');
        if (url.startsWith('/')) url = url.substring(1);
        const list = (url.endsWith('/')), check = (url.endsWith('?'));
        if (list || check) url = url.substring(0, url.length - 1);
        let location = url.split('/'), target = path.resolve(__dirname, this.path, ...location), value;
        if (check) value = system.existsSync(target) || system.existsSync(target + '.json');
        else if (system.existsSync(target) && system.lstatSync(target).isDirectory()) value = await this._list(target);
        else if (!list && system.existsSync(target + '.json')) value = await this.getObject(...((location[location.length-1] = location[location.length-1] + '.json') && location));
        else value = check ? false : null;
        return new Query(this, value, ...location);
    }

    async delete(...url) {
        url = url.join('/');
        if (url.startsWith('/')) url = url.substring(1);
        if (url.endsWith('/')) url = url.substring(0, url.length-1);
        let location = url.split('/'), target = path.resolve(__dirname, this.path, ...location);
        if (system.existsSync(target + '.json')) system.rmSync(target + '.json');
    }

}

const database = new Database();
module.exports = {database, Query};
