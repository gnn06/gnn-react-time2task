import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react"

import SlotTitle from "./slot-title";
import TaskLight from "./task-light";

export default function SlotAnimate() {
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
      
    const duration = 1.5;
    const transX = "-"+distance+"px";
    return <div>
        <div className="flex flex-row">
            <div className="border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 w-40 bg-blue-200 " ref={ref1}>
                <motion.div animate={{
                        scale: [1.0, 1.0,  1.0, 1.0, 1.2,  1.0],
                        times: [0.0, 0.1, 0.2, 0.8, 0.9, 1.0],
                        originX: [0.5],
                        originY: [1.0],
                        transition: {
                            duration: duration,
                            ease: [0.390, 0.575, 0.565, 1.000],
                            // ease: 'easeIn',
                            repeat: Infinity,
                            repeatDelay: 0.3,
                            repeatType: 'loop',
                        }
                    }}>
                    <SlotTitle  slot={{ id:'cette semaine', path:"this_month this_week", inner: [] }}/>
                </motion.div>
            </div>
            <div className="border-2 border-gray-500 rounded p-1 m-0 mt-1 mr-1 w-40 bg-blue-200 " ref={ref2}>
                <motion.div
                    animate={{
                        scale: [1.0, 1.2,  1.0, 1.0, 1.0,  1.0],
                        times: [0.0, 0.1, 0.2, 0.8, 0.9, 1.0],
                        originX: [0.5],
                        originY: [1.0],
                        transition: {
                            duration: duration,
                            ease: [0.390, 0.575, 0.565, 1.000],
                            // ease: 'easeIn',
                            repeat: Infinity,
                            repeatDelay: 0.3,
                            repeatType: 'loop'
                        }
                    }}>
                    <SlotTitle  slot={{ id:'semaine prochaine', path:"this_month this_week", inner: [] }}/>
                </motion.div>
                <motion.div 
                    animate={{ 
                        translateX: [0,   0, transX, transX],
                        times:      [0.0, 0.4, 0.6, 1],
                        transition: { 
                            ease: 'easeInOut',
                            repeat: Infinity, 
                            repeatDelay: 0.3,
                            duration: duration,
                        }}}  >
                    <TaskLight key="123" task={{title:"task",slotExpr:"this_month next_week"}} />
                </motion.div>

            </div>
        </div>       
    </div>    
}