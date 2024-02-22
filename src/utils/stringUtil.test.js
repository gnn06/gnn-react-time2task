import {insertSeparator, tokenizer} from './stringUtil'

test('insertSeparator, empty, empty', () => {
    const result = insertSeparator('', '', 'toto')
    expect(result).toEqual('toto')
})

test('insertSeparator, second empty', () => {
    const result = insertSeparator('abc', '', 'toto')
    expect(result).toEqual('abc toto')
})

test('insertSeparator, first empty', () => {
    const result = insertSeparator('', 'qsd', 'toto')
    expect(result).toEqual('toto qsd')
})

test('insertSeparator, no empty', () => {
    const result = insertSeparator('abc', 'qsd', 'toto')
    expect(result).toEqual('abc toto qsd')
})

test('don\'t add space', () => {
    const result = insertSeparator('abc ', 'qsd', 'toto')
    expect(result).toEqual('abc toto qsd')
})

test('don\'t add space second', () => {
    const result = insertSeparator('abc', ' qsd', 'toto')
    expect(result).toEqual('abc toto qsd')
})

test('don\'t add space first empty', () => {
    const result = insertSeparator('abc ', '', 'toto')
    expect(result).toEqual('abc toto')
})

test('don\'t add space empty second', () => {
    const result = insertSeparator('', ' qsd', 'toto')
    expect(result).toEqual('toto qsd')
})

test('don\'t add space space first and second', () => {
    const result = insertSeparator('abc ', ' qsd', 'toto')
    expect(result).toEqual('abc toto qsd')
})

test('split one space middle', () => {
    expect(tokenizer('aaa bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('aaa    bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('aaa   bbb  ')).toEqual(['aaa','bbb'])
    expect(tokenizer('   aaa   bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('   aaa   bbb    ')).toEqual(['aaa','bbb'])
});