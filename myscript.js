const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); // Outil de dessin du canvas

// Configuration
const squareSize = 50; // Taille d'un pixel dans la représentation de la grille
const rows = 10;
const cols = 15;

// Dimension du canva
canvas.width = cols * squareSize;
canvas.height = rows * squareSize;

function drawCartesianGrid(size, r, c) {
    ctx.strokeStyle = "#ccc"; // Couleur des lignes de la grille
    for (let i = 0; i <= c; i++) {
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, r * size);
    }
    for (let j = 0; j <= r; j++) {
        ctx.moveTo(0, j * size);
        ctx.lineTo(c * size, j * size);
    }
    ctx.stroke(); // Dessine les lignes
}

// On lance le dessin de la grille
drawCartesianGrid(squareSize, rows, cols);

/**
 * Convertit les coordonnées d'un carré unitaire (grille)
 * en coordonnées de pixel haut-gauche sur le canvas.
 */
function toPixelCoordinate(x, y) {
    return {
        x: x * squareSize,
        y: y * squareSize
    };
}

/**
 * Convertit un point (x,y) du canvas en pixels 
 * vers les coordonnées (colonne, ligne) de la grille.
 */
function toCartesianCoordinate(x, y) {
    return {
        x: Math.floor(x / squareSize), // Calcule l'index de la colonne
        y: Math.floor(y / squareSize)  // Calcule l'index de la ligne
    };
}

/**
 * Remplit un carré unitaire de la grille avec une couleur.
 */
function fillSquare(x, y, color) {
    // Récupération des pixels du coin haut-gauche 
    const coords = toPixelCoordinate(x, y); 
    
    // Couleur de remplissage
    ctx.fillStyle = color;
    
    // Dessin du carré(x_pixel, y_pixel, largeur, hauteur)
    // On enlève 1 pixel pour laisser la grille visible 
    ctx.fillRect(coords.x + 1, coords.y + 1, squareSize - 2, squareSize - 2); 
}

// Outil sélectionné par défaut ("brush" pour pinceau, "eraser" pour gomme)
let currentTool = "brush"; 

// Couleur de remplissage par défaut
let currentColor = "black"; 

function handleClick(event) {
    // 1. Conversion vers le repère du canvas
    const canvasCoords = toCanvasCoordinate(event.clientX, event.clientY);

    // 2. Conversion en coordonnées de la grille
    const coords = toCartesianCoordinate(canvasCoords.x, canvasCoords.y);

    // 3. Action en fonction de l'outil sélectionné
    if (currentTool === "brush") {
        fillSquare(coords.x, coords.y, currentColor);
    } else if (currentTool === "eraser") {
        clearSquare(coords.x, coords.y);
    }
}

// Variable d'état globale pour savoir si le bouton de la souris est enfoncé
let isDrawing = false;

/**
 * Fonction qui gère le tracé continu
 * Elle convertit les pixels du canvas en coordonnées de grille et colorie la case.
 */
function handleDrag(x, y) {
    // x, y sont déjà en coordonnées canvas ici
    const coords = toCartesianCoordinate(x, y);
    
    if (currentTool === "brush") {
        fillSquare(coords.x, coords.y, currentColor);
    } else if (currentTool === "eraser") {
        clearSquare(coords.x, coords.y);
    }
}

// ÉCOUTEURS D'ÉVÉNEMENTS 

// On commence à dessiner quand on appuie sur le bouton
canvas.addEventListener("mousedown", () => { 
    isDrawing = true; 
});

// On arrête de dessiner quand on relâche le bouton
canvas.addEventListener("mouseup", () => { 
    isDrawing = false; 
});

// On gère le mouvement de la souris
canvas.addEventListener("mousemove", (event) => {
    if (isDrawing) {
        const canvasCoords = toCanvasCoordinate(event.clientX, event.clientY);
        handleDrag(canvasCoords.x, canvasCoords.y);
    }
});

/**
 * Convertit la coordonnée (x, y) de la souris en coordonnées relatives au canvas.
 */
function toCanvasCoordinate(x, y) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

/**
 * Vide un carré unitaire de la grille (Gomme).
 */
function clearSquare(x, y) {
    const coords = toPixelCoordinate(x, y);
    // On efface le carré en laissant 1 pixel pour la grille, exactement comme dans fillSquare
    ctx.clearRect(coords.x + 1, coords.y + 1, squareSize - 2, squareSize - 2);
}
/**
  * Vide toute la grille.
 */
function clearAll() {
    // 1. On efface l'intégralité des pixels du canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 2. On redessine ta grille par-dessus
    drawCartesianGrid(squareSize, rows, cols);
}


function addTools() {
    const toolsDiv = document.getElementById("tools");

    // Bouton Pinceau
    const brushButton = document.createElement("button");
    brushButton.textContent = "Pinceau";
    brushButton.addEventListener("click", () => {
        currentTool = "brush";
        console.log("Outil actuel : Pinceau");
    });

    // Sélecteur de couleur (palette)
    const colorPicker = document.createElement("input");
    colorPicker.type = "color";
    colorPicker.value = currentColor; // Couleur par défaut
    colorPicker.addEventListener("input", (event) => {
        currentColor = event.target.value;
        console.log("Couleur sélectionnée :", currentColor);
    });

    // Bouton Gomme
    const eraserButton = document.createElement("button");
    eraserButton.textContent = "Gomme";
    eraserButton.addEventListener("click", () => {
        currentTool = "eraser";
        console.log("Outil actuel : Gomme");
    });
    // Bouton Tout effacer
    const clearButton = document.createElement("button");
    clearButton.textContent = "Tout effacer";
    clearButton.addEventListener("click", clearAll);
    
    //bouton telecharger
    const exportButton = document.createElement("button");
    exportButton.textContent = "Telecharger l'image";
    exportButton.style.marginLeft = "10px"; // Un peu d'espace

    exportButton.addEventListener("click", () => {
        // 1. Convertit le contenu du canvas en URL de données (image PNG)
        const imageURI = canvas.toDataURL("image/png");
        
        // 2. Crée un lien invisible pour forcer le téléchargement
        const link = document.createElement("a");
        link.download = "mon-dessin.png";
        link.href = imageURI;
        
        // 3. Simule un clic sur le lien
        link.click();
    });
    // Ajout dans l'ordre : Pinceau → Palette → Gomme -> effacer tout --> 
    toolsDiv.appendChild(brushButton);
    toolsDiv.appendChild(colorPicker);
    toolsDiv.appendChild(eraserButton);
    toolsDiv.appendChild(clearButton);
    toolsDiv.appendChild(exportButton);
}

    
addTools();

