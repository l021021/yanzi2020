// 处理逻辑：一分钟切片
// 每一分钟 ：12:01:00 有一个对应的占用 0-1，比如0.5 :代表50%的利用率
// 算法:每一个时间戳看前一个： 当前占用-前一个占用，标记为100%
// 当前占用 前一个空闲 标记为0
// 当前空闲 均标记为0
// 标记举例 1:01.11 in 1:05:44 in
//         1:01:00 49/60
//         1:02:00 1
//         1:03:00 1
//         1:04:00 1
//         1:05:00 1
//         标记举例 1:01.11 out 1:05:44 in
//         1:01:00 0
//         1:02:00 0
//         1:03:00 0
//         1:04:00 0
//         1:05:00 16/60

var RecordArray
RecordArray = [{
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135021868,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135021868,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135021868,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135026044,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135026044,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135034114,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135076802,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135103709,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135110485,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135116559,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574135131640,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135139539,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574135140562,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135148706,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135155663,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574135182306,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135182306,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574135182306,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135191595,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135191595,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135207518,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135223946,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135244009,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F5C-3-Motion',
    timeStamp: 1574135247362,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135268624,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135274848,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135274848,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135274848,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F5C-3-Motion',
    timeStamp: 1574135290830,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135303424,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135311561,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135357050,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135362689,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135363601,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135364431,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793ED2-3-Motion',
    timeStamp: 1574135389088,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135409964,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135425466,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135428291,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793ED2-3-Motion',
    timeStamp: 1574135437821,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135440493,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135440493,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135481859,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135483696,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135493844,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135507809,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135509603,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135509620,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C0A-3-Motion',
    timeStamp: 1574135511826,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574135514181,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135527838,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135550372,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135550372,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C0A-3-Motion',
    timeStamp: 1574135556215,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574135557896,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135575772,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574135604797,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135615059,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135634394,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135647858,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135651020,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135652191,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574135652191,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135692936,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135695613,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135695613,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135697122,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135738204,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574135743891,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574135745058,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574135745447,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135770755,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135776433,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135777763,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574135786598,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574135790045,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135813845,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135820284,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135829637,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574135837244,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135852640,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135864528,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135906975,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135925822,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135933753,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574135950146,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135969920,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135970933,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574135981331,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574135982079,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574135985321,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C89-3-Motion',
    timeStamp: 1574136007319,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136022786,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136027004,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136027004,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136027004,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136027878,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136029541,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C89-3-Motion',
    timeStamp: 1574136046905,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574136046905,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136062177,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136063682,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136067608,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574136100590,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136105594,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136105594,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136105594,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136185542,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136190962,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136191464,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136231893,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136231893,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136231893,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793ED2-3-Motion',
    timeStamp: 1574136245729,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136246036,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F4E-3-Motion',
    timeStamp: 1574136269681,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F5C-3-Motion',
    timeStamp: 1574136273180,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136274045,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136274714,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136275557,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136277477,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574136279423,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793ED2-3-Motion',
    timeStamp: 1574136285488,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136293614,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F4E-3-Motion',
    timeStamp: 1574136316114,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93F5C-3-Motion',
    timeStamp: 1574136318670,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136318670,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136319697,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136319697,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136319697,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE108D1B-3-Motion',
    timeStamp: 1574136319697,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136327914,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136338288,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136363187,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136384637,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136404928,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136438026,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136438026,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136451679,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136458365,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136459240,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574136459659,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136470463,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136495660,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136503590,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136503590,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B282F-3-Motion',
    timeStamp: 1574136503590,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136520639,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136525791,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136591974,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136592699,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574136593240,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C0A-3-Motion',
    timeStamp: 1574136593521,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136593645,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792CD8-3-Motion',
    timeStamp: 1574136636245,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA950A1-3-Motion',
    timeStamp: 1574136636245,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574136636245,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C0A-3-Motion',
    timeStamp: 1574136636245,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136639255,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136668336,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136674742,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-90FD9FFFFEA93DB7-3-Motion',
    timeStamp: 1574136713520,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE793DE3-3-Motion',
    timeStamp: 1574136713520,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574136713520,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136727314,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-0080E1030005453A-4-Motion',
    timeStamp: 1574136771235,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136771235,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136771235,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136820807,
    value: 'ot'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7931C7-3-Motion',
    timeStamp: 1574136828624,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE792C0A-3-Motion',
    timeStamp: 1574136832006,
    value: 'in'
}, {
    type: 'sampleAsset',
    Did: 'EUI64-D0CF5EFFFE7B284B-3-Motion',
    timeStamp: 1574136833236,
    value: 'in'
}]

var t1 = new Date()
var t2 = new Date()
var t1m = new Date()
var t0 = new Date()
var t2m = new Date()
var timeArray = new Array()
var timeObj = {
    ID: '',
    timeStamp: '',
    value: ''
}

var minDiff, t1toNext, PrevTot2

// 处理一下 record，每一个ID分开成一个Array

var sArray = new Array()
var id = 'EUI64-0080E1030005453A-4-Motion'

console.log('处理原始数据,仅留下某一个传感器,验证算法')

for (let i = 0; i < RecordArray.length; i++) {
    if (id == RecordArray[i].Did) {
        sArray.push({
            Did: id,
            timeStamp: RecordArray[i].timeStamp,
            value: RecordArray[i].value
        })
    }
}

for (let i = 1; i < sArray.length; i++) {
    console.log('循环处理数据,这是第:' + i)

    t1.setTime(sArray[i - 1].timeStamp) // 前一个事件时间
    t1.setMilliseconds(0) // 得到整秒
    t1m.setTime(sArray[i - 1].timeStamp) // t1m：前一个事件的整分
    t1m.setMilliseconds(0)
    t1m.setSeconds(0) // 得到整分

    t2.setTime(sArray[i].timeStamp) // 当前事件时间
    t2.setMilliseconds(0) // 得到整秒
    t2m.setTime(sArray[i].timeStamp)
    t2m.setMilliseconds(0)
    t2m.setSeconds(0) // second=0
    timeObj.ID = sArray[i].Did

    // 得到分钟差和秒数零头

    minDiff = Math.floor((t2m - t1m) / 60 / 1000) // 整分差
    t1ToNext = 60 - t1.getSeconds() // 前面的零头秒数
    PrevTot2 = t2.getSeconds() // 后面的零头秒数

    console.log('seeing  ' + t1.toLocaleTimeString() + '-前  ' + t1m.toLocaleTimeString() + '整  ' + minDiff + ' 分 ' + t1ToNext + '前 ' + PrevTot2 + ' 后  ' + t2.toLocaleTimeString() + '-后  ' + t2m.toLocaleTimeString())

    if (sArray[i - 1].value == 'in') { // 全部=1
        console.log('--is a ' + sArray[i - 1].value)

        console.log('头尾在一分钟内? ' + (t1m == t2m) ? true : False)

        if (t1m >= t2m) {
            console.log('头尾在同样的一分钟')
            t1ToNext = (t1ToNext + PrevTot2 - 60) /// 计算缝隙
            PrevTot2 = 0 // 计算头部即可
        }

        t0.setTime(t1m.getTime()) // 前一整分

        let _RecordExist = false // 记录不存在
        const _ExistValue = 0

        for (const key in timeArray) { // already exits in Array?
            if (timeArray[key].timeStamp == t0.toLocaleTimeString()) {
                console.log('----这一分存在！增加头部的数值' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[key]))
                _RecordExist = true
                    // _ExistValue = timeArray[key].value;
                timeArray[key].value += t1ToNext / 60 // 增加新的占用
                break
            }
        }

        if (!_RecordExist) { // 这一分不存在
            timeObj.timeStamp = t0.toLocaleTimeString()
            timeObj.value = t1ToNext / 60
            var _timeObj = JSON.parse(JSON.stringify(timeObj))
            timeArray.push(_timeObj) // 增加记录
            console.log('----这一分不存在！头部加入新记录：' + t0.toLocaleTimeString())
        }

        { // tail会重复？
            t0.setTime(t2m.getTime()) // tail
            for (const key in timeArray) { // already exits in Array?
                if (timeArray[key].timeStamp == t0.toLocaleTimeString()) {
                    console.log('----这一分存在！增加尾部数值  ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[key]) + '  ' + JSON.stringify(sArray[i]))
                    _RecordExist = true
                    timeArray[key].value += PrevTot2 / 60
                    break
                }
            }

            if (!_RecordExist) {
                timeObj.timeStamp = t2m.toLocaleTimeString()
                timeObj.value = PrevTot2 / 60
                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                timeArray.push(_timeObj)
                console.log('----这一分不存在，加入新尾部记录：' + t2m.toLocaleTimeString())
            }
        }

        // process middle
        let j = 1
        console.log('----准备加入中部记录?')
        while (j < minDiff) {
            t0.setTime(t1m.getTime() + j * 60 * 1000) // 下一分
            timeObj.timeStamp = t1m.toLocaleTimeString()
            timeObj.value = 1

            var _timeObj = JSON.parse(JSON.stringify(timeObj))
            timeArray.push(_timeObj)
            console.log('------加入中部记录：' + t0.toLocaleTimeString())
            j++
        }
    } else { // 全部标0
        console.log('--is a ' + sArray[i - 1].value)

        console.log('头尾在一分钟内? ' + (t1m == t2m) ? true : False)

        if (t1m >= t2m) {
            console.log('头尾在相同的一分钟')
            t1ToNext = (t1ToNext + PrevTot2 - 60) /// 计算缝隙
            PrevTot2 = 0 // 计算头部即可
        } else {
            console.log('not same')
        };

        t0.setTime(t1m) // Previous
        let _RecordExist = false

        for (const key in timeArray) { // already exits in Array?
            if (timeArray[key].timeStamp == t0.toLocaleTimeString()) {
                console.log('----这一分存在！头部原值不变 ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[key]) + '  ' + JSON.stringify(sArray[i]))
                _RecordExist = true
                _ExistValue = timeArray[key].value
                break
            }
        }

        if (!_RecordExist) { // 这一分不存在
            timeObj.timeStamp = t0.toLocaleTimeString()
            timeObj.value = 0

            var _timeObj = JSON.parse(JSON.stringify(timeObj))
            timeArray.push(_timeObj) // 增加记录
            console.log('----这一分不存在！头部加入新记录：' + t0.toLocaleTimeString())
        }

        { // tail会重复？
            t0.setTime(t2m) // tail

            for (const key in timeArray) { // already exits in Array?
                if (timeArray[key].timeStamp == t0.toLocaleTimeString()) {
                    console.log('----这一分存在！尾部原值不变 ' + t0.toLocaleTimeString() + '   ' + JSON.stringify(timeArray[key]) + '  ' + JSON.stringify(sArray[i]))
                    _RecordExist = true
                        // _ExistValue = timeArray[key].value;
                    break
                }
            }
            // do nothing
            if (!_RecordExist) {
                timeObj.timeStamp = t2m.toLocaleTimeString()
                timeObj.value = 0
                var _timeObj = JSON.parse(JSON.stringify(timeObj))
                timeArray.push(_timeObj)
                console.log('----不存在，加入新尾部记录：' + t2m.toLocaleTimeString())
            }
        }
    }
    // process middle
    let j = 1
    console.log('----准备加入中部记录：')
    while (j < minDiff) {
        t0.setTime(t1m.getTime() + j * 60 * 1000)
        timeObj.timeStamp = t0.toLocaleTimeString()
        timeObj.value = 0

        var _timeObj = JSON.parse(JSON.stringify(timeObj))
        timeArray.push(_timeObj)
        console.log('------加入中部记录：' + t0.toLocaleTimeString())
        j++
    }
}

// console.log(JSON.stringify(timeArray))

// timeArray.sort(function (a, b) {
//     //if (a.ID > b.ID) { return true } else
//     if (a.timeStamp > b.timeStamp) {
//         return true
//     };
//     return false;

// });

console.log('timearray:')

for (let i = 0; i < timeArray.length; i++) {
    const element = timeArray[i]

    if (!element.ID || !element.timeStamp) continue
    console.log(element.ID + ' @ ' + element.timeStamp + ' = ' + element.value + '')
};
