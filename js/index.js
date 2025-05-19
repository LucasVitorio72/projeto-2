document.addEventListener('DOMContentLoaded', function() {
    // Adiciona classe ativa ao item do menu quando a página é carregada
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-link');
    
    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('ativo');
        }
        
        // Pré-carrega as páginas quando o mouse passa sobre o item
        link.addEventListener('mouseenter', function() {
            const pageToPreload = this.getAttribute('href');
            if (pageToPreload) {
                fetch(pageToPreload)
                    .then(response => response.text())
                    .catch(error => console.log('Pré-carregamento falhou:', error));
            }
        });
    });
});