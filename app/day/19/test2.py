from collections import namedtuple
from itertools import combinations, product
from timeit import timeit
from time import time


class Scanner:
    def __init__(self, i, beacons) -> None:
        self.i = i
        self.beacons = beacons

        # self.lines = [(b1, b2, line_length(b1, b2), b2 - b1) for b1, b2 in combinations(self.beacons, 2)]

    def rotate(self, transform):
        return Scanner(self.i, [Beacon(*[getattr(b, ta) * (-1 if tn else 1) for ta, tn in transform]) for b in self.beacons])

        # for b in self.beacons:
        #     b.x, b.y, b.z = [getattr(b, ta) * (-1 if tn else 1) for ta, tn in transform]

    # def translate(self, delta):
    #     for b in self.beacons:
    #         b.x, b.y, b.z = (b.x - delta[0], b.y - delta[1], b.z - delta[2])
    
    # def is_beacon_match(self, other, dist):
    #     count = 0
    #     for b1 in self.beacons:
    #         found = False
    #         for b2 in other.beacons:
    #             if (b2.x, b2.y, b2.z) == (b1.x + dist[0], b1.y + dist[1], b1.z + dist[2]):
    #                 found = True
    #                 break
    #         if found:
    #             count += 1
    #     return count >= 12


class Beacon:
    def __init__(self, x, y, z) -> None:
        self.x = x
        self.y = y
        self.z = z

    def __add__(self, other):
        return (self.x + other.x, self.y + other.y, self.z + other.z)
    
    def __sub__(self, other):
        return (self.x - other.x, self.y - other.y, self.z - other.z)

    # def __getitem__(self, key):
    #     if key == 0:
    #         return self.x
    #     if key == 1:
    #         return self.y
    #     if key == 2:
    #         return self.z
    #     raise Exception()

    # def __eq__(self, other) -> bool:
    #     return self.x == other[0] and self.y == other[1] and self.z == other[2]

    # def __repr__(self):
    #     return f'({self.x},{self.y},{self.z})'

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
        ret.append(('xyz'[i], neg))
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
            if b1 == b2 - dist:
                found = True
                break
        if found:
            count += 1
    return count >= 12

abs_delta = {0: (0, 0, 0)}
def is_match(s1: Scanner, s2: Scanner):
    for b1, b2 in combinations(s1.beacons, 2):
        for b3, b4 in combinations(s2.beacons, 2):
            if line_length(b1, b2) == line_length(b3, b4):
                deltas1 = b2 - b1
                deltas2 = b4 - b3

                transform = axis_transforms(deltas2, deltas1)
                if not transform:
                    continue

                s2.rotate(transform)
                dist = b3 - b1

                if is_beacon_match(s1, s2, dist):
                    abs_delta[s2.i] = tuple(dist[a] for a in range(3))
                    s2.translate(dist)
                    return True
    return False

visited = set()
def dfs(i):
    visited.add(i)
    for j in range(len(scanners)):
        if j == i or j in visited:
            continue

        if is_match(scanners[i], scanners[j]):
            dfs(j)

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

test()

# print(timeit('test()', globals=globals(), number=10))

# global_beacons = set()
# for s in scanners:
#     for b in s.beacons:
#         global_beacons.add(tuple(b))
# print(len(global_beacons))

# def manhattan_dist(s1, s2):
#     return sum(abs(abs_delta[s1.i][a] - abs_delta[s2.i][a]) for a in range(3))

# print(max(manhattan_dist(s1,s2) for s1, s2 in product(scanners, scanners) if s1 != s2))

print(is_match(scanners[1], scanners[4]))

# for s1 in scanners:
#     matches = tuple(s2.i for s2 in scanners if s1 != s2 and is_match(s1, s2))
#     print(s1.i, 'matches', matches)
