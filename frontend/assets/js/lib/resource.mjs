
import {GitHub} from "./github.mjs";
import {http} from "./request.mjs";

class Resource {
    id;
    owner;
    tag_line = '';
    _repository;
    _owner;

    getRepository() {
        return this._repository || (this._repository = GitHub.getRepository(this.id));
    }

    getOwnerUser() {
        return this._owner || (this._owner = GitHub.getUser(this.owner));
    }

    isValid() {
        return false;
    }

    static async getByID(id) {
        const resource = new Resource();
        resource.id = id;
        try {
            const data = await http.get('/api/resources/' + id).then(JSON.parse);
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

}
