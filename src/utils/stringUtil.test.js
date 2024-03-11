import {insertSeparator, tokenizer, wordBefore, insertItemInInput } from './stringUtil'

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

test('insertItemInInput empty', () => {
    const result = insertItemInInput('', 0, 0, 'toto')
    expect(result).toBe('toto')
})

test('insertItemInInput suggestion', () => {
    //                                0123456789
    const result = insertItemInInput('before to after', 9, 9, 'toto')
    expect(result).toBe('before toto after')
})

test('split one space middle', () => {
    expect(tokenizer('aaa bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('aaa    bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('aaa   bbb  ')).toEqual(['aaa','bbb'])
    expect(tokenizer('   aaa   bbb')).toEqual(['aaa','bbb'])
    expect(tokenizer('   aaa   bbb    ')).toEqual(['aaa','bbb'])
});


test('wordBefore empty', () => {
    //                 0
    expect(wordBefore('', )).toEqual('')
})

test('wordBefore only one word', () => {
    //                 01234
    expect(wordBefore('this', 4)).toEqual('this')
})

test('wordBefore into word', () => {
    //                 01
    expect(wordBefore('this', 1)).toEqual('t')
})

test('wordBefore two words', () => {
    //                 0123456789
    expect(wordBefore('word this', 9)).toEqual('this')
})

test('wordBefore three words', () => {
    //                 012345678901
    expect(wordBefore('before this after', 11)).toEqual('this')
})

test('wordBefore three words with suggestion', () => {
    //                 0123456789
    expect(wordBefore('before to after', 9)).toEqual('to')
})

test('wordBefore after last space', () => {
    //                 0123456789
    expect(wordBefore('this_week ', 10)).toEqual('')
})

test('wordBefore AND', () => {
    //                 0123456789
    expect(wordBefore('mardi AN', 8)).toEqual('AN')
})

