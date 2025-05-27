// js/audioController.js
document.addEventListener('DOMContentLoaded', function() {
    const musicaFundo = document.getElementById('musicaFundo');
    
    // Configurações da música
    musicaFundo.volume = 0.3; // Volume em 30%
    musicaFundo.loop = true; // Repetir continuamente

    // Estratégia para autoplay: toca após qualquer interação do usuário
    const playMusica = () => {
        musicaFundo.play()
            .then(() => {
                // Remove os event listeners após o sucesso
                document.removeEventListener('click', playMusica);
                document.removeEventListener('keydown', playMusica);
            })
            .catch(error => console.log("Autoplay bloqueado."));
    };

    // Tenta tocar imediatamente (pode falhar em alguns navegadores)
    playMusica();

    // Se falhar, espera a primeira interação do usuário (clique ou tecla)
    document.addEventListener('click', playMusica);
    document.addEventListener('keydown', playMusica);
});