
import {http} from './request.mjs';
const api = '/api/git';

async function gitRequest(url, vars = {}) {
    return await http.get(api + url).then(JSON.parse);
}

async function request(url, body) {
    if (url.includes('api.github')) {
        url = url.substring('https://api.github.com'.length);
        const result = await gitRequest(url);
        return result.data;
    } else {
        return JSON.parse(await http.get(url, body));
    }
}

class GitHub {
    url;
    files = [];
    repository = null;

    constructor(link) {
        if (link.endsWith('/')) this.url = link;
        else this.url = link + '/';
        try {
            this.listFiles().catch(console.log);
            this.getRepository().catch(console.log);
        } catch (error) {
            console.log(error);
        }
    }

    internal = {
        contents: (link) => link + 'contents',
        releases: (link) => link + 'releases',
        contributors: (link) => link + 'contributors',
        languages: (link) => link + 'languages',
        createRelease: (data, github) => {
            data._github = github;
            return data;
        },
        createUser: (data, github) => {
            data._github = github;
            data.display_name = data.name || data['login'];
            data.getRepositories = async function () {
                try {
                    if (data._repos != null) return data._repos;
                    data._repos = [];
                    for (let repo of (await request(data['repos_url']))) data._repos.push(github.internal.createRepository(repo, github));
                    return data._repos || [];
                } catch (error) {
                    return data._repos || [];
                }
            }
            data.getLanguages = async function () {
                try {
                    if (data._languages != null) return data._languages;
                    data._languages = {};
                    for (let repo of await data.getRepositories()) {
                        if (repo['fork']) continue;
                        const languages = await repo.getLanguages();
                        for (let key in languages) {
                            if (data._languages.hasOwnProperty(key)) data._languages[key] += languages[key];
                            else data._languages[key] = languages[key];
                        }
                    }
                    return data._languages || {};
                } catch (error) {
                    return data._languages || {};
                }
            }
            return data;
        },
        createRepository: (data, github) => {
            data._github = github;
            data.version = async function () {
                try {
                    if (data._version != null) return data._version;
                    data._version = (await github.latestRelease(true))['tag_name'];
                    return data._version;
                } catch (error) {
                    return data._version || '';
                }
            }
            data.getOwner = async function () {
                return github.internal.createUser((await request(data['owner'].url)), github);
            }
            data.getLanguages = async function () {
                try {
                    if (data._languages != null) return data._languages;
                    data._languages = await request(data['languages_url']);
                    return data._languages || {};
                } catch (error) {
                    return data._languages || {};
                }
            }
            return data;
        }
    }

    parseDate(time) {
        return new Date(time);
    }

    async getRepository() {
        if (this.repository != null) return this.repository;
        if (this.url.endsWith('/')) return this.repository = this.internal.createRepository((await request(this.url.substring(0, this.url.length - 1))), this);
        else return this.repository = this.internal.createRepository((await request(this.url)), this);
    }

    async getFile(name) {
        return (await request(this.internal.contents(this.url) + name));
    }

    async getFileContent(name) {
        return atob((await this.getFile(name)).content);
    }

    async latestRelease(draft = false) {
        try {
            if (draft) return this.internal.createRelease((await this.listReleases())[0], this);
            else return this.internal.createRelease((await request(this.internal.releases(this.url) + 'latest')), this);
        } catch (error) {
            return null;
        }
    }

    async listContributors() {
        return (await request(this.internal.contributors(this.url)));
    }

    async listReleases() {
        return (await request(this.internal.releases(this.url)));
    }

    async listFiles() {
        if (this.files.length < 1) this.files = (await request(this.internal.contents(this.url)));
        return this.files;
    }

    async listXMLFiles() {
        const files = await this.listFiles(), array = [];
        for (const file of files) if (file.path.endsWith('.xml')) array.push(file);
        return array;
    }

}

export {GitHub};
