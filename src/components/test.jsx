import SlotAnimate from "./slot-animation";

export default function Test() {
    return <div className="bg-green-500 flex flex-col h-full">
        <div className="p-5 bg-red-500">GOI1</div>
        <div className="p-5 bg-blue-500 flex-grow  overflow-scroll">
            <div style={{height:'1200px'}}>Contenu</div>
        </div>
    </div>
}