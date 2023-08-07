import { clone, flatMap, maxBy, minBy, range, uniq } from "lodash";

export function splitGroups(lines) {
    const groups = [];
    let group = [];

    lines.forEach((line) => {
        if (line.trim() === "") {
            groups.push(group);
            group = [];
        } else {
            group.push(line);
        }
    });
    if (group.length > 0) groups.push(group);

    return groups;
}

export function normalizePoints(points, { minX, maxX, minY, maxY }) {
    if (points.length === 0) return [];

    const [minPointX, maxPointX] = [minBy(points, "x").x, maxBy(points, "x").x];
    const [minPointY, maxPointY] = [minBy(points, "y").y, maxBy(points, "y").y];
    const [deltaX, deltaY] = [maxX - minX, maxY - minY];

    return points.map(({ x, y }) => ({
        x: minX + ((x - minPointX) / maxPointX) * deltaX,
        y: minY + ((y - minPointY) / maxPointY) * deltaY,
    }));
}

// Could use npm package instead
// https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
export function randomHSL(alpha = 1) {
    return `hsla(${Math.random() * 360} 60% 60% / ${alpha})`;
}

export function randomColorPalette(n, s = 60, l = 60) {
    const silverRatio = 1 / ((1 + Math.sqrt(5)) / 2);

    let angle = Math.random() * 360;
    const palette = [];
    for (let i = 0; i < n; i++) {
        palette.push(`hsl(${angle}deg ${s}% ${l}%)`);
        angle = (angle + silverRatio * 360) % 360;
    }

    return palette;
}

export function divmod(x, y) {
    return [Math.floor(x / y), x % y];
}

export function product(...arrays) {
    return arrays.reduce((acc, curr, i) =>
        flatMap(acc, (x) => curr.map((y) => [...(i === 1 ? [x] : x), y]))
    );
}

export function mapSum(map1, map2) {
    const ret = clone(map1);
    for (let k of map2.keys()) {
        ret.set(k, (map1.get(k) ?? 0) + map2.get(k));
    }
    return ret;
}

export function mapDiff(map1, map2) {
    const ret = clone(map1);
    for (let k of map2.keys()) {
        ret.set(k, (map1.get(k) ?? 0) - map2.get(k));
    }
    return ret;
}

// TODO: Should be fairly straightforward
export class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(priority, value) {
        const node = { priority, value };
        this.heap.push(node);

        let i = this.heap.length - 1;
        let p = this.parent(i);
        while (i && this.heap[p].priority > this.heap[i].priority) {
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
            p = this.parent(i);
        }
    }

    pop() {
        const root = this.heap.shift();
        if (this.heap.length === 0) return root.value;

        this.heap.unshift(this.heap.pop());

        let i = 0;
        let l = this.left(i);
        let r = this.right(i);

        let smallest = i;
        if (l < this.heap.length && this.heap[l].priority < this.heap[i].priority) {
            smallest = l;
        } else if (r < this.heap.length && this.heap[r].priority < this.heap[i].priority) {
            smallest = r;
        }

        while (smallest !== i) {
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
            l = this.left(i);
            r = this.right(i);

            if (l < this.heap.length && this.heap[l].priority < this.heap[i].priority) {
                smallest = l;
            } else if (r < this.heap.length && this.heap[r].priority < this.heap[i].priority) {
                smallest = r;
            }
        }

        return root.value;
    }

    left = (i) => i * 2 + 1;
    right = (i) => i * 2 + 2;
    parent = (i) => Math.floor((i - 1) / 2);
}

export function getSegmentIntersection([a1, a2], [b1, b2]) {
    if (a1 >= b1 && a2 <= b2) return [a1, a2];
    if (b1 >= a1 && b2 <= a2) return [b1, b2];
    if (a2 >= b1 && a2 <= b2) return [b1, a2];
    if (b1 >= a1 && b1 <= a2) return [b1, a2];
    if (a1 >= b1 && a1 <= b2) return [a1, b2];
    if (b2 >= a1 && b2 <= a2) return [a1, b2];
    return null;
}

export function permutations(...values) {
    return product(...values.map((_) => range(values.length)))
        .filter((p) => uniq(p).length === values.length)
        .map((p) => p.map((i) => values[i]));
}

export function combinations(values, k) {
    const ret = [];

    const v = Array(k + 1);
    v[0] = -1;
    let p = 1;
    while (p) {
        v[p] = (v[p] ?? v[p - 1]) + 1;
        if (v[p] === values.length) v[p--] = null;
        else if (p === k) ret.push(v.slice(1));
        else p++;
    }

    return ret.map((c) => c.map((i) => values[i]));
}

// Thank you to Taylor Hunt! First time I've used custom svg filters.
// https://codepen.io/tigt/pen/aZYqrg
export function pixelateFilter(radius) {
    return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeFlood x='${Math.floor(
        radius / 2
    )}' y='${Math.floor(
        radius / 2
    )}' height='1' width='1'/%3E%3CfeComposite width='${radius}' height='${radius}'/%3E%3CfeTile result='a'/%3E%3CfeComposite in='SourceGraphic' in2='a' operator='in'/%3E%3CfeMorphology operator='dilate' radius='${Math.floor(
        radius / 2
    )}'/%3E%3C/filter%3E%3C/svg%3E#b")`;
}
