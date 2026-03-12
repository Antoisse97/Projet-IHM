const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d"); // Outil de dessin du canvas

// Configuration
const squareSize = 50; // Taille d'un pixel dans la représentation de la grille
const rows = 14;
const cols = 28;
const undoStack = [];
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
 * Ajout Haithem
 */

// Palette couleurs récentes
const MAX_RECENT = 6;
let recentColors = [];

// Case actuellement survolée pour le preview
let hoveredCell = null;
let savedCellData = null;

/**
 * Fin Ajout
 */


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
    } else if (currentTool === "bucket") { // <-- NOUVEAU
    console.log("Remplissage lancé sur la case :", coords.x, coords.y);
    fillBucket(coords.x, coords.y, currentColor);
}
}

/** 
 * Ajout 2 - Haithem
 */

function showPreview(x, y) {
    if (isDrawing) return;
    if (x < 0 || x >= cols || y < 0 || y >= rows) return;

    const coords = toPixelCoordinate(x, y);
    savedCellData = {
        x, y,
        imageData: ctx.getImageData(coords.x + 1, coords.y + 1, squareSize - 2, squareSize - 2)
    };

    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = currentTool === "eraser" ? "#ffffff" : currentColor;
    ctx.fillRect(coords.x + 1, coords.y + 1, squareSize - 2, squareSize - 2);
    ctx.restore();
}

function hidePreview() {
    if (!savedCellData) return;
    const coords = toPixelCoordinate(savedCellData.x, savedCellData.y);
    ctx.putImageData(savedCellData.imageData, coords.x + 1, coords.y + 1);
    savedCellData = null;
}
function addToRecentColors(color) {
    recentColors = recentColors.filter(c => c !== color);
    recentColors.unshift(color);
    if (recentColors.length > MAX_RECENT) recentColors = recentColors.slice(0, MAX_RECENT);
    renderRecentColors();
}

function renderRecentColors() {
    const container = document.getElementById("recent-colors");
    if (!container) return;
    container.innerHTML = "";
    recentColors.forEach(color => {
        const swatch = document.createElement("div");
        swatch.className = "color-swatch";
        swatch.style.backgroundColor = color;
        swatch.title = color;
        swatch.addEventListener("click", () => {
            currentColor = color;
            currentTool = "brush";
            const picker = document.getElementById("color-picker");
            if (picker) picker.value = color;
            setActiveToolButton("brush-btn");
        });
        container.appendChild(swatch);
    });
}

function setActiveToolButton(activeId) {
    ["brush-btn", "eraser-btn"].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle("tool-active", btn.id === activeId);
    });
}


/**
 * Fin Ajout 2
 */
// ÉCOUTEURS D'ÉVÉNEMENTS 


/**
 * Ajout 3
 */
// On commence à dessiner quand on appuie sur le bouton
canvas.addEventListener("mousedown", (event) => {
    saveState(); // <-- Ligne ajoutée : on sauvegarde avant de dessiner
    isDrawing = true;
    hidePreview();
    const cc = toCanvasCoordinate(event.clientX, event.clientY);
    const gc = toCartesianCoordinate(cc.x, cc.y);
    if (currentTool === "brush") {
        fillSquare(gc.x, gc.y, currentColor);
        addToRecentColors(currentColor);
    } else if (currentTool === "eraser") {
        clearSquare(gc.x, gc.y);
    }
    // On calcule les coordonnées et on lance l'outil immédiatement
    const canvasCoords = toCanvasCoordinate(event.clientX, event.clientY);
    handleDrag(canvasCoords.x, canvasCoords.y);
});

canvas.addEventListener("mouseup", (event) => {
    isDrawing = false;
    const cc = toCanvasCoordinate(event.clientX, event.clientY);
    const gc = toCartesianCoordinate(cc.x, cc.y);
    hoveredCell = gc;
    showPreview(gc.x, gc.y);
});

canvas.addEventListener("mousemove", (event) => {
    const cc = toCanvasCoordinate(event.clientX, event.clientY);
    const gc = toCartesianCoordinate(cc.x, cc.y);

    if (isDrawing) {
        if (currentTool === "brush") fillSquare(gc.x, gc.y, currentColor);
        else if (currentTool === "eraser") clearSquare(gc.x, gc.y);
        return;
    }

    if (!hoveredCell || hoveredCell.x !== gc.x || hoveredCell.y !== gc.y) {
        hidePreview();
        hoveredCell = gc;
        showPreview(gc.x, gc.y);
    }
    // On ne dessine en continu que si on n'utilise PAS le pot de peinture
    if (isDrawing && currentTool !== "bucket") {
        const canvasCoords = toCanvasCoordinate(event.clientX, event.clientY);
        handleDrag(canvasCoords.x, canvasCoords.y);
    }
});

canvas.addEventListener("mouseleave", () => {
    hidePreview();
    hoveredCell = null;
});

/** 
 * fin Ajout 3
 */


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

// Lit la couleur du pixel au centre d'une case de la grille
function getGridColor(x, y) {
    const px = x * squareSize + (squareSize / 2);
    const py = y * squareSize + (squareSize / 2);
    const data = ctx.getImageData(px, py, 1, 1).data;
    return data.join(','); // Retourne une chaîne "r,g,b,a"
}

// Algorithme de remplissage par diffusion (Breadth-First Search)
function fillBucket(startX, startY, newColor) {
    const targetColor = getGridColor(startX, startY);
    const queue = [{ x: startX, y: startY }];
    const visited = new Set();

    while (queue.length > 0) {
        const { x, y } = queue.shift();
        const key = `${x},${y}`;

        // Stop si hors limites ou déjà visité
        if (x < 0 || x >= cols || y < 0 || y >= rows || visited.has(key)) continue;
        visited.add(key);

        // Si la case correspond à la couleur de la zone cliquée
        if (getGridColor(x, y) === targetColor) {
            fillSquare(x, y, newColor); 
            
            // Ajout des cases voisines à vérifier
            queue.push({ x: x + 1, y });
            queue.push({ x: x - 1, y });
            queue.push({ x, y: y + 1 });
            queue.push({ x, y: y - 1 });
        }
    }
}
// Fonction pour sauvegarder l'état actuel
function saveState() {
    // getImageData copie tous les pixels actuels du canvas
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    undoStack.push(currentState);
}
// Fonction pour annuler la dernière action
function undo() {
    if (undoStack.length > 0) {
        // pop() retire et renvoie le dernier élément du tableau
        const lastState = undoStack.pop();
        // putImageData remet ces pixels sur le canvas
        ctx.putImageData(lastState, 0, 0);
    }
}
function addTools() {
    const toolsDiv = document.getElementById("tools");

  // Bouton Pot de peinture
    const bucketBtn = document.createElement("button");
    bucketBtn.textContent = "Pot de peinture";
    bucketBtn.addEventListener("click",() => {
        currentTool = "bucket";
        console.log("Outil actuel : Pot de peinture");
    })
    

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
        console.log("Couleur selectionnee :", currentColor);
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
     // Bouton Annuler
    const undoButton = document.createElement("button");
    undoButton.textContent = "Annuler";
    undoButton.addEventListener("click", undo);
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
  
    /**
     * Ajout 4 - Haithem
     */

    const recentLabel = document.createElement("span");
    recentLabel.textContent = "Recents :";
    recentLabel.style.fontSize = "13px";
    recentLabel.style.alignSelf = "center";

    const recentContainer = document.createElement("div");
    recentContainer.id = "recent-colors";
    recentContainer.style.display = "flex";
    recentContainer.style.gap = "5px";
    recentContainer.style.alignItems = "center";

    /**
     * Fin Ajout 4
     */

    // Ajout dans l'ordre : Pinceau → Palette → Gomme -> effacer tout --> 
    toolsDiv.appendChild(brushButton);
    toolsDiv.appendChild(colorPicker);
    toolsDiv.appendChild(eraserButton);
    toolsDiv.appendChild(clearButton);
    toolsDiv.appendChild(exportButton);
    toolsDiv.appendChild(bucketBtn);
    toolsDiv.appendChild(recentLabel);
    toolsDiv.appendChild(recentContainer);
    toolsDiv.appendChild(undoButton);
}

    
addTools();

