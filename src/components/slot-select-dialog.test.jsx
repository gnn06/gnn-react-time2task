import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SlotSelectDialog from './slot-select-dialog';
import { DEFAULT_CONF } from '../data/slot-view';

const noop = () => {};

const TODAY = 'this_month this_week today';
const TOMORROW = 'this_month this_week tomorrow';
const TODAY_MATIN = 'this_month this_week today matin';
const TODAY_APREM = 'this_month this_week today aprem';

function renderDialog(selectionExpr, onConfirm = noop) {
    render(
        <SlotSelectDialog
            selectionExpr={selectionExpr}
            conf={DEFAULT_CONF}
            onConfirm={onConfirm}
            onCancel={noop}
            title="test"
        />
    )
}

describe('SlotSelectDialog — today/tomorrow dans le picker', () => {

    test('today et tomorrow présents dans le picker', () => {
        renderDialog('')
        expect(document.querySelector(`[data-slot-path="${TODAY}"]`)).toBeInTheDocument()
        expect(document.querySelector(`[data-slot-path="${TOMORROW}"]`)).toBeInTheDocument()
    })

    test('today matin et today aprem présents', () => {
        renderDialog('')
        expect(document.querySelector(`[data-slot-path="${TODAY_MATIN}"]`)).toBeInTheDocument()
        expect(document.querySelector(`[data-slot-path="${TODAY_APREM}"]`)).toBeInTheDocument()
    })

    test('selectionExpr=today → today sélectionné (bg-blue-400), pas de doublon', () => {
        renderDialog('today')
        const todayNodes = document.querySelectorAll(`[data-slot-path="${TODAY}"]`)
        expect(todayNodes).toHaveLength(1)
        expect(todayNodes[0].className).toContain('bg-blue-400')
    })

    test('selectionExpr=today matin → today matin sélectionné, un seul nœud today', () => {
        renderDialog('today matin')
        expect(document.querySelectorAll(`[data-slot-path="${TODAY}"]`)).toHaveLength(1)
        const todayMatinNode = document.querySelector(`[data-slot-path="${TODAY_MATIN}"]`)
        expect(todayMatinNode.className).toContain('bg-blue-400')
    })

    test('selectionExpr=this_week → clic today → confirm raffine en "this_month this_week today"', async () => {
        const onConfirm = vi.fn()
        const user = userEvent.setup()
        renderDialog('this_week', onConfirm)

        await user.click(document.querySelector(`[data-slot-path="${TODAY}"]`))
        await user.click(screen.getByRole('button', { name: /confirm/i }))

        expect(onConfirm).toHaveBeenCalledWith(TODAY)
    })
})
