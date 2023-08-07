from functools import reduce
import re

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


class Cube:
    x: Interval
    y: Interval
    z: Interval
    def __init__(self, x, y, z) -> None:
        self.x = x
        self.y = y
        self.z = z


def build_intervals(steps):
    cubes = []
    for step in steps:
        on, x_interval, y_interval, z_interval = step

        cube = Cube(x_interval, y_interval, z_interval)
        overlaps = list(filter(None, map(lambda c: c & cube, cubes)))

        if overlaps:
            if on:
                # if sorted_intervals and sorted_intervals[0].start <= interval.start:
                #     interval.start = sorted_intervals[0].end + 1
                #     sorted_intervals.pop(0)
                
                # if sorted_intervals and sorted_intervals[-1].end >= interval.end:
                #     interval.end = sorted_intervals[-1].start - 1
                #     sorted_intervals.pop(-1)

                new_cubes = [cube]

                for oc in overlaps:
                    new_cubes = [c - oc for c in new_cubes]
                
                

                # for so in sorted_overlaps:
                #     # result = list(filter(lambda i: i.start <= i.end, sub_from - so))
                #     result = sub_from - so
                #     if len(result) == 0:
                #         sub_from = None
                #         break
                #     elif len(result) == 1:
                #         sub_from = result[0]
                #     elif len(result) == 2:
                #         sub_from = result[1]
                #         new_intervals.append(result[0])
                
                # if sub_from and sub_from.start <= sub_from.end:
                #     new_intervals.append(sub_from)
                
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
with open('Z:\\git\\aoc2021\\app\\input\\day22example.txt') as f:
    for line in f.readlines():
         on, coords = line[1] == 'n', list(map(lambda t: tuple(map(int, t)), re.findall('([\d-]+)\.\.([\d-]+)', line)))
         steps.append((on, *coords))

intervals = build_intervals(steps)
