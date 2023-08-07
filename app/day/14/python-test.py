from collections import Counter
from functools import cache


def next_polymer(polymer):
    ret = ''
    for i, elem in enumerate(polymer):
        ret += elem
        if i < len(polymer) - 1:
            ret += rules.get(elem + polymer[i+1], '')
    return ret

@cache
def pair_count(a, b, steps):
    c = Counter(a + b)

    if steps == 0:
        return c

    result = rules.get(a + b)
    if not result:
        return c
    
    c = pair_count(a, result, steps - 1) + pair_count(result,b, steps-1)
    c[result] -= 1
    return c


if __name__ == '__main__':
    with open('../../input/day14.txt') as f:
        lines = list(map(lambda x: x.strip(), f.readlines()))
        template = lines[0]
        rules = {}
        for i in range(2, len(lines)):
            rules[lines[i][:2]] = lines[i][6]
    
    final_counter = Counter()
    for elem1, elem2 in zip(template, template[1:]):
        final_counter += pair_count(elem1, elem2, 10)

    print(final_counter.most_common()[0][1] - final_counter.most_common()[-1][1])