import {GitHub} from "./github.mjs";
import {http} from "./request.mjs";

class Resource {
    id;
    owner;
    tag_line = '';
    icon;
    _repository;
    _owner;

    static async exists(id) {
        return (await this.getByID(id)).isValid();
    }

    static async getByID(id) {
        const resource = new Resource();
        resource.id = id;
        try {
            const data = await http.get('/api/resources/' + id).then(JSON.parse).then(data => data.value);
            if (!data || Object.keys(data).length === 0) return resource;
            Object.assign(resource, data);
            resource.isValid = () => true;
        } catch (error) {
            console.error(error);
        }
        return resource;
    }

    static async getByUser(id) {
        const resources = await http.get('/api/resources/' + id).then(JSON.parse) || [];
        const found = [];
        for (let resource of resources) {
            if (resource.owner === id) found.push(resource);
        }
        return found;
    }

    getRepository() {
        return this._repository || (this._repository = GitHub.getRepository(this.id));
    }

    getOwnerUser() {
        return this._owner || (this._owner = GitHub.getUser(this.owner));
    }

    isValid() {
        return false;
    }

}

export {Resource}
