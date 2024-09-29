import { produce } from "immer";

test('should ', () => {
    const given = [[-1, -1, -1, -1]]
    const result = produce(given, draft => {
        draft[0][1] = 0
    })
    expect(result).toEqual([[-1, 0, -1, -1]])
});

function foo(array) {
    return array.reduce((acc, current) => acc + current) !== -4
}

test('isSet true', () => {
    const given = [-1,0,-1,-1]
    const result = foo(given)
    expect(result).toEqual(true)
});

test('isSet false', () => {
    const given = [-1,-1,-1,-1]
    const result = foo(given)
    expect(result).toEqual(false)
})