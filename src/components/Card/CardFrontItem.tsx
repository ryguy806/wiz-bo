import magicBubble from "../../assets/images/magic-bubble.png"
import type { Card } from "../../helpers/types"
import { getTextIcon } from "../../helpers/gameStateHelper"

const CardFrontItem = ({id, value}: Card) => {

    const num = parseInt(value.toString())
    const icon = getTextIcon(num)

    return (
        <div id={id} className="border border-black bg-white w-24 h-32 flex items-center justify-center">
            <div className={`isolate relative text-black size-full flex justify-center items-center`}>
                {!(value === 'WIZ-BO') ? (
                    <>
                         <div className="absolute top-1 left-1.5 flex flex-col items-center font-bold leading-none">
                            <span className="text-xs">{value}</span>
                        </div>
                        <div className="absolute bottom-1 right-1.5 flex rotate-180 flex-col items-center font-bold leading-none">
                            <span className="text-xs">{value}</span>
                        </div>

                                <span
                                    role="img"
                                    aria-label="icon"
                                    className="absolute place-self-center text-6xl"
                                >
                                    {icon}
                                </span>
                                <span role="contentinfo" aria-label={value.toString()} className="absolute place-self-center text-5xl text-black">
                                    {value}
                                </span>
                    </>
                ) : (
                    <span className="motion-safe:animate-spin">
                        <img src={magicBubble} alt="Wiz-Bo" className="animate-pulse"/>
                    </span>)}
            </div>
        </div>
    )
}

export default CardFrontItem