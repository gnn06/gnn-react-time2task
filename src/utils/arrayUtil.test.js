import { indexOfSiblingLevel } from "./arrayUtil";

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