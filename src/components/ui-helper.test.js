import { getActivityColor } from "./ui-helper";

test('first', () => {
    const activityLst = [ {id:123}, {id:125}, {id:126} ]
    const result = getActivityColor(123, activityLst)
    expect(result).toEqual('#666666')
});

test('last', () => {
    const activityLst = [ {id:123}, {id:125}, {id:126} ]
    const result = getActivityColor(126, activityLst)
    expect(result).toEqual('#1aff1a')
})

test('modulo', () => {
    const activityLst = [ {id:101}, {id:102}, {id:103}, {id:104}, {id:105}, {id:106}, {id:107}, {id:108}, {id:109}, {id:110}, {id:111}, {id:112}, {id:113} ]
    const result = getActivityColor(113, activityLst)
    expect(result).toEqual('#666666')
})

test('undefined', () => {
    const result = getActivityColor(127, undefined)
    expect(result).toEqual(undefined)
})

test('null', () => {
    const activityLst = [ {id:123}, {id:125}, {id:126} ]
    const result = getActivityColor(null, activityLst)
    expect(result).toEqual(undefined)
})