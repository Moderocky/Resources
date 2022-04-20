
function fixScrollBehaviour(node = document) {
    node.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (event) {
            event.preventDefault();
            window.location.hash = this.getAttribute('href');
            document.body.scrollIntoView();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

export {fixScrollBehaviour};
