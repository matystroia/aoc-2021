a = [
    10, 12, 13, 13, 14,
    -2, 11, -15, -10, 10,
    -10, -4, -1, -1 
]

b = [
    0, 6, 4, 2, 9,
    1, 10, 6, 4, 6,
    3, 9, 15, 5
]    

N = 14
def bt(digits, i, z):
    if i == N:
        if z == 0:
            print(digits)
            exit()
        return 
    
    if a[i] < 0:
        digit = (z % 26) + a[i]
        if 1 <= digit <= 9:
            bt(digits + [digit], i + 1, z // 26)
    else:
        for digit in range(1, 10):
            bt(digits + [digit], i + 1, z * 26 + digit + b[i])

bt([], 0, 0)
