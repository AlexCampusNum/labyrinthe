const taille = "20";
const exemple = "ex-1";

const maze = document.getElementById("maze");
const labyData = LABYRINTHES[taille][exemple];

maze.style.width = "400px";
maze.style.height = "400px";
maze.style.position = "relative";
maze.innerHTML = "";

// créer les cellules avec murs et entrée/sortie
labyData.forEach(cellData => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.id = `cell-${cellData.posX}-${cellData.posY}`;

    const cellSize = 400 / parseInt(taille);
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.position = "absolute";
    cell.style.left = `${cellData.posY * cellSize}px`;
    cell.style.top = `${cellData.posX * cellSize}px`;

    const walls = cellData.walls;
    if (walls[0]) cell.style.borderTop = "2px solid red";
    if (walls[1]) cell.style.borderRight = "2px solid red";
    if (walls[2]) cell.style.borderBottom = "2px solid red";
    if (walls[3]) cell.style.borderLeft = "2px solid red";

    if (cellData.entrance) cell.classList.add("entrance");
    if (cellData.exit) cell.classList.add("exit");

    maze.appendChild(cell);
});

// trouver case départ et sortie
const caseDepart = labyData.find(cell => cell.entrance);
const caseSortie = labyData.find(cell => cell.exit);

console.log("Case départ:", caseDepart);
console.log("Case sortie:", caseSortie);

// trouver les voisins valides
function trouverVoisinsValides(caseActuelle, labyrinthe, visite) {
    const x = caseActuelle.posX;
    const y = caseActuelle.posY;

    const directions = [
        {dx: -1, dy: 0, mur: 0, nom: "haut"},
        {dx: 0, dy: 1, mur: 1, nom: "droite"},
        {dx: 1, dy: 0, mur: 2, nom: "bas"},
        {dx: 0, dy: -1, mur: 3, nom: "gauche"}
    ];

    const voisins = [];

    directions.forEach(dir => {
        const nx = x + dir.dx;
        const ny = y + dir.dy;

        const voisin = labyrinthe.find(c => c.posX === nx && c.posY === ny);
        if (!voisin) return;

        if (visite.has(`${nx},${ny}`)) return;

        // true = mur présent, false = pas de mur
        if (caseActuelle.walls[dir.mur] === false) {
            voisins.push(voisin);
        }
    });

    return voisins;
}

// Variables globales pour la version récursive
let visitedCells = new Set();
let cellsVisitedCount = 0;

// DFS Récursif avec animation
async function DFS_recursive(labyrinthe, caseActuelle, caseSortie, chemin = []) {
    // Marquer comme visité
    const key = `${caseActuelle.posX},${caseActuelle.posY}`;
    visitedCells.add(key);
    chemin.push(caseActuelle);
    cellsVisitedCount++;

    // Colorer la case actuelle en bleu clair
    if (!caseActuelle.entrance && !caseActuelle.exit) {
        const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
        divActuelle.style.backgroundColor = "#00bfff";
        await new Promise(r => setTimeout(r, 20));
    }

    // Si on a trouvé la sortie
    if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
        console.log("Sortie trouvée !");
        console.log("Nombre de cases visitées:", cellsVisitedCount);
        console.log("Longueur du chemin:", chemin.length);

        // Colorer le chemin final en jaune
        chemin.forEach(cell => {
            if (!cell.entrance && !cell.exit) {
                const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
                div.style.backgroundColor = "yellow";
            }
        });
        return chemin;
    }

    // Explorer tous les voisins
    const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, visitedCells);

    for (const voisin of voisins) {
        const resultat = await DFS_recursive(labyrinthe, voisin, caseSortie, chemin);

        // Si on a trouvé un chemin, le retourner
        if (resultat) {
            return resultat;
        }
    }

    // Backtrack : retirer cette cellule du chemin
    chemin.pop();

    // Colorer en gris pour montrer le backtracking
    if (!caseActuelle.entrance && !caseActuelle.exit) {
        const div = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
        div.style.backgroundColor = "#ddd";
    }

    return null; // Aucun chemin trouvé depuis cette cellule
}

// Fonction wrapper pour lancer la recherche récursive
async function resoudreLabyrintheRecursif(labyrinthe, caseDepart, caseSortie) {
    // Réinitialiser les variables globales
    visitedCells = new Set();
    cellsVisitedCount = 0;

    const resultat = await DFS_recursive(labyrinthe, caseDepart, caseSortie, []);

    if (!resultat) {
        console.log("Aucun chemin trouvé");
    }

    return resultat;
}

// Ajouter un bouton pour lancer la recherche récursive
const button = document.createElement("button");
button.textContent = "Résoudre (DFS Récursif)";
button.style.marginRight = "10px";
document.body.insertBefore(button, maze);

button.addEventListener("click", async () => {
    button.disabled = true;

    // Réinitialiser les couleurs
    labyData.forEach(cell => {
        if (!cell.entrance && !cell.exit) {
            const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
            div.style.backgroundColor = "";
        }
    });

    await resoudreLabyrintheRecursif(labyData, caseDepart, caseSortie);
    button.disabled = false;
});