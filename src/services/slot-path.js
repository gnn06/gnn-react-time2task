export default class SlotPath {
    constructor(expr) {
        const slots = expr.split(' ');
        this.slots = slots;
    }
}