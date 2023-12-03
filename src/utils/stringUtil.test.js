import {insertSeparator} from './stringUtil'

test('insertSeparator, empty, empty', () => {
    const result = insertSeparator('', '', 'toto')
    expect(result).toEqual('toto')
})

test('insertSeparator, empty, empty', () => {
    const result = insertSeparator('abc', '', 'toto')
    expect(result).toEqual('abc toto')
})

test('insertSeparator, empty, empty', () => {
    const result = insertSeparator('', 'qsd', 'toto')
    expect(result).toEqual('toto qsd')
})

test('insertSeparator, empty, empty', () => {
    const result = insertSeparator('abc', 'qsd', 'toto')
    expect(result).toEqual('abc toto qsd')
})
