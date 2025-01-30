// Récupérer le plateau de jeu
const gameBoardContainer = document.getElementById('game-board-container');
const gameBoard = document.getElementById('game-board');
// Masquer le plateau de jeu au démarrage
gameBoardContainer.classList.add('hidden');
let selectedGridSize = 4; // Par défaut, une grille 4x4

// Charger dynamiquement la liste des fichiers d'un JSON
async function fetchImages() {
    const response = await fetch('assets/images.json'); // Chemin vers le fichier JSON
    const images = await response.json();
    return images;
}

// Gestion de la sélection aléatoire des images
function getRandomImages(images, count) {
    const selectedImages = new Set();
    while (selectedImages.size < count) {
        const randomIndex = Math.floor(Math.random() * images.length);
        selectedImages.add(images[randomIndex]);
    }
    return Array.from(selectedImages);
}

// Gestion de la sélection de taille
document.querySelectorAll('.size-buttons button').forEach(button => {
    button.addEventListener('click', () => {
        // Retirer la classe 'active' des autres boutons
        document.querySelectorAll('.size-buttons button').forEach(btn => btn.classList.remove('active'));

        // Ajouter la classe 'active' au bouton cliqué
        button.classList.add('active');
console.log(`${button.textContent} est maintenant actif`);


        // Mettre à jour la taille de la grille sélectionnée
        selectedGridSize = parseInt(button.getAttribute('data-size'), 10);
        console.log(`Taille de la grille sélectionnée : ${selectedGridSize}x${selectedGridSize}`);
    });
});


// Gestion du bouton "Commencer le jeu"
document.querySelector('.start-button').addEventListener('click', () => {
    document.getElementById('game-setup').classList.add('hidden'); // Cache le formulaire
    document.getElementById('game-board-container').classList.remove('hidden'); // Affiche le plateau
    initializeGame(selectedGridSize); // Démarre le jeu avec la taille sélectionnée
    document.getElementById('restart').style.display = 'block'; // Affiche le bouton "Restart"
});

// Fonction de démarrage du jeu
async function initializeGame(gridSize) {
    const allImages = await fetchImages(); // Récupère les images du JSON
    const totalCards = gridSize * gridSize; // Calcule le nombre total de cartes
    const pals = getRandomImages(allImages, totalCards / 2); // Sélectionne la moitié des cartes nécessaires
    let cards = [...pals, ...pals]; // Duplique pour former les paires
    cards = shuffle(cards); // Mélange les cartes

    // Configure la grille dynamiquement
    if (gridSize === 2) {
        gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Colonnes dynamiques
        gameBoard.style.maxWidth = '350px'; // Limite la largeur totale à 350px
        gameBoard.innerHTML = '';
        } else {
            gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`; // Colonnes dynamiques pour les autres tailles
            gameBoard.style.maxWidth = 'unset'; // Supprime toute limite pour les autres grilles
            gameBoard.innerHTML = '';
    }

    // Crée les cartes sur le plateau
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = index;

        cardElement.innerHTML = `
            <div class="card-back"></div>
            <div class="card-front">
                <img src="assets/Images-Pals/${card}" alt="Pal">
            </div>
        `;
        gameBoard.appendChild(cardElement);
    });

    // Affiche le bouton "Restart" lorsque le jeu commence
    document.getElementById('restart').style.display = 'block';

    // Réinitialise les variables et événements
    flippedCards = [];
    lockBoard = false;

    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', flipCard);
    });
}

// Fonction de mélange
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// // Variables pour le suivi des cartes sélectionnées
// let flippedCards = [];
// let lockBoard = false; // Empêche de cliquer sur d'autres cartes pendant une comparaison

// Fonction pour retourner une carte
function flipCard() {
    if (lockBoard) return; // Bloque si le plateau est verrouillé
    if (this.classList.contains('flipped')) return; // Empêche de retourner une carte déjà retournée

    // Retourner la carte
    this.classList.add('flipped');
    flippedCards.push(this);

    // Vérifier si deux cartes sont retournées
    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

// Fonction pour vérifier si les deux cartes retournées correspondent
function checkForMatch() {
    lockBoard = true; // Bloque temporairement le plateau

    const [card1, card2] = flippedCards;
    const isMatch = card1.querySelector('img').src === card2.querySelector('img').src;

    if (isMatch) {
        // Les cartes correspondent
        flippedCards = [];
        lockBoard = false;
        checkForWin();
    } else {
        // Les cartes ne correspondent pas, les retourner après un délai
        setTimeout(() => {
            card1.classList.remove('flipped');
            card2.classList.remove('flipped');
            flippedCards = [];
            lockBoard = false;
        }, 1000);
    }
}

// Fonction pour vérifier la victoire
function checkForWin() {
    const allFlipped = document.querySelectorAll('.card.flipped');
    if (allFlipped.length === document.querySelectorAll('.card').length) {
        setTimeout(() => {
            showVictoryMessage(); // Affiche le message de victoire
        }, 500);;
    }
}

// Fonction pour afficher le message de victoire
function showVictoryMessage() {
    const victoryMessage = document.getElementById('victory-message');
    victoryMessage.style.display = 'block';

    // Ajouter un événement pour rejouer
    document.getElementById('play-again').addEventListener('click', () => {
        victoryMessage.style.display = 'none'; // Cache le message
        document.getElementById('game-board-container').classList.add('hidden'); // Cache le plateau
        document.getElementById('game-setup').classList.remove('hidden'); // Affiche le formulaire de sélection
        document.getElementById('restart').style.display = 'none'; // Cache le bouton "Restart"

        // Vider le plateau de jeu pour éviter qu'il reste visible
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = ''; // Vide la grille
    });
}

// Fonction pour redémarrer le jeu
function restartGame() {
    initializeGame(selectedGridSize); // Réinitialise le jeu avec de nouvelles images
}

// Gestion du bouton "Restart"
document.getElementById('restart').addEventListener('click', restartGame);
