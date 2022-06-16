import {http} from './request.mjs';

const api = '/api/git';

async function gitRequest(url, body) {
    if (!body && requests.hasOwnProperty(url)) return requests[url];
    return requests[url] = await http.get(api + url, body).then(JSON.parse);
}

const requests = {};aaa

async function request(url, body) {
    if (url && url.includes('api.github')) {
        url = url.substring('https://api.github.com'.length);
        const result = await gitRequest(url, body);
        return result.data;
    } else if (url) return JSON.parse(await http.get(url, body)).data;
}

class Git {
    _resolved = false;
    _promise = null;
    _request;

    constructor(request) {
        this._request = request;
        this.awaitReady(request).then(() => this.resolved = true);
    }

    isReady() {
        return (this.resolved || this._request == null);
    }

    async awaitReady() {
        if (this.resolved || this._request == null) return;
        if (this._promise != null) return this._promise;
        const source = this;
        this._promise = new Promise(async (resolve) => {
            const data = await this._request;
            Object.assign(source, data);
            resolve(source);
        });
        await this._promise;
        delete this._promise;
    }

}

class File extends Git {
    // GIST
    filename;
    type;
    language;
    raw_url;
    size;
    // REPO
    name;
    path;
    sha;
    url;
    html_url;
    git_url;
    download_url;
    content;
    encoding;
    truncated;

    constructor(request) {
        super(request);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    async getName() {
        await this.awaitReady();
        return this.filename || this.name;
    }

    async getRawURL() {
        await this.awaitReady();
        return this.raw_url || this.download_url;
    }

    async getContent() {
        await this.awaitReady();
        if (this.content && this.encoding === 'base64' && !this.truncated) return atob(this.content);
        else if (this.content && !this.encoding && !this.truncated) return this.content;
        return this.content = await request(await this.getRawURL());
    }

    async isFromGist() {
        return !!this.filename;
    }

    async isFromRepository() {
        return !!this.name;
    }

}

class Gist extends Git {
    url;
    forks_url;
    commits_url;
    id;
    node_id;
    git_pull_url;
    git_push_url;
    html_url;
    public;
    created_at;
    updated_at;
    description;
    comments;
    user;
    comments_url;
    owner = {};
    files = {};
    truncated;

    constructor(request) {
        super(request);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    async getOwner() {
        await this.awaitReady();
        return await GitHub.getUserByName(this['owner'].login).awaitReady();
    }

    async getFile(name) {
        await this.awaitReady();
        if (this._files) {
            for (let file of this._files) if (file.filename === name) return file;
            return null;
        } else return this.files[name] ? GitHub.createFile(this.files[name]) : null;
    }

    async getFiles() {
        await this.awaitReady();
        if (this._files) return this._files;
        const array = [];
        for (let key in this.files) array.push(GitHub.createFile(this.files[key]));
        return this._files = array;
    }

    async getFileNames() {
        await this.awaitReady();
        return Object.keys(this.files);
    }

}

class Event extends Git {
    id;
    type;
    actor = {};
    repo = {};
    payload = {};
    public;
    created_at;

    constructor(request) {
        super(request);
    }

    getOwner() {
        return GitHub.getUserByName(this['actor'].login).awaitReady();
    }

    getDate() {
        return new Date(this.created_at);
    }

}

class User extends Git {
    login;
    id;
    node_id;
    avatar_url;
    gravatar_id;
    url;
    html_url;
    followers_url;
    following_url;
    gists_url;
    starred_url;
    subscriptions_url;
    organizations_url;
    repos_url;
    events_url;
    received_events_url;
    type;
    site_admin;
    name;
    company;
    blog;
    location;
    email;
    hireable;
    bio;
    twitter_username;
    public_repos;
    public_gists;
    followers;
    following;
    created_at;
    updated_at;
    display_name;

    constructor(request) {
        super(request);
        this.awaitReady().then(() => this.display_name = this.name || this.login);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    getRepository(name) {
        return GitHub.getRepositoryByName(this.login, name);
    }

    getGist(id) {
        return GitHub.getGist(id);
    }

    async getEvents(amount) {
        await this.awaitReady();
        if (amount > 100) {
            let array = [], page = 0;
            while (amount > 0) {
                amount -= 100;
                array.push(GitHub.createEvent(await request(this.url + '/events', {per_page: 100, page: ++page})));
            }
            return array;
        } else return GitHub.createEvent(await request(this.url + '/events', {per_page: amount, page: 1}));
    }

    async getEventsAfter(date) {
        let current = new Date(), page = 0, check = 0;
        const array = [];
        do {
            page++;
            check = array.length;
            for (let event of (await this.getEventsByPage(page, 30))) {
                current = new Date(event.created_at);
                if (current.getTime() > date.getTime()) array.push(event);
                // else break;
            }
        } while (array.length > check && current.getTime() > date.getTime());
        return array;
    }

    async getEventsByPage(page = 1, per_page = 20) {
        await this.awaitReady();
        return GitHub.createEvent(await request(this.url + '/events', {
            per_page: Math.max(0, Math.min(100, per_page)),
            page: Math.max(1, page)
        }));
    }

    async getOrganisations() {
        await this.awaitReady();
        if (this._organisations) return await this._organisations;
        try {
            this._organisations = new Promise(async resolve => {
                const data = await request(this.organizations_url), array = [];
                for (let org in data) array.push(GitHub.getOrganisation(org.id))
                resolve(array);
            });
            return await this._organisations;
        } catch (error) {
            return [];
        }
    }

    async getRepositories() {
        await this.awaitReady();
        try {
            if (this._repositories != null) return await this._repositories;
            this._repositories = new Promise(async resolve => {
                const list = await request(this['repos_url']);
                const array = [];
                for (let repo of list) array.push(GitHub.createRepository(repo));
                resolve(array);
            });
            return await this._repositories;
        } catch (error) {
            console.log(error);
            return [];
        }
    }

    async getGists() {
        await this.awaitReady();
        try {
            if (this._gists != null) return await this._gists;
            this._gists = new Promise(async resolve => {
                const list = await request(this.gists_url.substring(0, this.gists_url.length - 10));
                const array = [];
                for (let gist of list) array.push(GitHub.createGist(gist));
                resolve(array);
            });
            return await this._gists;
        } catch (error) {
            console.log(error);
            return [];
        }

    }

    async getLanguages() {
        await this.awaitReady();
        try {
            if (this._languages != null) return this._languages;
            this._languages = new Promise(async resolve => {
                const object = {};
                for (let repository of await this.getRepositories()) {
                    if (repository['fork']) continue;
                    const languages = await repository.getLanguages();
                    for (let key in languages) {
                        if (object.hasOwnProperty(key)) object[key] += languages[key];
                        else object[key] = languages[key];
                    }
                }
                resolve(object);
            });
            return await this._languages;
        } catch (error) {
            console.log(error);
            return {};
        }
    }

    isOrganisation() {
        return false;
    }

}

class Organisation extends User {

    login;
    id;
    node_id;
    url;
    repos_url;
    events_url;
    hooks_url;
    issues_url;
    members_url;
    public_members_url;
    avatar_url;
    description;
    name;
    company;
    blog;
    location;
    email;
    twitter_username;
    is_verified;
    has_organization_projects;
    has_repository_projects;
    public_repos;
    public_gists;
    followers;
    following;
    html_url;
    created_at;
    updated_at;
    type;
    display_name;

    constructor(request) {
        super(request);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    async getOrganisations() {
        return [];
    }

    async getMembers() {
        await this.awaitReady();
        try {
            if (this._members) return await this._members;
            return await (this._members = request(this.members_url.substring(0, this.members_url.length - 9)));
        } catch (error) {
            return [];
        }
    }

    isOrganisation() {
        return true;
    }

}

class Repository extends Git {

    id;
    node_id;
    name;
    full_name;
    private;
    owner = {};
    html_url;
    description;
    fork;
    url;
    forks_url;
    keys_url;
    collaborators_url;
    teams_url;
    hooks_url;
    issue_events_url;
    events_url;
    assignees_url;
    branches_url;
    tags_url;
    blobs_url;
    git_tags_url;
    git_refs_url;
    trees_url;
    statuses_url;
    languages_url;
    stargazers_url;
    contributors_url;
    subscribers_url;
    subscription_url;
    commits_url;
    git_commits_url;
    comments_url;
    issue_comment_url;
    contents_url;
    compare_url;
    merges_url;
    archive_url;
    downloads_url;
    issues_url;
    pulls_url;
    milestones_url;
    notifications_url;
    labels_url;
    releases_url;
    deployments_url;
    created_at;
    updated_at;
    pushed_at;
    git_url;
    ssh_url;
    clone_url;
    svn_url;
    mirror_url;
    homepage;
    size;
    stargazers_count;
    watchers_count;
    language;
    has_issues;
    has_projects;
    has_downloads;
    has_wiki;
    has_pages;
    archived;
    disabled;
    forks_count;
    open_issues_count;
    license = {};
    allow_forking;
    is_template;
    topics = [];
    visibility;
    forks;
    open_issues;
    watchers;
    default_branch;
    temp_clone_token;
    network_count;
    subscribers_count;

    constructor(request) {
        super(request);
    }

    async awaitReady() {
        return super.awaitReady();
    }

    async getVersion() {
        await this.awaitReady();
        try {
            if (this._version != null) return this._version;
            this._version = await this.getLatestRelease(true).then(release => release ? release['tag_name'] : '');
            return this._version;
        } catch (error) {
            return this._version || '';
        }
    }

    async getLatestRelease(draft = false) {
        await this.awaitReady();
        try {
            if (draft) return GitHub.createRelease((await this.getReleases())[0]);
            else return GitHub.createRelease((await request(GitHub.releases(this.url) + '/latest')));
        } catch (error) {
            return null;
        }
    }

    async getReleases() {
        await this.awaitReady();
        try {
            return await request(GitHub.releases(this.url));
        } catch (error) {
            return [];
        }

    }

    async getFile(name) {
        await this.awaitReady();
        return await GitHub.getFile(GitHub.contents(this.url) + '/' + name).awaitReady();
    }

    async getFileContent(name) {
        const file = await this.getFile(name);
        return file.getContent();
    }

    async getOwner() {
        await this.awaitReady();
        return await GitHub.getUserByName(this['owner'].login).awaitReady();
    }

    async getLanguages() {
        await this.awaitReady();
        try {
            if (this._languages != null) return this._languages;
            this._languages = await request(this['languages_url']);
            return this._languages || {};
        } catch (error) {
            return this._languages || {};
        }
    }

    async getContributors() {
        await this.awaitReady();
        try {
            if (this._members != null) return await this._members;
            return await (this._members = request(this['contributors_url']));
        } catch (error) {
            return [];
        }
    }

    async getContents() {
        await this.awaitReady();
        try {
            if (this._contents != null) return await this._contents;
            return await (this._contents = request(this['url'] + '/contents'));
        } catch (error) {
            return [];
        }
    }

    async isContributor(user) {
        const members = await this.getContributors();
        if (user instanceof User) for (let member of members) if (member.id === user.id) return true;
        else for (let member of members) if ((member.id + '') === (user.id + '')) return true;
        return false;
    }

    async isOwner(user) {
        const owner = await this.getOwner();
        if (user instanceof User) return owner.id === user.id;
        else return (owner.id + '') === (user.id + '');
    }
}

class GitHub {

    static usercache = {
        put: (id, user) => this[id] = user
    }

    static contents = (link) => link + '/contents';
    static releases = (link) => link + '/releases';
    static languages = (link) => link + '/languages';

    static createRelease = (data) => {
        return data;
    };
    static createGist = (data) => {
        const gist = new Gist();
        Object.assign(gist, data);
        gist._resolved = true;
        return gist;
    }
    static createFile = (data) => {
        if (Array.isArray(data)) {
            const array = [];
            for (let datum of data) array.push(GitHub.createFile(datum));
            return array;
        }
        const file = new File();
        Object.assign(file, data);
        file._resolved = true;
        return file;
    }
    static createEvent = (data) => {
        if (Array.isArray(data)) {
            const array = [];
            for (let datum of data) array.push(GitHub.createEvent(datum));
            return array;
        }
        const event = new Event();
        Object.assign(event, data);
        event._resolved = true;
        return event;
    }
    static createUser = (data) => {
        const user = new User();
        Object.assign(user, data);
        user._resolved = true;
        user.display_name = user.name || user.login;
        return user;
    };
    static createOrganisation = (data) => {
        const organisation = new Organisation();
        Object.assign(organisation, data);
        organisation._resolved = true;
        organisation.display_name = organisation.name || organisation.login;
        return organisation;
    };
    static createRepository = (data) => {
        const repository = new Repository();
        Object.assign(repository, data);
        repository._resolved = true;
        return repository;
    };
    static parseDate = (time) => new Date(time);
    static getOrganisation = (id) => {
        if ((typeof id === 'string' || id instanceof String) && !/^\d+$/g.test(id)) return new Organisation(request(api + '/orgs/' + id));
        else return new Organisation(request(api + '/organizations/' + id));
    }
    static getUser = (id) => {
        if (GitHub.usercache.hasOwnProperty(id + '')) return GitHub.usercache[id + ''];
        if ((typeof id === 'string' || id instanceof String) && !/^\d+$/g.test(id)) return GitHub.usercache.put(id, new User(request(api + '/users/' + id)));
        else return GitHub.usercache.put(id + '', new User(request(api + '/user/' + id)));
    }
    static getUserByName = (name) => {
        if (GitHub.usercache.hasOwnProperty(name)) return GitHub.usercache[name];
        return GitHub.usercache.put(name, new User(request(api + '/users/' + name)));
    }
    static getRepository = (id) => {
        if ((typeof id === 'string' || id instanceof String) && !/^\d+$/g.test(id)) return new Repository(request(api + '/repos/' + id));
        else return new Repository(request(api + '/repositories/' + id));
    }
    static getRepositoryByName = (user, name) => {
        if (name) return new Repository(request(api + '/repos/' + user + '/' + name));
        else return new Repository(request(api + '/repos/' + user));
    }
    static getFile = (url) => {
        return new File(request(url));
    }
    static getGist = (id) => {
        return new Gist(request(api + '/gists/' + id));
    }

}

export {GitHub, User, Repository, Organisation, Gist, File, Event, Git};
