
import {dom} from "./lib/dom.mjs";
import {repository} from "./load.mjs";
import {GitHub} from "./lib/github.mjs";
import {countDownloads} from "./lib/repository_utils.mjs";

repository.awaitReady().then(repository => {
    for (const element of document.querySelectorAll('[data-resource-icon]')) {
        element.src = getIcon();
    }

    for (const element of document.querySelectorAll('[data-author-icon]')) {
        element.src = repository['owner']['avatar_url'];
    }

    for (const element of document.querySelectorAll('[data-last-updated]')) {
        const time = repository['pushed_at'];
        const first = GitHub.parseDate(time), second = Date.now();
        element.appendChild(document.createTextNode(Math.round((second - first) / (1000 * 60 * 60 * 24)) + ' days ago.'));
    }
});

for (const element of document.querySelectorAll('[data-readme]')) {
    repository.getFileContent('README.md').then(text => {
        generateMarkdown(text, element);
        fixMarkdown(element);
    }).catch(reason => {
        generateMarkdown(`No description was provided for this resource.`, element);
        fixMarkdown(element);
    });
}

for (const element of document.querySelectorAll('[data-version-history]')) {
    repository.getReleases().then(releases => {
        if (releases == null || releases.length < 1) {
            document.querySelector('a[href="#version-history"]').href = '#';
            return;
        }
        document.querySelector('a[href="#version-history"]').classList.remove('cursor-not-allowed');
        if (releases.length > 10) releases.length = 10;
        for (let release of releases) {
            let div;
            if ((release['prerelease'] || release['draft'])) {
                div = dom.create(`
                    <div class="flex md:contents">
                        <div class="col-start-5 col-end-6 mr-10 md:mx-auto relative">
                            <div class="h-full w-6 flex items-center justify-center">
                                <div class="h-full w-1 bg-slate-800 dark:bg-slate-500 pointer-events-none"></div>
                            </div>
                            <div class="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-orange-500 shadow"></div>
                        </div>
                        <div class="bg-gradient-to-r from-orange-500 to-amber-500 col-start-6 col-end-10 p-4 px-8 rounded-xl my-4 mr-auto shadow-md">
                            <h3 class="font-semibold text-lg mb-1">` + release['tag_name'] + `</h3>
                            <p class="leading-tight text-justify">` + release['name'] + `</p>
                            <div data-assets class="text-3xl pt-2"></div>
                        </div>
                    </div>`);
            } else {
                div = dom.create(`
                    <div class="flex flex-row-reverse md:contents">
                        <div class="bg-gradient-to-r from-sky-500 to-cyan-400 col-start-1 col-end-5 p-4 px-8 rounded-xl my-4 ml-auto shadow-md">
                            <h3 class="font-semibold text-lg mb-1">` + release['tag_name'] + `</h3>
                            <p class="leading-tight text-justify">` + release['name'] + `</p>
                            <div data-assets class="text-3xl pt-2"></div>
                        </div>
                        <div class="col-start-5 col-end-6 md:mx-auto relative mr-10">
                            <div class="h-full w-6 flex items-center justify-center">
                                <div class="h-full w-1 bg-slate-800 dark:bg-slate-500 pointer-events-none"></div>
                            </div>
                            <div class="w-6 h-6 absolute top-1/2 -mt-3 rounded-full bg-sky-500 shadow"></div>
                        </div>
                    </div>`);
            }
            for (let asset of release['assets']) {
                let icon;
                if (asset.name.endsWith('.zip')) icon = `<i class="fa-solid fa-file-zipper w-9"></i>`;
                else if (asset.name.endsWith('.jar')) icon = `<i class="fa-solid fa-file-zipper w-9"></i>`;
                else if (asset.name.endsWith('.png')) icon = `<i class="fa-solid fa-file-image w-9"></i>`;
                else if (asset.name.endsWith('.sh')) icon = `<i class="fa-solid fa-file-code w-9"></i>`;
                else if (asset.name.endsWith('.csv')) icon = `<i class="fa-solid fa-file-csv w-9"></i>`;
                else icon = `<i class="fa-solid fa-file-lines w-9"></i>`;
                icon = dom.create(icon);
                icon.classList.add('cursor-alias');
                icon.onclick = () => window.open(asset['browser_download_url'], '_blank');
                div.querySelector('[data-assets]').appendChild(icon);
            }
            element.appendChild(div);
        }
    }).catch(reason => {
        generateMarkdown(`No releases are available.`, element);
        fixMarkdown(element);
    });
}

function generateMarkdown(text, container) {
    const htm = marked.parse(text);
    const elements = dom.createMulti(htm);
    let current = dom.createElement('div', 'section', 'py-6', 'px-6', 'mb-4', 'rounded-xl', 'bg-white', 'bg-opacity-10', 'shadow-xl');
    let has = false;
    for (let element of elements) {
        if (element.tagName != null && element.tagName.startsWith('H') && has === true) {
            if (current != null && current.childNodes.length > 0) container.appendChild(current);
            current = dom.createElement('div', 'section', 'py-6', 'px-6', 'mb-4', 'rounded-xl', 'bg-white', 'bg-opacity-10', 'shadow-xl');
            has = false;
        } else if (element.tagName != null && (element.tagName === 'P' || element.tagName === 'UL' || element.tagName === 'OL' || element.tagName === 'PRE' || element.tagName === 'CODE')) has = true;
        if (element.tagName === 'H1') element.classList.add('border-b-2', 'border-gray-200', 'dark:border-gray-600');
        current.appendChild(element);
    }
    if (current != null) container.appendChild(current);
    return container;
}

function fixMarkdown(element) {
    for (let pre of element.querySelectorAll('pre')) pre.classList.add('rounded-xl', 'bg-gray-200', 'dark:bg-gray-600');
    for (let code of element.querySelectorAll('p > code')) code.classList.add('rounded-sm', 'bg-gray-200', 'dark:bg-gray-600');
    for (let a of element.querySelectorAll('a')) a.classList.add('text-sky-600', 'hover:text-sky-500', 'transition-colors');
    for (let summary of element.querySelectorAll('details > summary')) summary.classList.add('cursor-pointer', 'transition-colors');
    for (let ul of element.querySelectorAll('ul')) {
        ul.classList.add('list-disc', 'ml-6');
        for (let li of ul.querySelectorAll('li')) li.classList.add('mb-2');
    }
    for (let ol of element.querySelectorAll('ol')) {
        ol.classList.add('list-decimal', 'ml-6');
        for (let li of ol.querySelectorAll('li')) li.classList.add('mb-2');
    }
    return element;
}

export {generateMarkdown, fixMarkdown}

repository.awaitReady().then(async repository => {
    for (const element of document.querySelectorAll('[data-link-to-repo]')) {
        if (element.tagName === 'A') element.href = repository['html_url'];
        else element.onclick = () => window.location = repository['html_url'];
    }

    for (const element of document.querySelectorAll('[data-retrieve]')) {
        let value = retrieve(element.dataset.retrieve);
        if (typeof value === 'function') {
            if (value.constructor.name === 'AsyncFunction') element.appendChild(document.createTextNode((await value()) || ''));
            else element.appendChild(document.createTextNode(value() || ''));
        } else element.appendChild(document.createTextNode(value || ''));
    }
});

countDownloads(repository).then();

repository.getContributors().then(list => {
    for (const element of document.querySelectorAll('[data-display-contributors]')) {
        let x = 0;
        for (let user of list) {
            x++;
            if (user['type'] !== 'User') continue;
            element.appendChild(dom.create(`<div class="m-2 text-md flex space-x-2"><img class="rounded-xl w-8 h-8" src="` + user['avatar_url'] + `" alt="avatar"><p class="my-auto">` + user['login'] + `</p></div>`));
            if (x > 4) {
                element.appendChild(dom.create(`<div class="m-2 text-md flex space-x-2"><p class="my-auto">+ ` + (list.length - 5) + ` more...</p></div>`));
                break;
            }
        }
    }
});

function getIcon() {
    return repository['owner']['avatar_url'];
}

function retrieve(property = '', object = repository) {
    if (property == null || property === '') return object;
    if (property.includes('.')) {
        let point = property.indexOf('.');
        return retrieve(property.substring(point + 1), object[property.substring(0, point)]);
    } else return object[property];
}
