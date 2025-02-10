import { useState } from "react"
import { Parser } from "../data/parser"
import { branchComplete, branchToExpr } from "../data/slot-branch"
import { selectionToTree, treeToSelection } from "../data/selection-tree"
import { isSlotEqual, isSlotEqualOrInclude } from "../data/slot-expr"
import { branchToTree, treetoBranch } from "../data/tree"

const parser = new Parser()

// let result = parser.parse(expr)
// if (result === undefined) return new Map()
// result = branchToTree(branchComplete(result, 1))
// result = treeToSelection(result)
// result = new Map(result)
// this_week + 3

export default function TestExpr() {
    const equalComparaison = "this_month this_week lundi"
    const [expression, setExpression] = useState("this_month every 1 this_week lundi disable mardi")
    const handleExpression = (event) => {
        setExpression(event.target.value)
    }
    const branchIn = parser.parse(expression)
    const isEqual = isSlotEqual(expression, equalComparaison)
    const isEqualOrInclude = isSlotEqualOrInclude(expression, equalComparaison)
    const completeBranchIn = branchIn && branchComplete(branchIn)
    const treeIn = completeBranchIn && branchToTree(completeBranchIn)
    const selectionIn = treeIn && treeToSelection(treeIn) // treeToSection retourne [["path", {selected}]]
    const treeOut = selectionIn && selectionToTree(new Map(selectionIn))
    const branchOut = treeOut && treetoBranch(treeOut)
    const exprOut = treeOut && branchToExpr(branchOut)


    return <div className="font-mono">
        <input className="m-2 w-full" placeholder="value to debug" value={expression} onChange={handleExpression}/>
        <div>expr parse</div>
        <div className="m-2">{ JSON.stringify(branchIn) }</div>
        {/* <div>branchComplete</div>
        <div className="m-2">{ JSON.stringify(completeBranchIn)}</div>
        <div>branchToTree</div>
        <div className="m-2">{ JSON.stringify(treeIn)}</div>
        <div>treeToSelection</div>
        <div className="m-2">{ JSON.stringify(selectionIn)}</div>
        <div>selectionToTree</div>
        <div className="m-2">{ JSON.stringify(treeOut)}</div>
        <div>treetoBranch</div>
        <div className="m-2">{ JSON.stringify(branchOut)}</div>
        <div>branchToExpr</div>
        <div className="m-2">{ JSON.stringify(exprOut)}</div> */}
        <div>isSlotEqual {equalComparaison}</div>
        <div className="m-2">{ JSON.stringify(isEqual)}</div>
        <div>isSlotEqualOrInclude{equalComparaison}</div>
        <div className="m-2">{ JSON.stringify(isEqualOrInclude)}</div>
    </div>
}