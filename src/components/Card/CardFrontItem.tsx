import magicBubble from "../../assets/images/magic-bubble.png"
import type { Card } from "../../helpers/types"
import { getTextColor } from "../../helpers/gameStateHelper"

const CardFrontItem = ({id, value}: Card) => {

    return (
        <div id={id} className="border border-black bg-white h-32 w-24 flex text-6xl items-center justify-center">
            <div className={`isolate ${getTextColor(parseInt(value.toString()))} size-full flex justify-center items-center`}>
                {!(value === 'WIZ-BO') ? value : (
                    <span className="motion-safe:animate-spin">
                        <img src={magicBubble} alt="Wiz-Bo" className="animate-pulse"/>
                    </span>)}
            </div>
        </div>
    )
}

export default CardFrontItem