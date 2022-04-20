export const cookie = {
    set: function (name, value, date) {
        if (!date) {
            date = new Date();
            date.setTime(date.getTime() + (6 * 60 * 60 * 1000));
        }
        let expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    },
    get: function (name, def = null) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
            if (cookie.indexOf(name + "=") === 0) return cookie.substring(name.length + 1, cookie.length);
        }
        return def;
    },
    exists: function (name) {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);
            if (cookie.indexOf(name + "=") === 0) return true;
        }
        return false;
    },
    clear: (name) => document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}
