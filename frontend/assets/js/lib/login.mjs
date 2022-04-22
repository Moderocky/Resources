
import {http} from "./request.mjs";
import {session} from "./session.mjs";
export const login = function (url = true) {
    if (url === true) url = window.location;
    window.location = 'https://github.com/login/oauth/authorize?' + http.formEncode({
        client_id: 'Iv1.5b5f5c814012e08f',
        redirect_uri: 'http://localhost:2040/login',
        state: session.id + '->' + encodeURI(url)
    });
}
export const getUserID = async function () {
    return await http.post('/login', {session: session.id}).then(JSON.parse).then(data => data.user);
}
