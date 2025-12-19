const taille = "20";
const exemple = "ex-1";

const maze = document.getElementById("maze");
const labyData = LABYRINTHES[taille][exemple];

// console.log("JS chargé");
// console.log(LABYRINTHES);

maze.style.width = "400px";
maze.style.height = "400px";

for (let i = 0; i < taille * taille; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    maze.appendChild(cell);
}

maze.innerHTML = "";

labyData.forEach(cellData => {
    const cell = document.createElement("div");

    cell.classList.add("cell");
    cell.id = `cell-${cellData.posX}-${cellData.posY}`;

    cell.style.width = `calc(100% / ${taille})`;
    cell.style.height = `calc(100% / ${taille})`;

    maze.appendChild(cell);

    const walls = cellData.walls;

    if (walls[0]) cell.style.borderTop = "1px solid red";
    if (walls[1]) cell.style.borderRight = "1px solid red";
    if (walls[2]) cell.style.borderBottom = "1px solid red";
    if (walls[3]) cell.style.borderLeft = "1px solid red";

    if (cellData.entrance) {
        cell.classList.add("entrance");
    }

    if (cellData.exit) {
        cell.classList.add("exit");
    }
});