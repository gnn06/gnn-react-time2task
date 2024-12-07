import { indexOfSiblingLevel, insideOrEqual, insideStrict } from "./arrayUtil";

describe('from start', () => {
    test('should find a split with same level', () => {
        expect(indexOfSiblingLevel([1, 2, 3, 1], 0)).toBe(3);
    });
    
    test('should find a split with higher level', () => {
        expect(indexOfSiblingLevel([2, 3, 4, 1], 0)).toBe(3);
    });
    
    test('should not find a split endding a tab', () => {
        expect(indexOfSiblingLevel([2, 3, 4], 0)).toBe(3);
    });
    
    test('empty param', () => {
        expect(indexOfSiblingLevel([], 0)).toBe(1);
    }); 
})

describe('from middle', () => {
    test('should find a split with same level', () => {
        expect(indexOfSiblingLevel([1, 2, 3, 1, 2, 3, 1], 3)).toBe(6);
    });

    test('should find a split by end', () => {
        expect(indexOfSiblingLevel([1, 2, 3, 1, 2, 3], 3)).toBe(6);
    });
    
    test('should not find a split', () => {
        expect(indexOfSiblingLevel([2, 3, 4], 3)).toBe(4);
    });
})

describe('insideOrEqual', () => {
    test('equal', () => {
        const given1 = [1, 2, 3]
        const given2 = [1, 2, 3]
        const expected = true
        const result = insideOrEqual(given1, given2)
        expect(result).toEqual(expected)
    });
    test('inside', () => {
        const given1 = [1, 2]
        const given2 = [1, 2, 3]
        const expected = true
        const result = insideOrEqual(given1, given2)
        expect(result).toEqual(expected)
    });
    test('outside', () => {
        const given1 = [1, 2, 3, 4]
        const given2 = [1, 2, 3]
        const expected = false
        const result = insideOrEqual(given1, given2)
        expect(result).toEqual(expected)
    })
    test('distinct', () => {
        const given1 = [1]
        const given2 = [3]
        const expected = false
        const result = insideOrEqual(given1, given2)
        expect(result).toEqual(expected)
    })
});

describe('insideStrit', () => {
    test('equal', () => {
        const givenPath1 = ["thism", "thisw", "mercredi"]
        const givenPath2 = ["thism", "thisw", "mercredi"]
        const expected = false
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });    
    test('equal and lower', () => {
        const givenPath1 = ["thism", "thisw"]
        const givenPath2 = ["thism", "thisw", "merredi"]
        const expected = true
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
    test('equal and greater', () => {
        const givenPath1 = ["thism", "thisw","mercredi"]
        const givenPath2 = ["thism", "thisw"]
        const expected = false
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
    test('differ', () => {
        const givenPath1 = ["thism", "thisw", "mercredi"]
        const givenPath2 = ["nextm"]
        const expected = false
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
    test('equal one depth', () => {
        const givenPath1 = ["thism"]
        const givenPath2 = ["thism"]
        const expected = false
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    });
    test('empty', () => {
        const givenPath1 = []
        const givenPath2 = ["thism"]
        const expected = true
        const result = insideStrict(givenPath1, givenPath2)
        expect(result).toEqual(expected)
    })
});
