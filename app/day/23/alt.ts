const left = (color: number) => color + 1;
const right = (color: number) => color + 2;

const fromHallToRoom = [
    [2, 4, 6, 8],
    [1, 3, 5, 7],
    [1, 1, 3, 5],
    [3, 1, 1, 3],
    [5, 3, 1, 1],
    [7, 5, 3, 1],
    [8, 6, 4, 2],
];
const fromRoomToHall = [
    [2, 1, 1, 3, 5, 7, 8],
    [4, 3, 1, 1, 3, 5, 6],
    [6, 5, 3, 1, 1, 3, 4],
    [8, 7, 5, 3, 1, 1, 2],
];

function isSolution(rooms: number[][]) {
    for (let color = 0; color < 4; color++) {
        for (let i = 0; i < 4; i++) {
            if (rooms[color][i] !== color) return false;
        }
    }
    return true;
}

function isImpossible(rooms: number[][], hall: number[], iHall: number) {
    const color = hall[iHall];
    let wrongCount = 0;

    for (let i = 0; i < 4; i++) {
        const insideColor = rooms[color][i];
        if (insideColor === null) continue;
        if (iHall <= left(insideColor) && right(insideColor) <= iHall) wrongCount++;
        else if (iHall >= right(insideColor) && left(insideColor) >= iHall) wrongCount++;
    }

    if (iHall <= left(color)) {
        const r = right(color);
        if (r + wrongCount >= 7) return true;
        for (let i = r; i < r + wrongCount; i++) if (hall[i] !== null) return true;
    } else if (iHall >= right(color)) {
        const l = left(color);
        if (l - wrongCount < 0) return true;
        for (let i = l; i > l - wrongCount; i--) if (hall[i] !== null) return true;
    }

    return false;
}

function toHall(hall: number[], color: number) {
    const ret = [];

    for (let i = left(color); i >= 0; i--) {
        if (hall[i] !== null) break;
        ret.push(i);
    }

    for (let i = right(color); i < 7; i++) {
        if (hall[i] !== null) break;
        ret.push(i);
    }

    return ret;
}

function toRoom(rooms: number[][], hall: number[], iHall: number) {
    const color = hall[iHall];
    if (iHall <= left(color)) {
        for (let i = iHall + 1; i <= left(color); i++) {
            if (hall[i] !== null) return false;
        }
    } else {
        for (let i = iHall - 1; i >= right(color); i--) {
            if (hall[i] !== null) return false;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (rooms[color][i] !== null && rooms[color][i] !== color) return false;
    }

    return true;
}

function straightToRoom(rooms: number[][], hall: number[], color: number) {
    const topColor = rooms[color].find((x) => x !== null);
    if (color === topColor) return false;

    // Target clear
    for (let i = 0; i < 4; i++) {
        if (rooms[topColor][i] !== null && rooms[topColor][i] !== topColor) return false;
    }

    // Path clear
    if (topColor > color) {
        for (let i = right(color); i <= left(topColor); i++) if (hall[i] !== null) return false;
    } else {
        for (let i = left(color); i >= right(topColor); i--) if (hall[i] !== null) return false;
    }

    return true;
}

const memo = new Map();
export function backtracking(rooms: number[][], hall: number[], cost = 0, moves = []) {
    // TODO: Don't believe there's any reason to NOT return. Should instead update cost of solution
    const key = `${rooms.join(",")};${hall.join(",")}`;
    if (memo.has(key) && memo.get(key) <= cost) return;
    memo.set(key, cost);

    if (isSolution(rooms)) {
        console.log("Found solution...");
        console.log(cost);
        console.log(moves);
        return;
    }

    // Hall to (correct) room
    for (let iHall = 0; iHall < 7; iHall++) {
        if (hall[iHall] !== null && toRoom(rooms, hall, iHall)) {
            const newRooms = rooms.map((x) => x.slice());
            const newHall = hall.slice();

            const color = hall[iHall];
            const topIndex = rooms[color].findLastIndex((x) => x === null);
            newRooms[color][topIndex] = color;
            newHall[iHall] = null;

            const costToAdd = fromHallToRoom[iHall][color] + topIndex + 1;

            backtracking(
                newRooms,
                newHall,
                cost + costToAdd * Math.pow(10, color),
                moves.concat(`h${iHall},r${color}`)
            );
        }
    }

    // Room to hall
    for (let color = 0; color < 4; color++) {
        if (rooms[color].filter((x) => x === color).length === 4) continue; // FINISHED! DONT DO ANYTHING!!!
        const topIndex = rooms[color].findIndex((x) => x !== null);
        if (topIndex === -1) continue;

        if (straightToRoom(rooms, hall, color)) {
            const newRooms = rooms.map((x) => x.slice());

            const targetColor = rooms[color][topIndex];
            const targetIndex = rooms[targetColor].findLastIndex((x) => x === null);
            newRooms[color][topIndex] = null;
            newRooms[targetColor][targetIndex] = targetColor;

            const costToAdd = topIndex + 1 + Math.abs(targetColor - color) * 2 + targetIndex + 1;

            backtracking(
                newRooms,
                hall,
                cost + costToAdd * Math.pow(10, targetColor),
                moves.concat(`r${color},r${targetColor}`)
            );

            continue;
        }

        for (const iHall of toHall(hall, color)) {
            const newRooms = rooms.map((x) => x.slice());
            const newHall = hall.slice();

            newHall[iHall] = rooms[color][topIndex];
            newRooms[color][topIndex] = null;

            if (!isImpossible(newRooms, newHall, iHall)) {
                const costToAdd = fromRoomToHall[color][iHall] + topIndex + 1;

                backtracking(
                    newRooms,
                    newHall,
                    cost + costToAdd * Math.pow(10, rooms[color][topIndex]),
                    moves.concat(`r${color},h${iHall}`)
                );
            }
        }
    }
}
