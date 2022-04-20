const http = {
    formEncode: function (content) {
        if (content instanceof String) return content;
        else {
            const array = [];
            for (const key in content) if (content.hasOwnProperty(key)) array.push(key + '=' + encodeURI(content[key]));
            return array.join('&');
        }
    },
    current: function () {
        location.hash
        if (location.search == null || location.search.length < 1) return {};
        const request = {}, pairs = location.search.substring(1).split('&');
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i].split('=');
            request[pair[0]] = pair[1];
        }
        return request;
    },
    post: async function (url, content, headers = {}) {
        return await this.postRaw(url, content, headers);
    },
    postRaw: async function (url, content, headers = {}) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return await fetch(url, {
            method: 'POST',
            body: this.formEncode(content),
            headers: headers
        });
    },
    get: async function (url, content, headers = {}) {
        return this.getRaw(url, content, headers).then(response => response.text());
    },
    getRaw: async function (url, content, headers = {}) {
        let tail = '';
        if (content != null) tail = '?' + this.formEncode(content);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        return await fetch(url + tail, {
            method: 'GET',
            headers: headers
        });
    }
}

export {http};
