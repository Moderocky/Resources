
import {http} from "./request.mjs";
import {session} from "./session.mjs";
import {GitHub} from "./github.mjs";
const account = {
    id: null,
    user: null,
    resolved: false,
}

account.login = function (url = true) {
    if (url === true) url = window.location;
    window.location = 'https://github.com/login/oauth/authorize?' + http.formEncode({
        client_id: 'Iv1.5b5f5c814012e08f',
        redirect_uri: 'http://localhost:2040/login',
        state: session.id + '->' + encodeURI(url)
    })
};
account.getUser = async function() {
    if (account.user != null) return account.user;
    const id = await account.getId();
    return account.user = await GitHub.getUser(id);
};
account.getId = async function () {
    if (account.resolved || account.id != null) return account.id;
    account.id = await http.post('/login', {session: session.id}).then(JSON.parse).then(data => data.user);
    account.resolved = true;
    return account.id;
};
account.isLoggedIn = async () => (await account.getId()) != null;

export {account}
