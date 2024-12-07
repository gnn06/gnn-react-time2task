import { IDizer } from "../utils/stringUtil";
import { getSlotIdLevel, getSlotIdNextPrev, getSlotIdPrevious } from "./slot-id";

export class SlotPath {

    IDs: string[];

    constructor(expr: string) {
        this.IDs = IDizer(expr)
    }

    public shift(level: number, direction: number): SlotPath {
        const result = this.IDs.map(id => {
            const idLevel = getSlotIdLevel(id)
            if (idLevel === level) {
                const next = getSlotIdNextPrev(id, direction)
                return next
            } else {
                return id
            }
        })
        this.IDs = result
        return this
    }

    delete(ID_ToDelete: string): SlotPath {
        const result: string[] = []
        for (let i = 0; i < this.IDs.length; i++) {
            if (this.IDs[i] === ID_ToDelete) {
                break
            } else {
                result.push(this.IDs[i])
            }
        }
        this.IDs = result
        return this
    }

    toExpr(): string {
        return this.IDs.join(" ")
    }

    getLevel(): number {
        const id = this.IDs[this.IDs.length - 1]
        const level = getSlotIdLevel(id)
        return level
    }

    getLast(): string {
        return this.IDs !== null && this.IDs.length > 0  ? this.IDs[this.IDs.length - 1] : ""
    }
}

