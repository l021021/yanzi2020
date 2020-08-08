kebiao = [['chinese liter', 'math', 'sport', 'computer', 'math'], [
    'chinese liter', 'math', 'sport', 'computer', 'math']]
kebiaomap = {}
for days in kebiao:
    for k in days:
        if k in kebiaomap:
            kebiaomap[k] = kebiaomap[k]+1
        else:
            kebiaomap[k] = 1
# print(kebiaomap)
for k, v in sorted(kebiaomap.items(),  key=lambda item: item[1], reverse=True):
    # sorted(d.items(), key=lambda item: item[1])
    print(k, v)
