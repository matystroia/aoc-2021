from itertools import product, chain
from functools import reduce
from math import inf
import re

class Cube:
    def __init__(self, x_int, y_int, z_int) -> None:
        self.x_int = x_int
        self.y_int = y_int
        self.z_int = z_int

    def __len__(self):
        return len(self.x_int) * len(self.y_int) * len(self.z_int)

    def __and__(self, other):
        if not (self.x_int & other.x_int and self.y_int & other.y_int and self.z_int & other.z_int):
            return None
        return Cube(self.x_int & other.x_int, self.y_int & other.y_int, self.z_int & other.z_int)

    def __sub__(self, other):
        if not (self & other):
            return [self]
        ret = []
        ox, oy, oz = other.x_int.tup(), other.y_int.tup(), other.z_int.tup()
        for ix, iy, iz in product(
            [Interval(-inf, ox[0] - 1), Interval(ox[0], ox[1]), Interval(ox[1] + 1, inf)],
            [Interval(-inf, oy[0] - 1), Interval(oy[0], oy[1]), Interval(oy[1] + 1, inf)],
            [Interval(-inf, oz[0] - 1), Interval(oz[0], oz[1]), Interval(oz[1] + 1, inf)]
        ):
            if ix == Interval(*ox) and iy == Interval(*oy) and iz == Interval(*oz):
                continue

            c = Cube(ix, iy, iz) & self
            if c and len(c):
                ret.append(c)
        return ret
    
    def __repr__(self) -> str:
        return f'{self.x_int}, {self.y_int}, {self.z_int}'


        
class Interval:
    def __init__(self, start, end) -> None:
        self.start = start
        self.end = end

    def __eq__(self, other) -> bool:
        return self.start == other.start and self.end == other.end

    def __and__(self, other):
        if other.start > self.end or self.start > other.end:
            return None
        return Interval(max(self.start, other.start), min(self.end, other.end))
    
    def __or__(self, other):
        if other.start > self.end or self.start > other.end:
            return [self, other]
        return Interval(min(self.start, other.start), max(self.end, other.end))
    
    def __repr__(self) -> str:
        return f'{self.start}..{self.end}'

    def __sub__(self, other):
        intersection = self & other
        if not intersection:
            return [Interval(self.start, self.end)]
        if intersection == self:
            return []
        if other.start <= self.start <= other.end:
            return [Interval(other.end + 1, self.end)]
        if other.start <= self.end <= other.end:
            return [Interval(self.start, other.start - 1)]
        return [
            Interval(self.start, other.start - 1),
            Interval(other.end + 1, self.end)
        ]

    def __len__(self):
        if self.start > self.end:
            return 0
        return self.end - self.start + 1
    
    def __contains__(self, x):
        return self.start <= x <= self.end

    def tup(self):
        return (self.start, self.end)


def reunion(intervals: "list[Interval]"):
    while True:
        merged = False
        for i, j in chain.from_iterable([(i, j) for j in range(i + 1, len(intervals))] for i in range(len(intervals))):
            if intervals[i] & intervals[j]:
                intervals[i] = intervals[i] | intervals[j]
                del intervals[j]
                merged = True
                break
        if not merged:
            break
    return intervals

def count_on_from_to(interval, i, j, on):
    ret = len(interval)
    for k, (other_on, other_interval) in enumerate(steps[i+1:j]):
        if on == other_on:
            continue

        intersection = interval & other_interval

        if intersection:
            ret -= count_on_from_to(intersection, k, j, not on)
    return ret

def count():
    ans = 0
    for i, (on, interval) in enumerate(steps):
        count_delta = len(interval)
        intersections = []
        for j, (prev_on, prev_interval) in enumerate(steps[:i]):
            intersection = interval & prev_interval
            if intersection and on == prev_on:
                count_delta -= count_on_from_to(intersection, j, i, on)
                intersections.append(intersection)

        for x, int1 in enumerate(intersections):
            for y, int2 in enumerate(intersections[:x]):
                int_of_int = int1 & int2
                if int_of_int:
                    count_delta += count_on_from_to(int_of_int, x, i, on)

            # Subtracting same interval multiple times!!!

        if on:
            ans += count_delta
        else:
            ans -= count_delta
                
    


def build_intervals(steps):
    intervals = []
    for step in steps:
        on, coords = step
        interval = Interval(*coords)
        overlaps = list(filter(None, map(lambda i: i & interval, intervals)))

        if overlaps:
            if on:
                sorted_overlaps = sorted(overlaps, key=lambda i: i.start)
                # if sorted_intervals and sorted_intervals[0].start <= interval.start:
                #     interval.start = sorted_intervals[0].end + 1
                #     sorted_intervals.pop(0)
                
                # if sorted_intervals and sorted_intervals[-1].end >= interval.end:
                #     interval.end = sorted_intervals[-1].start - 1
                #     sorted_intervals.pop(-1)

                sub_from = interval
                new_intervals = []

                for so in sorted_overlaps:
                    # result = list(filter(lambda i: i.start <= i.end, sub_from - so))
                    result = sub_from - so
                    if len(result) == 0:
                        sub_from = None
                        break
                    elif len(result) == 1:
                        sub_from = result[0]
                    elif len(result) == 2:
                        sub_from = result[1]
                        new_intervals.append(result[0])
                
                if sub_from and sub_from.start <= sub_from.end:
                    new_intervals.append(sub_from)
                
                intervals.extend(new_intervals)

            else:
                overlap_intervals = filter(lambda i: i & interval, intervals)
                for oi in overlap_intervals:
                    result = oi - interval
                    if len(result) == 0:
                        intervals.remove(oi)
                    elif len(result) == 1:
                        oi.start, oi.end = result[0].start, result[0].end
                    elif len(result) == 2:
                        intervals.remove(oi)
                        intervals.extend(result)    
        else:
            intervals.append(interval)    

        intervals = sorted([i for i in intervals if i.start <= i.end], key=lambda i: i.start)

        print(step)
        print(intervals)
        print()
    return intervals


steps = []
with open('Z:\\git\\aoc2021\\app\\input\\day22.txt') as f:
    for line in f.readlines():
         on, coords = line[1] == 'n', list(map(lambda t: tuple(map(int, t)), re.findall('([\d-]+)\.\.([\d-]+)', line)))
         steps.append((on, Cube(Interval(*coords[0]), Interval(*coords[1]), Interval(*coords[2]))))

# x_intervals = build_intervals([(s[0], s[1]) for s in steps])
# y_intervals = build_intervals([(s[0], s[2]) for s in steps])
# z_intervals = build_intervals([(s[0], s[3]) for s in steps])

# x_sum = sum(i.end - i.start + 1 for i in x_intervals)
# y_sum = sum(i.end - i.start + 1 for i in y_intervals)
# z_sum = sum(i.end - i.start + 1 for i in z_intervals)

# turned_on = set()
# for i, (on, x_int, y_int, z_int) in enumerate(steps):
#     print(i)
#     for x in range(x_int[0], x_int[1] +  1):
#         for y in range(y_int[0], y_int[1] + 1):
#             for z in range(z_int[0], z_int[1] + 1):
#                 turned_on.add((x,y,z)) if on else turned_on.discard((x,y,z))

# print(len(turned_on))

# print(x_sum)

cubes = []
for on, cube in steps:
    cubes = list(chain.from_iterable(c - cube for c in cubes))
    if on:
        cubes.append(cube)

print(sum(map(len, cubes)))

533801419099294
2758514936282235