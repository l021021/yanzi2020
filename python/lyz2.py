# schedule={'1,1':'math','1,2':'lit','1,3':'eng','1,4'='sport','2,1':'sport','2,2'='phy','2,3'='chem','2,4'='eng'}
schedule = [
    ['math', 'lit', 'eng'],
    ['spo', 'phy', 'chem', 'eng'],
    ['lit', 'eng', 'eng']
]
map = {}
for day in schedule:
    # print(day)
    for lesson in day:
        if lesson in map:
            map[lesson] += 1
        else:
            map[lesson] = 1
# print(map)

print(sorted(map.items(), key=lambda items: items[1], reverse=True))
