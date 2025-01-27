import SlotTitle from './slot-title';
import SlotTreeSelect from './slot-tree-select';
import SlotViewSelect from './slot-view-select';
import SyntaxInputWithSelection from './syntax-input-select';
import TestDnd from './test-dnd-onecompo';

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
    // const slot = {id:"this_month", path: "this_month", inner: [
    //     {id:"this_week", path: "this_month this_week", inner: [
    //         {id:"lundi", path: "this_month this_week lundi", inner: []},
    //         {id:"mardi", path: "this_month this_week mardi", inner: []},
    //         {id:"mercredi", path: "this_month this_week mercredi", inner: []},
    //         {id:"jeudi", path: "this_month this_week jeudi", inner: []},
    //     ]}
    // ]}
    // return <SlotTreeSelect slot={slot} selection={null} handleSelection={null} handleShift={null} handleDelete={null} handleAdd={null} handleRepetition={null} handleDisable={null}/>
    return <SlotViewSelect selectionExpr="this_month this_week mardi" conf={conf} onConfirm={null} onCancel={null} />

}

function TestSlotTitle() {
    return <div><SlotTitle slot={{id:"this_week"}} /><SlotTitle slot={{id:"this_month"}} /></div>
}

export default function Test() {
    //return <TestSyntaxInputSelect/>
    // return <TestSlotTitle/>
    return <TestSlotViewSelect/>
    // return <TestDnd/>
}