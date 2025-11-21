import { IDizer } from "../utils/stringUtil";
import { getSlotIdCurrent, getSlotIdDistance, getSlotIdLevel, getSlotIdNextPrev, getSlotIdPrevious, isSlotIdEquals } from "./slot-id";

export class SlotPath {

    IDs: string[];

    constructor(expr: string) {
        this.IDs = IDizer(expr) ?? []
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
        if (this.IDs === null) return "";
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

    getDistanceTo(otherPath: SlotPath): number {
        const id = this.getLast()
        const otherId = otherPath.getLast()
        const distance = getSlotIdDistance(id, otherId)
        return distance
    }

    append(newID: string) : SlotPath {
        if (this.IDs === null) return this
        this.IDs = this.IDs.concat(IDizer(newID)) 
        return this
    }

    equals(other: SlotPath) : boolean {
        for (let i = 0; i < this.IDs.length; i++) {
            if (!isSlotIdEquals(this.IDs[i], other.IDs[i]) || this.IDs.length !== other.IDs.length) {
                return false;
            }
        }
        return true;
    }

    
    /**
     * is this is inside other one ?
     */
    equalsOrInclude(other: SlotPath) : boolean {
        if (this.IDs.length < other.IDs.length) return false;
        for (let i = 0; i < other.IDs.length; i++) {
            if (!isSlotIdEquals(this.IDs[i], other.IDs[i])) {
                return false;
            }
        }
        return true;
    }

    replace(level:number, id:string) : SlotPath {
        const new_IDs = this.IDs.map(el => getSlotIdLevel(el) === level ? id : el)
        this.IDs = new_IDs
        return this
    }

    truncate(level:number) : SlotPath {
        const new_IDs = this.IDs.filter(el => getSlotIdLevel(el) <= level ? true : false)
        this.IDs = new_IDs
        return this
    }
}

export function getCurrentPathExpr(level: number) : string {
    const tmpResult = [];
    for (let i = 1; i <= level; i++) {
        const current = getSlotIdCurrent(i);
        tmpResult.push(current);
    }
    return tmpResult.join(" ");
}