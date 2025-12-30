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

// BFS avec animation
async function resoudreLabyrintheBFS(labyrinthe, caseDepart, caseSortie) {
    let queue = [caseDepart]; // File d'attente (FIFO)
    let visite = new Set();
    let parents = new Map(); // Pour reconstruire le chemin
    let cellsVisitedCount = 0;

    visite.add(`${caseDepart.posX},${caseDepart.posY}`);
    parents.set(`${caseDepart.posX},${caseDepart.posY}`, null);

    while (queue.length > 0) {
        // DIFFÉRENCE CLÉE AVEC DFS : on prend le PREMIER élément (FIFO)
        let caseActuelle = queue.shift(); // shift() = retirer le premier élément
        cellsVisitedCount++;

        // Colorer la case actuelle en bleu clair
        if (!caseActuelle.entrance && !caseActuelle.exit) {
            const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
            divActuelle.style.backgroundColor = "#00bfff";
            await new Promise(r => setTimeout(r, 20));
        }

        // Si on a trouvé la sortie
        if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
            console.log("Sortie trouvée avec BFS !");
            console.log("Nombre de cases visitées:", cellsVisitedCount);

            // Reconstruire le chemin en remontant les parents
            let chemin = [];
            let current = `${caseSortie.posX},${caseSortie.posY}`;

            while (current !== null) {
                const [x, y] = current.split(',').map(Number);
                const cell = labyrinthe.find(c => c.posX === x && c.posY === y);
                chemin.unshift(cell);
                current = parents.get(current);
            }

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
        const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, visite);

        for (const voisin of voisins) {
            const voisinKey = `${voisin.posX},${voisin.posY}`;
            visite.add(voisinKey);
            parents.set(voisinKey, `${caseActuelle.posX},${caseActuelle.posY}`);
            queue.push(voisin); // Ajouter à la fin de la file
        }
    }

    console.log("Aucun chemin trouvé");
    return null;
}

// Ajouter un bouton pour lancer la recherche BFS
const button = document.createElement("button");
button.textContent = "Résoudre (BFS)";
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

    await resoudreLabyrintheBFS(labyData, caseDepart, caseSortie);
    button.disabled = false;
});