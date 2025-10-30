class Pokedeck {

    static favoritos = JSON.parse(localStorage.getItem('favoritos')) || []; // ⭐ Cargar favoritos desde localStorage

    static async addRandomCard() {
        await this.addCard();
    }

    // Añadir carta
    static async addCard(pokemonId = Utils.randomPokemonNumber()) {

        // Desactivar botón
        // document.querySelector(".addcard").disabled = true;

        let deck = document.querySelector(".deck");

        deck.innerHTML += ` 
            <!-- CARD  -->
            <div class="bg-light m-2 card shadow d-inline-block" style="width: 18rem;">
                <button id="containersound" class="btn" onclick="Pokedeck.playSound(this.closest('.card'))">
                    <img id="sound" src="./image/sonido.png" alt="">
                </button> 

                <button id="containerfav" class="btn favorito" onclick="Pokedeck.favoritoBoton()">
                    <img id="favorito" src="./image/favorito (1).png" alt="">
                </button>

                <img src="#" class="card-img-top pokemon-image obscured" alt="...">
                <div class="card-body">

                    <div>

                    <h5 class="card-title d-none">...</h5>

                    <img id="type1" src="#" alt="...">
                    <img id="type2" src="#" alt="...">
                    <button id="containerShiny" class="btn d-none" onclick="Pokedeck.revealShiny(this.closest('.card'))"> <img id="shiny" src="./image/shiny.png" alt=""> </button>

                    </div>

                    <p class="card-text d-none">...</p>  
                    <input type="text" class="form-control guess-input" placeholder="Who's that Pokémon?">
                    

                </div>
                <ul class="list-group list-group-flush abilities-list d-none"> 
                    <li class="list-group-item bg-light">An item</li>
                    <li class="list-group-item bg-light">A second item</li>
                    <li class="list-group-item bg-light">A third item</li>
                </ul>
                <div class="card-body">
                    <a href="#" class=" skip btn btn-info card-link" onclick="Pokedeck.rellenaCarta(this.closest('.card'), Utils.randomPokemonNumber())">Skip</a>
                    <a href="#" class="btn btn-group card-link"></a> <!--no se que es esto pero mantiene un espacio  --> 
                    <button class="btn btn-warning card-link idk" onclick="Pokedeck.revealCard(this.closest('.card'))">I Don't Know</button> 
                </div>
            </div>
            <!-- END CARD -->
        `;

        // Rellenar carta 
        let cards = document.querySelectorAll('.card');
        await Pokedeck.rellenaCarta(cards[cards.length - 1], pokemonId);

        // Reactivar Botón
        // document.querySelector(".addcard").disabled = false;
    }

    static win = false;
    static counterNo = 0;
    static counterYes = 0;

    static revealCard(card) {
        Pokedeck.validator = true;
        Pokedeck.favorito = false;

        let skip = card.querySelector('.skip');
        skip.classList.remove('disabled');

        if (Pokedeck.win) {
            Pokedeck.counterYes++
            document.getElementById("countYes").innerText = ": " + (Pokedeck.counterYes)
        } else {
            Pokedeck.counterNo++
            document.getElementById("countNo").innerText = ": " + (Pokedeck.counterNo)
        }

        let img = card.querySelector('.pokemon-image');
        let h5 = card.querySelector('.card-title');
        let description = card.querySelector('.card-text');
        let abilitiesList = card.querySelector('.abilities-list');
        let shinyButton = card.querySelector('#containerShiny');

        shinyButton.classList.remove('d-none');
        shinyButton.classList.add('d-block');
        img.classList.remove('obscured');
        h5.classList.remove('d-none');
        h5.classList.add('d-block');
        description.classList.remove('d-none');
        abilitiesList.classList.remove('d-none');

        let guessInput = card.querySelector('.guess-input');
        guessInput.disabled = true; // Bloquear el input

        // Bloquear el idk
        let idk = card.querySelector(".idk");
        idk.disabled = true;
    }

    // Update carta, rellenar la nueva
    static validator = false;

    static async rellenaCarta(card, pokemon) {
        Pokedeck.typesPokemon(pokemon)
        Pokedeck.validator = false;
        Pokedeck.favorito = false;
        Pokedeck.win = false;
        Pokedeck.shiny = false;

        card.querySelector(".idk").disabled = false; //activar idk
        document.getElementById('favorito').src = './image/favorito (1).png';

        // Reiniciar el campo de texto
        let guessInput = card.querySelector('.guess-input');
        guessInput.value = '';
        guessInput.disabled = false;

        let skip = card.querySelector('.skip');
        skip.classList.add('disabled');

        // Ocultar imagen, nombre, descripción y habilidades al inicio
        let img = card.querySelector('.pokemon-image');
        img.classList.add('obscured');

        let h5 = card.querySelector('h5');
        h5.classList.add('d-none');

        let description = card.querySelector('.card-text');
        description.classList.add('d-none');

        let abilitiesList = card.querySelector('.abilities-list');
        abilitiesList.classList.add('d-none');

        let shinyButton = card.querySelector('#containerShiny');
        shinyButton.classList.add('d-none');

        // Obtener datos del Pokémon
        let url = "https://pokeapi.co/api/v2/pokemon/" + pokemon;
        let pokemonData = await Utils.pokeAPI(url);

        // Imagen del Pokémon
        img.src = pokemonData.sprites.other["official-artwork"].front_default;

        // Nombre del Pokémon       
        let pokemonName = pokemonData.name;
        h5.innerHTML = pokemonName;
        console.log("El pokemon es:", pokemonName);

        // Descripción
        let species = await Utils.pokeAPI(pokemonData.species.url);
        let texts = species.flavor_text_entries;
        let filtrados = texts.filter((text) => text.language.name == 'es');

        if (filtrados.length > 0) {
            description.innerHTML = filtrados[0].flavor_text;
        } else {
            description.innerHTML = texts[0].flavor_text;
        }

        // Lista de habilidades
        abilitiesList.innerHTML = '';

        for (let a of pokemonData.abilities) {
            let item = document.createElement('li');
            item.className = "list-group-item bg-light";
            item.innerHTML = a.ability.name;
            abilitiesList.appendChild(item);
        }

        // 🔹Eliminar eventos anteriores del input (para evitar duplicados)
        let newGuessInput = guessInput.cloneNode(true);
        guessInput.replaceWith(newGuessInput);

        //🔹Verificar el texto del input
        newGuessInput.addEventListener('input', () => {
            let userGuess = newGuessInput.value.trim().toLowerCase();
            if (userGuess === pokemonName.toLowerCase()) {
                Pokedeck.win = true;
                Pokedeck.revealCard(card);
                newGuessInput.disabled = true;
            }
        });

    }

    static currentAudio = null;

    static async playSound(card) {
        let pokemonName = card.querySelector(".card-title").textContent.toLowerCase();
        let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        let pokemonData = await Utils.pokeAPI(url);

        if (pokemonData.cries && pokemonData.cries.latest) {
            // Si ya hay un sonido reproduciéndose, no hacer nada
            if (Pokedeck.currentAudio && !Pokedeck.currentAudio.ended) return;

            let button = card.querySelector("#containersound");
            button.disabled = true; // Desactivar el botón mientras suena el audio

            let audio = new Audio(pokemonData.cries.latest);
            Pokedeck.currentAudio = audio; // Guardar referencia al audio en curso
            audio.play();

            // 🔹Reactivar botón cuando termine el sonido
            audio.onended = () => {
                Pokedeck.currentAudio = null;
                button.disabled = false;
            };
        }
    }

    static favoritoBoton() { 
        if (!Pokedeck.validator) return;
    
        let card = document.querySelector('.card');
    
        let pokemonImage = card.querySelector('.pokemon-image').src;
        let pokemonName = card.querySelector('.card-title').textContent;
    
        let favoritoBtn = card.querySelector('#containerfav img');
    
        // Buscar el Pokémon en la lista de favoritos
        let index = Pokedeck.favoritos.findIndex(fav => fav.name == pokemonName);
    
        // Si el Pokémon no está en favoritos, agregarlo
        if (index == -1) {
            Pokedeck.favoritos.push({ name: pokemonName, image: pokemonImage });  //  Agregar nuevo favorito
            favoritoBtn.src = './image/favorito (2).png';  // Cambiar icono a favorito
        } else {
            Pokedeck.favoritos.splice(index, 1);  //  Eliminar favorito
            favoritoBtn.src = './image/favorito (1).png';  // Cambiar icono a no favorito
        }
    
        // Guardar la lista de favoritos en el localStorage
        localStorage.setItem('favoritos', JSON.stringify(Pokedeck.favoritos)); 
    
        // Actualizar el modal de favoritos
        Pokedeck.updateFavoritesModal();  
    }
    
    static favorito = false;
    
    static updateFavoriteButton(pokemonName) {
        // Buscar el Pokémon en la lista de cartas
        let allCards = document.querySelectorAll('.card');
        allCards.forEach(card => {
            let cardTitle = card.querySelector('.card-title').textContent;
            let favoritoBtn = card.querySelector('#containerfav img');
    
            // Si el nombre coincide, actualizar el estado del botón de favorito
            if (cardTitle === pokemonName) {
                let index = Pokedeck.favoritos.findIndex(fav => fav.name == pokemonName);
                if (index == -1) {
                    favoritoBtn.src = './image/favorito (1).png';  // Cambiar a no favorito
                } else {
                    favoritoBtn.src = './image/favorito (2).png';  // Cambiar a favorito
                }
            }
        });
    }
    
    static updateFavoritesModal() {
        let addDiv = document.querySelector('.add');
        addDiv.innerHTML = ''; 
        
        // Recorrer la lista de favoritos
        Pokedeck.favoritos.forEach((fav, i) => {
            
            // Contenedor para cada favorito
            let favoriteContainer = document.createElement('div');
            favoriteContainer.classList.add('favorite-item');
    
            // imagen del Pokémon favorito
            let imgElement = document.createElement('img');
            imgElement.src = fav.image;
            imgElement.alt = "Pokemon favorito";
            imgElement.classList.add('favorite-pokemon-image');
    
            // botón para eliminar el favorito
            let removeBtn = document.createElement('button');
            removeBtn.innerHTML = 'X';
            removeBtn.classList.add('remove-favorite-btn');
    
            // evento para eliminar el favorito
            removeBtn.addEventListener('click', function (e) {
                e.stopPropagation();  //  Evitar propagación a elementos padres 
    
                // Eliminar el favorito de la lista
                Pokedeck.favoritos.splice(i, 1); 
    
                // Actualizar el localStorage con la nueva lista de favoritos
                localStorage.setItem('favoritos', JSON.stringify(Pokedeck.favoritos));  
    
                Pokedeck.updateFavoritesModal();  
    
                // Actualizar el botón de favorito en la carta
                Pokedeck.updateFavoriteButton(fav.name);  // Se añadió esta línea
            });
    
            // imagen y el botón al contenedor
            favoriteContainer.appendChild(imgElement);
            favoriteContainer.appendChild(removeBtn);
    
            // Añadir el contenedor al contenedor principal del modal
            addDiv.appendChild(favoriteContainer);
        });
    }
    
    

    static shiny = false;
    static async revealShiny(card) {

        let img = card.querySelector('.pokemon-image');

        let pokemonName = card.querySelector('.card-title').textContent.toLowerCase();

        let url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
        let pokemonData = await Utils.pokeAPI(url);

        if (Pokedeck.shiny) {
            img.src = pokemonData.sprites.other["official-artwork"].front_default;
        } else {
            img.src = pokemonData.sprites.other["official-artwork"].front_shiny;
        }

        Pokedeck.shiny = !Pokedeck.shiny;
    }

    static async typesPokemon(pokemon) {
        let url = `https://pokeapi.co/api/v2/pokemon/${pokemon}`;
        let pokemonData = await Utils.pokeAPI(url);

        let imgType1 = document.getElementById("type1");
        let imgType2 = document.getElementById("type2");

        let types = pokemonData.types.map(t => t.type.name);

        // Verificar si tiene al menos un tipo y asignar la imagen correspondiente
        imgType1.style.display = "none";
        imgType2.style.display = "none";

        if (types[0]) {
            imgType1.src = Types.image[types[0]] || "";
            imgType1.style.display = "block";
        }

        if (types[1]) {
            imgType2.src = Types.image[types[1]] || "";
            imgType2.style.display = "block";
        }
    }

}



// Actualización: al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    Pokedeck.updateFavoritesModal();
});
