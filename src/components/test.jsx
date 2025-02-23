import { DEFAULT_CONF } from "../data/slot-view"
import SlotViewSelect from "./slot-view-select"

const slot = { id: 'this_month', inner: [] }

const selection = new Map()

const conf = DEFAULT_CONF
export default function Test() {
    return <SlotViewSelect conf={conf} />
}