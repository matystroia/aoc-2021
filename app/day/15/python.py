from queue import PriorityQueue
import math

def dijkstra():
    visited = set()
    queue = PriorityQueue()
    queue.put((0, (0, 0)))

    while not queue.empty():
        _, pos = queue.get()
        if pos == (size -1, size -1):
            return

        i, j = pos
        neighbors = map(lambda d: (i + d[0], j + d[1]) , [(0, 1), (0, -1), (1, 0), (-1, 0)])
        for neighbor in neighbors:
            if neighbor in visited:
                continue

            ni, nj = neighbor
            if ni < 0 or ni >= size or nj < 0 or nj >= size:
                continue

            cost = dp[i][j] + big_risk[ni][nj]
            if cost < dp[ni][nj]:
                dp[ni][nj] = cost
                queue.put((cost, neighbor))
        visited.add(pos)


if __name__ == '__main__':
    with open('../../input/day15.txt') as f:
        risk = list(map(lambda x: list(map(int, x.strip())), f.readlines()))
    
    size = len(risk)

    big_risk = [[None for _ in range(size * 5)] for _ in range(size * 5)]
    for i in range(size * 5):
        for j in range(size * 5):
            ii, jj = i // size, j // size
            mi, mj = i % size, j % size
            if ii == 0 and jj == 0:
                big_risk[i][j] = risk[i][j]
            else:
                x = risk[mi][mj] + ii + jj
                big_risk[i][j] = x if x <= 9 else (x % 10) + 1

    size = size * 5

    dp = [[math.inf for _ in range(size)] for _ in range(size)]
    dp[0][0] = 0

    dijkstra()

    # for i in range(size):
    #     for j in range(size):
    #         if i == 0 and j == 0:
    #             continue
    #         if i == 0:
    #             dp[i][j] = dp[i][j-1] + big_risk[i][j]
    #         elif j == 0:
    #             dp[i][j] = dp[i-1][j] + big_risk[i][j]
    #         else:
    #             dp[i][j] = min(dp[i-1][j], dp[i][j-1]) + big_risk[i][j]
    
    print(dp[size - 1][size - 1])