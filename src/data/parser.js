import { tokenizer } from "../utils/stringUtil";
import { getSlotIdLevel, SLOTIDS_LST, EXPR_KEYWORDS } from "./slot-id";
import { treetoBranch } from "./tree";

export class Parser {

    input = [];
    stackBranch = [];
    stackNode   = [];

    parseKeyWords = [...SLOTIDS_LST,
            ...EXPR_KEYWORDS, 'EVERY2', '+', '1', '2', '3', '$end'];

    constructor(Pinput, PstackNode, PstackBranch) {
        this.input     = Pinput
        this.stackNode = PstackNode;
        this.stackBranch     = PstackBranch;
    }

    /**
     * 
     * @returns undefined if error
     */
    parse(inputP) {
        try {
            if (inputP === undefined) return undefined;

            this.input = tokenizer(inputP).concat('end');
            this.stackBranch = [];
            this.stackNode = [];
            this.parseNode()
            this.parseTree()
            this.parseBranch()
            return this.stackBranch;
        } catch (error) {
            console.error(error, ' caused by ', inputP)
            return undefined
        }
    }

    /**
     * input to stackNode
     */
    parseNode() {
        while (this.input.length > 0) {
            const current  = this.input.shift();
            const last     = this.stackNode.at(-1);
            const previous = this.stackNode.at(-2);
            
            // reduce
            if (previous && previous.type === 'repetition' && last.type === 'node') {
                this.stackNode.pop();
                this.stackNode.pop();
                this.stackNode.push(reduceRepetition(previous, last));
                this.input.unshift(current);
                continue
            }
            if (previous && previous.type === 'flag' && last.type === 'node') {
                this.stackNode.pop();
                this.stackNode.pop();
                this.stackNode.push(reduceFlag(previous, last));
                this.input.unshift(current);
                continue
            }
        
            // shift
            if (current === 'disable') {
                this.stackNode.push(shiftBranchOrFlag(current));
                continue
            }
            if (current === 'every') {
                const shiftNumber = this.input.shift();
                let value = parseInt(shiftNumber)
                if (isNaN(value)) {
                    value = 1
                    this.input.unshift(shiftNumber);
                }
                this.stackNode.push({ type: 'repetition', value: value })
                continue
            }
            if (current === 'chaque') {
                this.stackNode.push(shiftBranchOrFlag(current));
                continue
            }
            if (SLOTIDS_LST.indexOf(current) > -1) {
                this.stackNode.push({ type: 'node', value: current })
                continue ;
            }
            if (current === '+') {
                const shiftNumber = this.input.shift();
                const last = this.stackNode.pop();
                this.stackNode.push({ ...last, shift: parseInt(shiftNumber) })
                continue
            }
        }
    }

    parseTreeOne() {
        if (this.stackNode.length === 0) return
        const nextValue = this.stackNode.at(0)
        if (getLevelNode(nextValue) > getLevelNode(this.currentTree.value)) { // deeper
            const value = this.stackNode.shift()
            const newBranch = node2Tree(value)
            this.currentTree.child.push(newBranch)
            this.parentsTree.push(this.currentTree)
            this.currentTree = newBranch
        } else if (getLevelNode(nextValue) === getLevelNode(this.currentTree.value)) {  // same level
            this.currentTree = this.parentsTree.pop()
        } else { // lower
            this.currentTree = this.parentsTree.pop()
        }
    }

    // stackNode to rootTree
    parseTree() {
        this.rootTree = { value: -1, child: [] }
        this.currentTree = this.rootTree
        this.parentsTree = []
        while (this.stackNode.length > 0) {
            this.parseTreeOne()            
        }
    }
    
    parseBranch() {
        this.stackBranch = treetoBranch(this.rootTree)
    }
}

export function getLevelNode(node) {
    if (typeof node === 'number') {
        return node;
    }
    if (typeof node === 'string' && !isNaN(node))
        return Number(node)
    if (typeof node === 'string') {
        return getSlotIdLevel(node)
    }
    if (node.type === 'branch') {
        return getLevelNode(node.value.at(0));
    }
    if (node.type === 'node') {
        return getLevelNode(node.value);
    }
    if (node.type === 'multi') {
        return getLevelNode(node.value.at(0));
    }
}


export function shiftBranchOrFlag(current) {
    if (current === 'disable' || current === 'chaque') {
        return { type: 'flag', value: current };
    } if (current === 'every') {
        return { type: 'repetition', value: current };
    } if (current === 'EVERY2') {
        return { type: 'repetition', value: 2 };
    } else {
        return { type: 'branch', value: [current] };
    }
}    

export function reduceFlag(previous, last) {
    if (last.type === 'branch' || last.type === 'node') {
        const flag = previous.value;
        const flags = last.flags ? [ flag ].concat(last.flags) : [ flag ];
        last.flags = flags
        return last;
    } else if (last.type === 'multi') {
        const flag = previous.value;
        const flags = last.value.at(0).flags ? [ flag ].concat(last.value.at(0).flags) : [ flag ];
        last.value.at(0).flags = flags
        return last;
    }
}

export function reduceRepetition(previous, last) {
    if (last.type === 'branch') {
        return {...last, repetition: previous.value};
    } else if (last.type === 'node') {
        return {...last, repetition: previous.value};
    } else {
        return {...last, value: [{...last.value[0], repetition: previous.value}].concat(last.value.slice(1))};
    }
}

export function node2Tree(node) {
    if (Number.isInteger(node)) 
        return { value: node, child: [] }
    else {
        const disable    = node.flags && (node.flags.indexOf('disable') > -1 || undefined) 
        const repetition = node.repetition
        const shift      = node.shift
        const chaque     = node.flags && (node.flags.indexOf('chaque') > -1 || undefined)
        return { value: node.value, child: [], disable, repetition, shift, chaque }
    }
}