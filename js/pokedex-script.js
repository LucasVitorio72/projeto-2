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

// Função para traduzir texto usando MyMemory API
async function translateText(text, targetLang = 'pt') {
    // Verifica se já temos no cache
    const cacheKey = `${text}-${targetLang}`;
    if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
    }

    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`);
        const data = await response.json();
        
        if (data.responseData && data.responseData.translatedText) {
            // Remove caracteres especiais que podem vir da API
            const cleanText = data.responseData.translatedText
                .replace(/\(\)/g, '')
                .replace(/\s+/g, ' ')
                .trim();
            
            // Armazena no cache
            translationCache[cacheKey] = cleanText;
            return cleanText;
        }
        return text;
    } catch (error) {
        console.error('Erro na tradução:', error);
        return text;
    }
}

// Função para obter a descrição do Pokémon com tradução
async function getPokemonDescription(speciesData) {
    // 1. Primeiro tenta em português
    const ptDescription = speciesData.flavor_text_entries.find(
        entry => entry.language.name === 'pt'
    );
    
    if (ptDescription) {
        return ptDescription.flavor_text.replace(/\n/g, ' ');
    }
    
    // 2. Se não tem em PT, busca em inglês
    const enDescription = speciesData.flavor_text_entries.find(
        entry => entry.language.name === 'en'
    );
    
    if (!enDescription) return 'Descrição não disponível';
    
    const englishText = enDescription.flavor_text.replace(/\n/g, ' ');
    
    // 3. Traduz do inglês para português
    return await translateText(englishText);
}

let searchPokemon = 1;

// Busca os dados do Pokémon
const fetchPokemon = async (pokemon) => {
    try {
        // Primeira requisição para dados básicos
        const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
        
        if (APIResponse.status !== 200) return null;
        
        const data = await APIResponse.json();
        
        // Segunda requisição para dados da espécie (com descrições)
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        
        // Adiciona os dados da espécie ao objeto principal
        data.speciesData = speciesData;
        
        return data;
    } catch (error) {
        console.error("Erro ao buscar Pokémon:", error);
        return null;
    }
}

// Renderiza o Pokémon na tela
const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Carregando...';
    pokemonNumber.innerHTML = '';
    pokemonDesc.innerHTML = 'Carregando...';

    const data = await fetchPokemon(pokemon);
    
    if (data) {
        playChangeSound();
        bolaAzul.classList.remove('flash');
        void bolaAzul.offsetWidth;
        bolaAzul.classList.add('flash');

        pokemonImg.style.display = 'block';
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
        pokemonImg.src = data['sprites']['versions']['generation-v']['black-white']['animated']['front_default'];
        
        const types = data.types.map((t) => translateType(t.type.name));
        pokemonTipo.innerHTML = types.join(' / ');

        // Exibe a descrição do Pokémon (com tradução se necessário)
        pokemonDesc.innerHTML = await getPokemonDescription(data.speciesData);

        input.value = '';
        searchPokemon = data.id;

       const pokemonBackground = document.querySelector('.pokemon-background');

        function setBackgroundByType(type) {
                const typeBackgrounds = {
        fire: 'img/terreno_fogo.png',
        water: 'img/terreno_agua.png',
        grass: 'img/terreno_grama.png',
        ground: 'img/terrenos/rocha.png',
        // Adicione mais conforme necessário
    };

    const imgPath = typeBackgrounds[type] || 'img/default_bg.png';
    pokemonBackground.style.backgroundImage = `url('${imgPath}')`;
}


    } else {
        pokemonImg.style.display = 'none';
        pokemonName.innerHTML = 'Não Encontrado! :C';
        pokemonNumber.innerHTML = '';
        pokemonDesc.innerHTML = '';
    }
}


// Event Listeners
form.addEventListener('submit', (event) => {
    event.preventDefault();    
    renderPokemon(input.value.toLowerCase());
});

inputPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }
});

inputNext.addEventListener('click', () => {
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

        // Adiciona classe 'ativo' se for a página atual
        if (href === currentPage) {
            link.classList.add('ativo');
        }

        // Pré-carregamento de páginas ao passar o mouse
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
