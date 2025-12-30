const taille = "25";
const exemple = "ex-0";

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

// trouver un voisin valide
function trouverVoisinsValides(caseActuelle, labyrinthe, cheminActuel) {
    const x = caseActuelle.posX;
    const y = caseActuelle.posY;

    // Directions: [dx, dy, murActuel, nom]
    // dx affecte posX (lignes), dy affecte posY (colonnes)
    // walls: [0=haut, 1=droite, 2=bas, 3=gauche]
    // true = mur présent, false = pas de mur (passage libre)
    const directions = [
        {dx: -1, dy: 0, mur: 0, nom: "haut"},    // aller vers le haut
        {dx: 0, dy: 1, mur: 1, nom: "droite"},   // aller vers la droite
        {dx: 1, dy: 0, mur: 2, nom: "bas"},      // aller vers le bas
        {dx: 0, dy: -1, mur: 3, nom: "gauche"}   // aller vers la gauche
    ];

    const voisins = [];

    directions.forEach(dir => {
        const nx = x + dir.dx; // dx affecte posX (lignes)
        const ny = y + dir.dy; // dy affecte posY (colonnes)

        // Vérifier que le voisin existe
        const voisin = labyrinthe.find(c => c.posX === nx && c.posY === ny);
        if (!voisin) return;

        // Vérifier qu'on n'a pas déjà visité cette cellule
        if (cheminActuel.has(`${nx},${ny}`)) return;

        // true = mur présent (bloqué), false = pas de mur (passage libre)
        // Il suffit de vérifier qu'il n'y a pas de mur du côté où on veut aller
        if (caseActuelle.walls[dir.mur] === false) {
            console.log(`Passage trouvé de (${x},${y}) vers (${nx},${ny}) direction ${dir.nom}`);
            voisins.push(voisin);
        }
    });

    return voisins;
}

// DFS animé
async function resoudreLabyrintheAnime(labyrinthe, caseDepart, caseSortie) {
    let pile = [caseDepart];
    let cheminActuel = new Set();
    let cellsInStack = new Set(); // Pour suivre les cellules dans la pile
    cheminActuel.add(`${caseDepart.posX},${caseDepart.posY}`);
    cellsInStack.add(`${caseDepart.posX},${caseDepart.posY}`);

    let iterations = 0;
    const maxIterations = 10000; // Sécurité contre boucle infinie

    while (pile.length > 0 && iterations < maxIterations) {
        iterations++;
        let caseActuelle = pile[pile.length - 1];

        // colorer la case actuelle en bleu clair
        if (!caseActuelle.entrance && !caseActuelle.exit) {
            const divActuelle = document.getElementById(`cell-${caseActuelle.posX}-${caseActuelle.posY}`);
            divActuelle.style.backgroundColor = "#00bfff";
            await new Promise(r => setTimeout(r, 20));
        }

        // si on est arrivé à la sortie
        if (caseActuelle.posX === caseSortie.posX && caseActuelle.posY === caseSortie.posY) {
            console.log("Sortie trouvée !");
            // colorer le chemin final en jaune
            pile.forEach(cell => {
                if (!cell.entrance && !cell.exit) {
                    const div = document.getElementById(`cell-${cell.posX}-${cell.posY}`);
                    div.style.backgroundColor = "yellow";
                }
            });
            return pile;
        }

        // trouver tous les voisins valides non dans le chemin actuel
        const voisins = trouverVoisinsValides(caseActuelle, labyrinthe, cellsInStack);

        if (voisins.length > 0) {
            // prendre le premier voisin disponible
            const prochainVoisin = voisins[0];
            cheminActuel.add(`${prochainVoisin.posX},${prochainVoisin.posY}`);
            cellsInStack.add(`${prochainVoisin.posX},${prochainVoisin.posY}`);
            pile.push(prochainVoisin);
        } else {
            // aucun voisin disponible, reculer
            const celluleRetiree = pile.pop();
            if (celluleRetiree) {
                cheminActuel.delete(`${celluleRetiree.posX},${celluleRetiree.posY}`);
                // NE PAS retirer de cellsInStack - on garde l'historique des cellules visitées
                // colorer en gris les cellules où on recule
                if (!celluleRetiree.entrance && !celluleRetiree.exit) {
                    const div = document.getElementById(`cell-${celluleRetiree.posX}-${celluleRetiree.posY}`);
                    div.style.backgroundColor = "#ddd";
                }
            }
        }
    }

    if (iterations >= maxIterations) {
        console.log("Nombre maximum d'itérations atteint");
    } else {
        console.log("Aucun chemin possible");
    }
    return null;
}

// ajouter un bouton pour lancer la recherche
const button = document.createElement("button");
button.textContent = "Résoudre le labyrinthe";
document.body.insertBefore(button, maze);

button.addEventListener("click", async () => {
    button.disabled = true;
    await resoudreLabyrintheAnime(labyData, caseDepart, caseSortie);
    button.disabled = false;
});