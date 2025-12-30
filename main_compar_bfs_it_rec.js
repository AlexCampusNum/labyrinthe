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

const caseDepart = labyData.find(cell => cell.entrance);
const caseSortie = labyData.find(cell => cell.exit);

// Fonction pour réinitialiser les couleurs
function resetColors() {
    labyData.forEach(cell => {
        if (!cell.entrance && !cell.exit) {
            const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
            div.style.backgroundColor = "";
        }
    });
}

// Trouver les voisins valides
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
        if (caseActuelle.walls[dir.mur] === false) {
            voisins.push(voisin);
        }
    });

    return voisins;
}

// ========== DFS ITÉRATIF ==========
async function DFS_iteratif(labyrinthe, caseDepart, caseSortie) {
    console.log("=== DFS ITÉRATIF ===");
    let pile = [caseDepart];
    let cheminActuel = new Set();
    let cellsInStack = new Set();
    let cellsVisitedCount = 0;

    cheminActuel.add(`${caseDepart.posX},${caseDepart.posY}`);
    cellsInStack.add(`${caseDepart.posX},${caseDepart.posY}`);

    while (pile.length > 0) {
        let caseActuelle = pile[pile.length - 1];
        cellsVisitedCount++;

        if (!caseActuelle.entrance && !caseActuelle.exit) {
            const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
            divActuelle.style.backgroundColor = "#00bfff";
            await new Promise(r => setTimeout(r, 20));
        }

        if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
            console.log("Sortie trouvée !");
            console.log("Cases visitées:", cellsVisitedCount);
            console.log("Longueur du chemin:", pile.length);

            pile.forEach(cell => {
                if (!cell.entrance && !cell.exit) {
                    const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
                    div.style.backgroundColor = "yellow";
                }
            });
            return pile;
        }

        const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, cellsInStack);

        if (voisins.length > 0) {
            const prochainVoisin = voisins[0];
            cheminActuel.add(`${prochainVoisin.posX},${prochainVoisin.posY}`);
            cellsInStack.add(`${prochainVoisin.posX},${prochainVoisin.posY}`);
            pile.push(prochainVoisin);
        } else {
            const celluleRetiree = pile.pop();
            if (celluleRetiree) {
                cheminActuel.delete(`${celluleRetiree.posX},${celluleRetiree.posY}`);
                if (!celluleRetiree.entrance && !celluleRetiree.exit) {
                    const div = document.getElementById(`cell-${celluleRetiree.posX}-${celluleRetiree.posY}`);
                    div.style.backgroundColor = "#ddd";
                }
            }
        }
    }

    console.log("Aucun chemin trouvé");
    return null;
}

// ========== DFS RÉCURSIF ==========
let visitedCells = new Set();
let cellsVisitedCount = 0;

async function DFS_recursive(labyrinthe, caseActuelle, caseSortie, chemin = []) {
    const key = `${caseActuelle.posX},${caseActuelle.posY}`;
    visitedCells.add(key);
    chemin.push(caseActuelle);
    cellsVisitedCount++;

    if (!caseActuelle.entrance && !caseActuelle.exit) {
        const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
        divActuelle.style.backgroundColor = "#00bfff";
        await new Promise(r => setTimeout(r, 20));
    }

    if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
        console.log("Sortie trouvée !");
        console.log("Cases visitées:", cellsVisitedCount);
        console.log("Longueur du chemin:", chemin.length);

        chemin.forEach(cell => {
            if (!cell.entrance && !cell.exit) {
                const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
                div.style.backgroundColor = "yellow";
            }
        });
        return chemin;
    }

    const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, visitedCells);

    for (const voisin of voisins) {
        const resultat = await DFS_recursive(labyrinthe, voisin, caseSortie, chemin);
        if (resultat) return resultat;
    }

    chemin.pop();

    if (!caseActuelle.entrance && !caseActuelle.exit) {
        const div = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
        div.style.backgroundColor = "#ddd";
    }

    return null;
}

async function resoudreLabyrintheRecursif(labyrinthe, caseDepart, caseSortie) {
    console.log("=== DFS RÉCURSIF ===");
    visitedCells = new Set();
    cellsVisitedCount = 0;
    return await DFS_recursive(labyrinthe, caseDepart, caseSortie, []);
}

// ========== BFS ==========
async function BFS(labyrinthe, caseDepart, caseSortie) {
    console.log("=== BFS (Breadth First Search) ===");
    let queue = [caseDepart]; // File d'attente FIFO
    let visite = new Set();
    let parents = new Map();
    let cellsVisitedCount = 0;

    visite.add(`${caseDepart.posX},${caseDepart.posY}`);
    parents.set(`${caseDepart.posX},${caseDepart.posY}`, null);

    while (queue.length > 0) {
        let caseActuelle = queue.shift(); // FIFO : prendre le premier
        cellsVisitedCount++;

        if (!caseActuelle.entrance && !caseActuelle.exit) {
            const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
            divActuelle.style.backgroundColor = "#00bfff";
            await new Promise(r => setTimeout(r, 20));
        }

        if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
            console.log("Sortie trouvée !");
            console.log("Cases visitées:", cellsVisitedCount);

            // Reconstruire le chemin
            let chemin = [];
            let current = `${caseSortie.posX},${caseSortie.posY}`;

            while (current !== null) {
                const [x, y] = current.split(',').map(Number);
                const cell = labyrinthe.find(c => c.posX === x && c.posY === y);
                chemin.unshift(cell);
                current = parents.get(current);
            }

            console.log("Longueur du chemin:", chemin.length);

            chemin.forEach(cell => {
                if (!cell.entrance && !cell.exit) {
                    const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
                    div.style.backgroundColor = "yellow";
                }
            });

            return chemin;
        }

        const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, visite);

        for (const voisin of voisins) {
            const voisinKey = `${voisin.posX},${voisin.posY}`;
            visite.add(voisinKey);
            parents.set(voisinKey, `${caseActuelle.posX},${caseActuelle.posY}`);
            queue.push(voisin); // Ajouter à la fin
        }
    }

    console.log("Aucun chemin trouvé");
    return null;
}

// ========== BOUTONS ==========
const buttonDFSIteratif = document.createElement("button");
buttonDFSIteratif.textContent = "DFS Itératif";
buttonDFSIteratif.style.marginRight = "10px";
document.body.insertBefore(buttonDFSIteratif, maze);

const buttonDFSRecursif = document.createElement("button");
buttonDFSRecursif.textContent = "DFS Récursif";
buttonDFSRecursif.style.marginRight = "10px";
document.body.insertBefore(buttonDFSRecursif, maze);

const buttonBFS = document.createElement("button");
buttonBFS.textContent = "BFS";
buttonBFS.style.marginRight = "10px";
document.body.insertBefore(buttonBFS, maze);

buttonDFSIteratif.addEventListener("click", async () => {
    buttonDFSIteratif.disabled = true;
    buttonDFSRecursif.disabled = true;
    buttonBFS.disabled = true;
    resetColors();
    await DFS_iteratif(labyData, caseDepart, caseSortie);
    buttonDFSIteratif.disabled = false;
    buttonDFSRecursif.disabled = false;
    buttonBFS.disabled = false;
});

buttonDFSRecursif.addEventListener("click", async () => {
    buttonDFSIteratif.disabled = true;
    buttonDFSRecursif.disabled = true;
    buttonBFS.disabled = true;
    resetColors();
    await resoudreLabyrintheRecursif(labyData, caseDepart, caseSortie);
    buttonDFSIteratif.disabled = false;
    buttonDFSRecursif.disabled = false;
    buttonBFS.disabled = false;
});

buttonBFS.addEventListener("click", async () => {
    buttonDFSIteratif.disabled = true;
    buttonDFSRecursif.disabled = true;
    buttonBFS.disabled = true;
    resetColors();
    await BFS(labyData, caseDepart, caseSortie);
    buttonDFSIteratif.disabled = false;
    buttonDFSRecursif.disabled = false;
    buttonBFS.disabled = false;
});