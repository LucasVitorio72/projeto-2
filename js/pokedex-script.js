const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImg = document.querySelector('.pokemon_image');
const pokemonTipo = document.querySelector('.pokemon_tipo');
const pokemonDesc = document.querySelector('.pokemon_desc');

// Controle da música de fundo
const bgMusic = document.getElementById('bgMusic');

if (bgMusic) {
    bgMusic.volume = 0.2;

    function enableMusic() {
        bgMusic.play().catch(e => console.log("Reprodução bloqueada:", e));
        document.removeEventListener('click', enableMusic);
    }

    document.addEventListener('click', enableMusic, { once: true });
}

// Controle dos sons da Pokédex
const changeSound = document.getElementById('changeSound');

if (changeSound) {
    changeSound.volume = 0.8;
}

function playChangeSound() {
    if (!changeSound) return;

    try {
        changeSound.currentTime = 0;
        changeSound.play().catch(e => {
            console.log("Reprodução de som bloqueada:", e);
        });
    } catch (e) {
        console.log("Erro ao reproduzir som", e);
    }
}

// Animação das luzes
const bolaAzul = document.querySelector('.bola_azul');
const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const inputPrev = document.querySelector('.btn-prev');
const inputNext = document.querySelector('.btn-next');

// Tradução dos tipos para português
function translateType(type) {
    const typeTranslations = {
        'normal': 'Normal',
        'fire': 'Fogo',
        'water': 'Água',
        'electric': 'Elétrico',
        'grass': 'Planta',
        'ice': 'Gelo',
        'fighting': 'Lutador',
        'poison': 'Veneno',
        'ground': 'Terrestre',
        'flying': 'Voador',
        'psychic': 'Psíquico',
        'bug': 'Inseto',
        'rock': 'Pedra',
        'ghost': 'Fantasma',
        'dragon': 'Dragão',
        'dark': 'Sombrio',
        'steel': 'Aço',
        'fairy': 'Fada'
    };
    return typeTranslations[type] || type;
}

// Cache simples para traduções
const translationCache = {};

async function translateText(text, targetLang = 'pt') {
    const cacheKey = `${text}-${targetLang}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();

        if (data.responseData?.translatedText) {
            const cleanText = data.responseData.translatedText.replace(/\(\)/g, '').replace(/\s+/g, ' ').trim();
            translationCache[cacheKey] = cleanText;
            return cleanText;
        }
        return text;
    } catch (error) {
        console.error('Erro na tradução:', error);
        return text;
    }
}

async function getPokemonDescription(speciesData) {
    const ptDescription = speciesData.flavor_text_entries.find(entry => entry.language.name === 'pt');
    if (ptDescription) return ptDescription.flavor_text.replace(/\n/g, ' ');

    const enDescription = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
    if (!enDescription) return 'Descrição não disponível';

    const englishText = enDescription.flavor_text.replace(/\n/g, ' ');
    return await translateText(englishText) || englishText;
}

let searchPokemon = 1;

const fetchPokemon = async (pokemon) => {
    try {
        const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        if (APIResponse.status !== 200) return null;

        const data = await APIResponse.json();
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        data.speciesData = speciesData;
        return data;
    } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        return null;
    }
}

function setBackgroundByType(type) {
    const typeBackgrounds = {
        fire: 'img/terreno_fogo.png',
        water: 'img/terreno_agua.png',
        grass: 'img/terreno_grama.png',
        ground: 'img/terrenos/rocha.png',
        // Adicione mais conforme necessário
    };

    const imgPath = typeBackgrounds[type] || 'img/default_bg.png';
    const pokemonBackground = document.querySelector('.pokemon-background');
    if (pokemonBackground) {
        pokemonBackground.style.backgroundImage = `url('${imgPath}')`;
    }
}

const renderPokemon = async (pokemon) => {
    if (pokemonName) pokemonName.innerHTML = 'Carregando...';
    if (pokemonNumber) pokemonNumber.innerHTML = '';
    if (pokemonDesc) pokemonDesc.innerHTML = 'Carregando...';

    const data = await fetchPokemon(pokemon);

    if (data) {
        playChangeSound();
        bolaAzul?.classList.remove('flash');
        void bolaAzul?.offsetWidth;
        bolaAzul?.classList.add('flash');

        const gifUrl = data.sprites.versions['generation-v']['black-white'].animated.front_default;
        const pngUrl = data.sprites.front_default;

        pokemonImg.onerror = function () {
            this.src = pngUrl || 'img/placeholder.png';
        };

        if (pokemonImg) {
            pokemonImg.style.display = 'block';
            pokemonImg.src = gifUrl || pngUrl;
        }

        if (pokemonName) pokemonName.innerHTML = data.name.toUpperCase();
        if (pokemonNumber) pokemonNumber.innerHTML = data.id;

        const types = data.types.map((t) => translateType(t.type.name));
        if (pokemonTipo) pokemonTipo.innerHTML = types.join(' / ');

        if (pokemonDesc) pokemonDesc.innerHTML = await getPokemonDescription(data.speciesData);

        if (input) input.value = '';
        searchPokemon = data.id;

        setBackgroundByType(data.types[0].type.name);
    } else {
        if (pokemonImg) pokemonImg.style.display = 'none';
        if (pokemonName) pokemonName.innerHTML = 'Não Encontrado! :C';
        if (pokemonNumber) pokemonNumber.innerHTML = '';
        if (pokemonDesc) pokemonDesc.innerHTML = '';
    }
}

// Event Listeners
form?.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});

inputPrev?.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }
});

inputNext?.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});

// Inicializa com o primeiro Pokémon
renderPokemon(searchPokemon);

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuLinks = document.querySelectorAll('.menu-link');
    const preloadedPages = new Set();

    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) link.classList.add('ativo');

        link.addEventListener('mouseenter', () => {
            if (!preloadedPages.has(href)) {
                fetch(href)
                    .then(response => {
                        if (response.ok) {
                            preloadedPages.add(href);
                        }
                    })
                    .catch(err => console.warn('Erro ao pré-carregar:', err));
            }
        });
    });
});
