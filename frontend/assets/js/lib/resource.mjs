import {Git, GitHub} from "./github.mjs";
import {http} from "./request.mjs";

class Resource extends Git {
    id;
    owner;
    name;
    tag_line = '';
    icon;
    _repository;
    _owner;

    constructor(request) {
        super(request);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    static async exists(id) {
        return (await this.getByID(id)).exists;
    }

    static async _fetchData(id) {
        return await http.get('/api/resources/' + id).then(JSON.parse).then(data => data.value);
    }

    static getByID(id) {
        const resource = new Resource(this._fetchData(id));
        resource.id = id;
        return resource;
    }

    static async getByUser(user) {
        const ids = await http.get('/api/resources/').then(JSON.parse) || [];
        const found = [];
        for (let id of ids) {
            const resource = new Resource(this._fetchData(id));
            await resource.awaitReady();
            if (resource.owner === user) found.push(resource);
        }
        return found;
    }

    static async getAll() {
        const ids = await http.get('/api/resources/').then(data => (JSON.parse(data) || {value: []}).value) || [];
        const found = [];
        for (let id of ids) {
            const resource = new Resource(this._fetchData(id));
            found.push(resource);
        }
        return found;
    }

    async getRepository() {
        await this.awaitReady();
        if (this._repository) return this._repository;
        this._repository = await GitHub.getRepository(this.id).awaitReady();
        return this._repository;
    }

    getOwnerUser() {
        return this._owner || (this._owner = GitHub.getUser(this.owner));
    }

    isValid() {
        return this.exists;
    }

}

export {Resource}
