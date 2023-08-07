from collections import namedtuple
from itertools import combinations, product
from functools import cache
from timeit import timeit
from time import time

Scanner = namedtuple('Scanner', ['i', 'beacons'])
Beacon = namedtuple('Beacon', ['x','y','z'])

@cache
def line_length(b1, b2):
    return (b2.x - b1.x) ** 2 + (b2.y - b1.y) ** 2 + (b2.z - b1.z) ** 2

def axis_transforms(deltas1, deltas2):
    if set(map(abs, deltas1)) != set(map(abs, deltas2)):
        return None
    
    ret = []
    abs_deltas1 = list(map(abs, deltas1))
    for d2 in deltas2:
        i = abs_deltas1.index(abs(d2))
        neg = deltas1[i] == -d2
        ret.append((i, neg))
    return ret


def rotate(s: Scanner, transform):
    return Scanner(s.i, [Beacon(*[b[ta] * (-1 if tn else 1) for ta, tn in transform]) for b in s.beacons])

def translate(s: Scanner, delta):
    return Scanner(s.i, [Beacon(*[b[a] - delta[a] for a in range(3)]) for b in s.beacons])

def rotate_beacon(b, transform):
    return [b[ta] * (-1 if tn else 1) for ta, tn in transform]

def is_beacon_match(s1: Scanner, s2: Scanner, dist):
    count = 0
    for b1 in s1.beacons:
        found = False
        for b2 in s2.beacons:
            if tuple(b2) == tuple(b1[a] + dist[a] for a in range(3)):
                found = True
                break
        if found:
            count += 1
            if count >= 12:
                return True
    return count >= 12

abs_delta = {0: (0, 0, 0)}
def is_match(s1: Scanner, s2: Scanner):
    for b1, b2 in combinations(s1.beacons, 2):
        for b3, b4 in combinations(s2.beacons, 2):
            if line_length(b1, b2) == line_length(b3, b4):
                deltas1 = [b2[a] - b1[a] for a in range(3)]
                deltas2 = [b4[a] - b3[a] for a in range(3)]

                transform = axis_transforms(deltas2, deltas1)
                if not transform:
                    continue

                rotated = rotate(s2, transform)
                rotated_beacon = rotate_beacon(b3, transform)

                dist = [rotated_beacon[a] - b1[a] for a in range(3)]

                if is_beacon_match(s1, rotated, dist):
                    abs_delta[s2.i] = tuple(dist[a] for a in range(3))
                    return translate(rotated, dist)
    return False

visited = set()
def dfs(i):
    visited.add(i)
    for j in range(len(scanners)):
        if j == i or j in visited:
            continue

        rotated = is_match(scanners[i], scanners[j])
        if rotated:
            scanners[j] = rotated
            dfs(rotated.i)

with open('../../input/day19example.txt') as f:
    groups = []
    group = []
    for line in [line.strip() for line in f.readlines()]:
        if line == '':
            groups.append(group)
            group = []
        else:
            group.append(line)
    groups.append(group)

    scanners = [Scanner(i, [Beacon(*map(int, s.split(','))) for s in g[1:]]) for i, g in enumerate(groups)]

def test():
    global scanners, visited, abs_delta
    scanners = [Scanner(i, [Beacon(*map(int, s.split(','))) for s in g[1:]]) for i, g in enumerate(groups)]
    visited = set()
    abs_delta = {0: (0, 0, 0)}
    dfs(0)

print(timeit('test()', globals=globals(), number=1))

# global_beacons = set()
# for s in scanners:
#     for b in s.beacons:
#         global_beacons.add(tuple(b))
# print(len(global_beacons))

# def manhattan_dist(s1, s2):
#     return sum(abs(abs_delta[s1.i][a] - abs_delta[s2.i][a]) for a in range(3))

# print(max(manhattan_dist(s1,s2) for s1, s2 in product(scanners, scanners) if s1 != s2))

# for s1 in scanners:
#     matches = tuple(s2.i for s2 in scanners if s1 != s2 and is_match(s1, s2))
#     print(s1.i, 'matches', matches)
