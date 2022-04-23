
import {wait} from "./wait.mjs";
function fixScrollBehaviour(node = document) {
    node.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', async function (event) {
            event.preventDefault();
            const hash = this.getAttribute('href');
            if (hash.length < 2) return;
            window.location.hash = hash;
            await wait(200); document.querySelector(hash).scrollIntoView({ behavior: 'smooth' });
        });
    });
}

export {fixScrollBehaviour};
