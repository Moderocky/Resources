function retrieve(property = '', object) {
    if (property == null || property === '') return object;
    if (property.includes('.')) {
        let point = property.indexOf('.');
        return retrieve(property.substring(point + 1), object[property.substring(0, point)]);
    } else return object[property];
}

function abbreviateNumber(value) {
    let altered = value;
    if (value >= 1000) {
        const suffixes = ["", "k", "m", "b", "t"], suffix = Math.floor(("" + value).length / 3);
        let short = '';
        for (let precision = 2; precision >= 1; precision--) {
            short = parseFloat((suffix !== 0 ? (value / Math.pow(1000, suffix)) : value).toPrecision(precision));
            const dot = (short + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dot.length <= 2) {
                break;
            }
        }
        if (short % 1 !== 0) short = short.toFixed(1);
        altered = short + suffixes[suffix];
    }
    return altered;
}

async function countDownloads(repository) {
    const releases = await repository.getReleases();
    let downloads = 0;
    for (let release of releases) {
        if (release == null || release.assets == null) continue;
        downloads += (release.assets.length > 0) ? release.assets[0].download_count : 0;
        for (const element of document.querySelectorAll('[data-downloads-count]')) element.innerText = abbreviateNumber(downloads);
    }
}

export {countDownloads, abbreviateNumber, retrieve};
