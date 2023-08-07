from math import floor, ceil, sqrt
from collections import Counter, defaultdict
from itertools import product, chain

def get_good_vy_turns(vy):
    ret = []

    turn = 0
    y = 0
    while y >= target_y[1]:
        if y <= target_y[0]:
            ret.append(turn)
        turn += 1
        y = turn * vy - (turn * (turn - 1) / 2)

    return ret

def get_good_vx_turns(vx):
    ret = []

    turn = 0
    x = 0
    while x <= target_x[1] and turn <= vx:
        if x >= target_x[0]:
            ret.append(turn)

        turn += 1
        x = turn * vx - (turn * (turn - 1) / 2)
    
    turn -= 1
    x = turn * vx - (turn * (turn - 1) / 2)
    if x >= target_x[0] and x <= target_x[1] and turn >= vx:
        open_ended_x[turn].append(vx)

    return ret


def get_y_velocities():
    ret = defaultdict(list)
    for vy in range(-200, 200):
        good_turns = get_good_vy_turns(vy)
        for t in good_turns:
            ret[t].append(vy)

    return ret

def get_x_velocities():
    ret = defaultdict(list)
    for vx in range(1, 200):
        good_turns = get_good_vx_turns(vx)
        for t in good_turns:
            ret[t].append(vx)

    return ret

open_ended_x = defaultdict(list)

target_x = (20, 30)
target_y = (-5, -10)

good_x = get_x_velocities()
good_y = get_y_velocities()

print(good_x)


# my_ans = set()
# for ty in good_y:
#     for tx in good_x:
#         if tx == ty or :
#             print(ty, tx)
#             my_ans |= set(product(good_x[tx], good_y[ty]))

good_turns = good_x.keys() & good_y.keys()

my_ans = set(chain.from_iterable(product(good_x[t], good_y[t]) for t in good_turns))

for ty in good_y:
    for tx in open_ended_x:
        if tx <= ty:
            my_ans |= set(product(open_ended_x[tx], good_y[ty]))

print(len(my_ans))

# print(sum([len(good_x[t]) * len(good_y[t]) for t in good_turns]))

input = """23,-10  25,-9   27,-5   29,-6   22,-6   21,-7   9,0     27,-7   24,-5 
25,-7   26,-6   25,-5   6,8     11,-2   20,-5   29,-10  6,3     28,-7 
8,0     30,-6   29,-8   20,-10  6,7     6,4     6,1     14,-4   21,-6 
26,-10  7,-1    7,7     8,-1    21,-9   6,2     20,-7   30,-10  14,-3 
20,-8   13,-2   7,3     28,-8   29,-9   15,-3   22,-5   26,-8   25,-8 
25,-6   15,-4   9,-2    15,-2   12,-2   28,-9   12,-3   24,-6   23,-7 
25,-10  7,8     11,-3   26,-7   7,1     23,-9   6,0     22,-10  27,-6 
8,1     22,-8   13,-4   7,6     28,-6   11,-4   12,-4   26,-9   7,4 
24,-10  23,-8   30,-8   7,0     9,-1    10,-1   26,-5   22,-9   6,5 
7,5     23,-6   28,-10  10,-2   11,-1   20,-9   14,-2   29,-7   13,-3 
23,-5   24,-8   27,-9   30,-7   28,-5   21,-10  7,9     6,6     21,-5 
27,-10  7,2     30,-9   21,-8   22,-7   24,-9   20,-6   6,9     29,-5 
8,-2    27,-8   30,-5   24,-7"""

good_ans = set(map(lambda s: tuple(map(int, s.split(','))), filter(None, input.split(' '))))

# print(my_ans)

# x_counter = Counter([x[0] for x in v])
# y_counter = Counter([x[1] for x in v])

# print('X: ', len(x_counter))
# print('Y: ', len(y_counter))