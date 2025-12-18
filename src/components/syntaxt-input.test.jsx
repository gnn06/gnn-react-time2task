import {vi} from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react' // (or /dom, /vue, ...)
import userEvent from '@testing-library/user-event'


import SyntaxInput from './syntax-input'

test('use kayboard arrow', async () => {
    const items = ['first','second'];
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={() => {}}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    expect(screen.queryByText('first')).toBeNull()
    expect(screen.queryByText('second')).toBeNull()

    await userEvent.type(input, '{ArrowDown}')
    
    expect(screen.getByText('first')).toBeDefined()    
})

test('use kayboard completion', async () => {
    const items = ['first','second'];
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={() => {}}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    expect(screen.queryByText('first')).toBeNull()
    expect(screen.queryByText('second')).toBeNull()

    await userEvent.type(input, 'fir')
    
    expect(screen.getByText('first')).toBeDefined()
    expect(screen.queryByText('second')).toBeNull()    
})

test('use mouse', async () => {
    const items = ['first','second'];
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={() => {}}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    expect(screen.queryByText('first')).toBeNull()
    expect(screen.queryByText('second')).toBeNull()
    expect(input.value).toEqual('')

    await userEvent.click(input)
    
    expect(screen.getByText('first')).toBeDefined()
    expect(screen.getByText('second')).toBeDefined()    
})


test('no suggestion + enter, no crash', async () => {
    const items = ['first','second'];
    const handler = vi.fn();
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={handler}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    await userEvent.type(input, 'title:foo{Enter}')
    
    expect(handler).toHaveBeenCalled()
})


test('no selection when full suggestion after word', async () => {
    const items = ['first','second'];
    const handler = vi.fn();
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={handler}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    await userEvent.type(input, 'first')
    
    // check no item selected
    expect(screen.getByText('first')).not.toHaveClass('bg-gray-300')
})

test('full suggestion after wrong keyword', async () => {
    const items = ['first','second'];
    const handler = vi.fn();
    render(<SyntaxInput 
                id="task-filter"
                items={items}
                placeHolderInput="placeholder"
                onInputChange={handler}/>)

    const input = screen.getByPlaceholderText('placeholder')
    
    await userEvent.type(input, 'tata')
    
    expect(screen.getByText('first')).toBeDefined()
})