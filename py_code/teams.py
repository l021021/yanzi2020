import pandas as pd
Names = set()
for sheet in ['2016', '2017', '2018', '2019']:
    df = pd.read_excel('E:\\gitdir\\yanzi2020\\py_code\\TEAM_NAME.xlsx',
                       sheet,
                       index_col=None)
    for name in df['TeamAB1'].unique():
        Names.add(name)
print(Names)
print(f' Total teams:{len(Names)}')