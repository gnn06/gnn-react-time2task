import { DEFAULT_CONF } from "../data/slot-view"
import SlotSelectDialog from "./slot-select-dialog"

const slot = { id: 'this_month', inner: [] }

const selection = new Map()

const conf = DEFAULT_CONF
export default function Test() {
    return <SlotSelectDialog conf={conf} />
}