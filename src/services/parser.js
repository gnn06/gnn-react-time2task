import { tokenizer } from "../utils/stringUtil";
import { getSlotLevel } from "./slot-path";

export class Parser {

    input = [];
    stack = [];

    constructor(Pinput, Pstack) {
        this.input = Pinput;
        this.stack = Pstack;
    }

    parse(inputP) {
        if (inputP === undefined) return undefined;

        this.input = tokenizer(inputP).concat('$end');
        this.stack = [];
        while (this.input.length > 0) {
            this.shiftReduce();
        }
        return this.stack.at(0);
    }

    shiftReduce() {
        const current = this.input.shift();
        if (this.stack.length === 0) {
            this.stack.push(shiftBranchOrFlag(current));
            return
        }
        const last = this.stack.at(-1);
        if (isRupture(current, last)) {
            // Rupture
            if (this.stack.length >= 2) {
                const previous = this.stack.at(-2);
                if (previous.type === 'branch' && last.type === 'branch') {
                    if (getLevelNode(previous) === getLevelNode(last) || getLevelNode(previous) > getLevelNode(last)) {
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
                } else if (previous.type === 'flag' && (last.type === 'branch' || last.type === 'multi')) {
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(reduceFlag(previous, last));
                    this.input.unshift(current);
                    return
                } else {
                    this.stack.pop();
                    this.stack.pop();
                    this.stack.push(reduceConcatBranch(previous, last));
                    this.input.unshift(current);
                    return
                }
            } else if (current !== '$end') {
                this.stack.push(shiftBranchOrFlag(current));
                return
            }
        } else {
            // pas de rupture
            this.stack.push(shiftBranchOrFlag(current));
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
        return getSlotLevel(node)
    }
    if (node.type === 'branch') {
        return getLevelNode(node.value.at(0));
    }
    if (node.type === 'multi') {
        return getLevelNode(node.value.at(0));
    }
}

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
    } else {
        return { type: 'branch', value: [current] };
    }
}    

export function reduceMulti(previous, last) {
    return { type: 'multi', value: [ previous, last ] };
}

export function reduceConcatBranch(previous, last) {
    return { type: 'branch', value: previous.value.concat(last.value) };
}

export function reduceConcatBranchMulti(previous, last) {
    return { type: 'branch', value: previous.value.concat(last) };
}

export function reduceConcatBranchMulti2Multi(previous, last) {
    return { type: 'multi', value: [previous].concat(last.value) };
}

export function reduceFlag(previous, last) {
    if (last.type === 'branch') {
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