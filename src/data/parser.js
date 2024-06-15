import { tokenizer } from "../utils/stringUtil";
import { getSlotIdLevel, SLOTIDS_LST, EXPR_KEYWORDS } from "./slot-id";

export class Parser {

    input = [];
    stack = [];
    parsing = '';

    parseKeyWords = [...SLOTIDS_LST,
            ...EXPR_KEYWORDS, 'EVERY2', '+', '1', '2', '3', '$end'];

    constructor(Pinput, Pstack, Pparsing) {
        this.input = Pinput;
        this.stack = Pstack;
        this.parsing = Pparsing === undefined ? 'node' : Pparsing;
    }

    /**
     * 
     * @returns undefined if error
     */
    parse(inputP) {
        try {
            if (inputP === undefined) return undefined;

            this.input = tokenizer(inputP).concat('$end');
            this.stack = [];
            while (this.input.length > 0) {
                if (this.parsing === 'node' || this.parsing === '') {
                    this.shiftReduceNode();
                } else if (this.parsing === 'branch') {
                    this.shiftReduceBranch();
                }
            }
            return this.stack.at(0);
        } catch (error) {
            console.error(error, ' caused by ', inputP)
            return undefined
        }
    }

    shiftReduceNode() {
        const current = this.input.shift();
        const last     = this.stack.at(-1);
        const previous = this.stack.at(-2);
        if (current === 'disable' && (last === undefined || last.type !== 'node')) {
            this.stack.push(shiftBranchOrFlag(current));
            return
        }
        if (current === 'every' && (last === undefined || last.type !== 'node')) {
            const shiftNumber = this.input.shift();
            this.stack.push({ type: 'repetition', value: parseInt(shiftNumber) })
            return
        }
        if (current === 'EVERY2' && (last === undefined || last.type !== 'node')) {
            this.stack.push(shiftBranchOrFlag(current));
            return
        }
        if (current === 'chaque' && (last === undefined || last.type !== 'node')) {
            this.stack.push(shiftBranchOrFlag(current));
            return
        }
        if (SLOTIDS_LST.indexOf(current) > -1 && (last === undefined || last.type !== 'node')) {
            this.stack.push({ type: 'node', value: current })
            return ;
        }
        if (current === '+') {
            const shiftNumber = this.input.shift();
            const last = this.stack.pop();
            this.stack.push({ ...last, shift: parseInt(shiftNumber) })
            return
        }
        //if (current === '$end' || slotIdList.indexOf(current) > -1) {
            if (previous !== undefined && previous.type === 'flag' && last !== undefined && last.type === 'node') {
                this.stack.pop();
                this.stack.pop();
                this.stack.push(reduceFlag(previous, last));
                this.input.unshift(current);
                return
            }
            if (previous !== undefined && previous.type === 'repetition' && last !== undefined && last.type === 'node') {
                this.stack.pop();
                this.stack.pop();
                this.stack.push(reduceRepetition(previous, last));
                this.input.unshift(current);
                return
            }
            this.parsing = 'branch';
            this.input.unshift(current);
            return
        //}
    }
    
    shiftReduceBranch() {
        const current = this.input.shift();
        if (this.parseKeyWords.indexOf(current) === -1) return;
        const last = this.stack.at(-1);
        if (last !== undefined && isRupture(current, last)) {
            // Rupture de niveau ou apparition d'un flag
            // on essaie de reduire au maximum et sinon on empile
            if (this.stack.length >= 2) {
                const previous = this.stack.at(-2);
                if (previous.type === 'branch' && last.type === 'branch') {
                    if (getLevelNode(previous) >= getLevelNode(last)) {
                        this.stack.pop();
                        this.stack.pop();
                        this.stack.push(reduceMulti(previous, last));
                        this.input.unshift(current);
                        return
                    } else {
                        this.stack.pop();
                        this.stack.pop();
                        this.stack.push(reduceConcatBranch(previous, last));
                        this.input.unshift(current);
                        return
                    }
                } else if (previous.type === 'branch' && last.type === 'multi') {
                    if (getLevelNode(previous) >= getLevelNode(last)) {
                        this.stack.pop();
                        this.stack.pop();
                        this.stack.push(reduceConcatBranchMulti2Multi(previous, last))
                        this.input.unshift(current);
                        return
                    } else {
                        this.stack.pop();
                        this.stack.pop();
                        this.stack.push(reduceConcatBranchMulti(previous, last))
                        this.input.unshift(current);
                        return
                    }
                } else if (previous.type === 'multi' && last.type === 'branch') {
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(reduceMulti(previous, last))
                    this.input.unshift(current);
                    return
                } else if (previous.type === 'branch' && last.type === 'node') {
                    if (getLevelNode(previous) < getLevelNode(last)) {
                        // this_week mardi
                        this.stack.pop();
                        this.stack.pop();
                        this.stack.push(reduceConcatBranch(previous, last));
                        this.input.unshift(current);
                        return
                    }
                }
            } // pas de previous
        } // Not Rupture
        if (last !== undefined && last.type === 'node') {
            this.stack.pop();
            this.stack.push(reduceNode(last));
            this.input.unshift(current);
            return
        }
        if ([...SLOTIDS_LST, ...EXPR_KEYWORDS, 'EVERY2'].indexOf(current) > -1) {
            this.parsing = 'node';
            this.input.unshift(current);
            return
        }
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

/* quand un flag apparait dans le flux, ça introduit une rupture si le précédent est un slot normal, un flag qui suit un flag ne provoque pas de rupture */
function isRupture(current, last) {
    if (current === '$end' || getLevelNode(current) < getLevelNode(last)) {
        return true
    } else {
        return false
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

export function reduceMulti(previous, last) {
    return { type: 'multi', value: [ previous, last ] };
}

export function reduceConcatBranch(previous, last) {
    if (last.flags === undefined && last.shift === undefined && last.repetition === undefined) {
        // on conserve la structure last
        return { ...previous, type: 'branch', value: previous.value.concat(last.value) };
    } if (last.type === 'node') {
        return { ...previous, type: 'branch', value: previous.value.concat({...last, type: 'branch', value: [last.value]}) };
    } else {
        // on met les valeur à plat
        return { ...previous, type: 'branch', value: previous.value.concat(last) };
    }    
}

export function reduceConcatBranchMulti(previous, last) {
    return { type: 'branch', value: previous.value.concat(last) };
}

export function reduceConcatBranchMulti2Multi(previous, last) {
    return { type: 'multi', value: [previous].concat(last.value) };
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

export function reduceNode(last) {
    return {...last, type: 'branch', value: [ last.value ] }
}
