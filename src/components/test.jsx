import SlotTitle from './slot-title';
import SlotViewSelect from './slot-view-select';
import SyntaxInputWithSelection from './syntax-input-select';

function TestSyntaxInputSelect() {

    const handleExpr = (expr) => {
        console.log('expression change = ', expr)
    }

    return <SyntaxInputWithSelection items={['this_month', 'this_week', 'mercredi', 'jeudi']} 
        initialInputValue='' onInputChange={handleExpr} placeHolderInput='qsdqsd' classNameInput='text-lg bg-red-200'
        closeIcon={true}/>
}

const conf = {
    collapse: [
      "this_month next_week",
      "this_month following_week",
      "next_month"
    ],
    remove: [],
    levelMin: null,
    levelMaxIncluded: null
}

function TestSlotViewSelect() {
    return <SlotViewSelect selectionExpr="this_month every 1 this_week disable lundi mardi" conf={conf} onConfirm={null} onCancel={null} />

}

function TestSlotTitle() {
    return <div><SlotTitle slot={{id:"this_week"}} /><SlotTitle slot={{id:"this_month"}} /></div>
}

export default function Test() {
    //return <TestSyntaxInputSelect/>
    //return <TestSlotViewSelect/>
    return <TestSlotTitle/>
}