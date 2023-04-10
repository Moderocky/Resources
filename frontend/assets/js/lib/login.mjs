import {http} from "./request.mjs";
import {session} from "./session.mjs";
import {GitHub} from "./github.mjs";

const api = '/api';

class Account {
    user;
    resolved;
    valid;
    id;
    banned;
    roles = [];
    resources = [];
    _promise;

    constructor(id, user) {
        this.id = id;
        if (id == null) return;
        this.awaitReady().then();
        if (user) this.valid = !!(this.user = user); else this.getUser().then();
    }

    static getUsers = async () => {
        const users = [];
        const data = await http.get(api + '/users/').then(JSON.parse);
        for (let datum of data.value) users.push(new Account(datum, await GitHub.getUser(datum).awaitReady()));
        return users;
    }

    static getUserIDs = async () => {
        return await http.get(api + '/users/').then(JSON.parse);
    }

    isAdmin() {
        return this.roles.includes('admin');
    }

    isStaff() {
        return this.roles.includes('staff');
    }

    isBanned() {
        return this.banned;
    }

    getSessionID() {
        return session.id;
    }

    async getIcon() {
        const id = await this.getId();
        return 'https://avatars.githubusercontent.com/u/' + id + '?v=4';
    }

    async getUser() {
        if (this.user != null) return this.user;
        const id = await this.getId();
        return this.user = await GitHub.getUser(id).awaitReady();
    }

    async getId() {
        return this.id;
    };

    async isLoggedIn() {
        return false;
    }

    async request() {
        if (this.resolved || this._lock) return;
        this._lock = true;
        let data;
        if (/^\d+$/g.test(this.id + '')) data = await http.get(api + '/users/' + this.id).then(JSON.parse); else {
            const user = await this.getUser();
            data = await http.get(api + '/users/' + user.id).then(JSON.parse);
        }
        this.valid = !!data.value;
        Object.assign(this, data.value);
        delete this._lock;
        return this;
    }

    async awaitReady() {
        if (this.resolved) return this;
        if (this._promise != null) return this._promise;
        this._promise = this.request();
        await this._promise;
        delete this._promise;
        this.resolved = true;
        return this;
    }

}

const account = new Account(null);

account.login = function (url = true) {
    if (url === true) url = window.location;
    window.location = 'https://github.com/login/oauth/authorize?' + http.formEncode({
        client_id: 'Iv1.5b5f5c814012e08f',
        redirect_uri: window.location.protocol + '//' + window.location.host + '/login',
        state: session.id + '->' + encodeURI(url)
    })
};
account.getId = async function () {
    if (account.resolved || account.id != null) return account.id;
    const data = await http.post('/login', {session: session.id}).then(JSON.parse);
    Object.assign(account, data);
    account.resolved = true;
    return account.id;
};
account.isLoggedIn = async () => (await account.getId()) != null;

export {Account, account}
