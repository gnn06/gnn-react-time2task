// couleur standard lighten de 40 %
export const ACTIVITY_COLORS = [
    '#666666' , // 1 darkslategray = 
    '#e68845' , // 2 saddlebrown = #8B4513
    '#1aff1a' , // 3 green = #008000
    '#4040ff',  // 4 navy = 000080
    '#ff6666' , // 5 red = ff0000
    '#ffff66' , // 6 yellow = FFFF00
    '#85f6d0' , // 7 lime  00FF00
    '#66ffff' , // 8 aqua 00ffff
    '#ffb3ff',  // 9 fuchsia FF00FF
    '#f5f1cc',  // 10 palegoldenrod EEE8AA 
    '#a2bff4',  // 11 "bleu" #6495ed
    '#ffa5d2',  // 12 hotpink FF69B4
]

export function getActivityColor(activityId, activityLst) {
    if (!activityLst) return undefined
    const activityIndex = activityLst.findIndex(item => item.id === activityId)
    const color = ACTIVITY_COLORS[activityIndex % ACTIVITY_COLORS.length]
    return color;
}