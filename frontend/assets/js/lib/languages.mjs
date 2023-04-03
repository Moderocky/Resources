class Language {

    constructor(name = 'Unknown', icon = 'fa-solid fa-microchip', colour = 'amber', description = '') {
        this.name = name;
        this.icon = icon;
        this.colour = colour;
        this.description = description;
    }

    async matches(repository) {
        const languages = await repository.getLanguages();
        return languages.hasOwnProperty(this.name);
    }

}

function getDetails(language) {
    switch (language) {
        case 'Java': return new Language('Java', 'fa-brands fa-java', 'orange-500', 'The most popular JVM programming language.');
        case 'JavaScript': return new Language('JavaScript', 'fa-brands fa-js-square', 'emerald-500', 'A popular scripting language for browsers and apps.');
        case 'CSS': return new Language('CSS', 'fa-brands fa-css3-alt', 'sky-500', 'A style-sheet format used by webpages.');
        case 'HTML': return new Language('HTML', 'fa-brands fa-html5', 'red-500', 'The mark-up language used to build webpages.');
        case 'PHP': return new Language('PHP', 'fa-brands fa-php', 'indigo-500', 'A popular backend language for websites.');
        case 'Shell' || 'Bash': return new Language(language, 'fa-solid fa-scroll', 'lime-500', 'A scripting language native to UNIX-based machines.');
        case 'Ruby': return new Language('Ruby', 'fa-solid fa-scroll', 'rose-400');
        case 'Python': return new Language('Python', 'fa-brands fa-python', 'cyan-400', 'A scripting language popular with beginners.');
        default: return new Language(language);
    }
}

const languages = {
    'ByteSkript': new Language('ByteSkript', 'fa-solid fa-music', 'violet-400', 'A compiled JVM language designed to be beginner-accessible.'),
    'Skript': new Language('Skript', 'fa-solid fa-scroll', 'teal-400', 'A scripting language for Minecraft.')
}

languages.ByteSkript.matches = async (repository) => {
    return false;
    const contents = await repository.getContents();
    for (let content of contents) if (content.path.endsWith('.bsk')) return true;
    return false;
}

languages.Skript.matches = async (repository) => {
    return false;
    const contents = await repository.getContents();
    for (let content of contents) if (content.path.endsWith('.sk')) return true;
    return false;
}

function getLanguage(language) {
    return languages[language] || (languages[language] = getDetails(language));
}
function getLanguages() {
    const array = [];
    for (let key in languages) array.push(languages[key]);
    return array;
}

export {Language, languages, getLanguages, getLanguage}
