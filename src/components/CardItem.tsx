import cardBack from "../assets/images/wizard-card-back.jpg"
import magicBubble from "../assets/images/magic-bubble.png"            

import type { Card } from "../helpers/types"
import { useState } from "react"
import { getTextColor } from "../helpers/gameStateHelper"

const CardItem = ({id, value}: Card) => {
    const [cardValue, setCardValue] = useState<string | number>(value)
    const color = getTextColor(parseInt(cardValue.toString()))



    if (cardValue === "WIZ-BO") setCardValue(magicBubble)

    return (
        <div id={id} className="border border-black w-10 h-20 flex text-xl items-center justify-center">
            <div className={`isolate text-${color}-500 size-full flex justify-center items-center`}>
                {typeof(cardValue) === typeof(1) ? value : (
                    <span className="motion-safe:animate-spin">
                        <img src={cardValue.toString()} className="animate-pulse"/>
                    </span>)}
            </div>
        </div>
    )
}

export default CardItem