import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react"

import SlotTitle from "./slot-title";
import TaskLight from "./task-light";

export default function Test() {
    const ref1 = useRef(null);
    const ref2 = useRef(null);

    const [distance, setDistance] = useState(0)

    useEffect(() => {
        if (ref1.current && ref2.current) {
            const rect1 = ref1.current.getBoundingClientRect()
            const rect2 = ref2.current.getBoundingClientRect()
            const toto = rect2.x - rect1.x
            setDistance(toto)
        }
    }, [])
      
    return <div>
        <div className="flex flex-row">
            <div className="border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 w-40 bg-blue-200 " ref={ref1}>
                <SlotTitle  slot={{ id:'this_month', path:"this_month", inner: [] }}/>
            </div>
            <div className="border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 w-40 bg-blue-200 " ref={ref2}>
                <SlotTitle  slot={{ id:'next_month', path:"this_month", inner: [] }}/>
                <motion.div 
                    animate={{ 
                        translateX: "-"+distance+"px", 
                        transition: { 
                            ease: "easeInOut", 
                            repeat: Infinity, 
                            duration: 1.3, delay: 0.7, repeatDelay: 0.7,
                        }}}  >
                    <TaskLight key="123" task={{title:"task",slotExpr:"this_month"}} />
                </motion.div>
            </div>
        </div>       
    </div>    
}