import magicBubble from "../../assets/images/magic-bubble.png"
import type { Card } from "../../helpers/types"
import { getTextIcon } from "../../helpers/gameStateHelper"

const L = 20, C = 50, R = 80
const SIDE_ROWS = [10, 36, 64, 90]

const PIP_LAYOUTS: Record<number, [number, number][]> = {
    1: [[C, 50]],
    2: [[C, 10], [C, 90]],
    3: [[C, 10], [C, 50], [C, 90]],
    4: [[L, 10], [R, 10], [L, 90], [R, 90]],
    5: [[L, 10], [R, 10], [C, 50], [L, 90], [R, 90]],
    6: [[L, 10], [R, 10], [L, 50], [R, 50], [L, 90], [R, 90]],
    7: [[L, 10], [R, 10], [C, 30], [L, 50], [R, 50], [L, 90], [R, 90]],
    8: [[L, 10], [R, 10], [C, 30], [L, 50], [R, 50], [C, 70], [L, 90], [R, 90]],
    9: [...SIDE_ROWS.flatMap((y): [number, number][] => [[L, y], [R, y]]), [C, 50]],
    10: [...SIDE_ROWS.flatMap((y): [number, number][] => [[L, y], [R, y]]), [C, 23], [C, 77]],
    // 11 and 12 don't exist in a standard deck, so these are a 3x4 grid (11 = 12 minus one)
    11: [[L, 12], [C, 12], [R, 12], [L, 37], [R, 37], [L, 63], [C, 63], [R, 63], [L, 88], [C, 88], [R, 88]],
    12: [[L, 12], [C, 12], [R, 12], [L, 37], [C, 37], [R, 37], [L, 63], [C, 63], [R, 63], [L, 88], [C, 88], [R, 88]],
}

const CardFrontItem = ({id, value}: Card) => {

    const num = parseInt(value.toString())
    const icon = getTextIcon(num)
    const pips = PIP_LAYOUTS[num] ?? []
    const pipSize = num >= 9 ? "text-base" : num === 1 ? "text-4xl" : "text-xl"

    return (
        <div id={id} className="border-3 border-gray-600 bg-white w-24 h-32 flex items-center justify-center rounded">
            <div className={`isolate relative text-black size-full flex justify-center items-center`}>
                {!(value === 'WIZ-BO') ? (
                    <>
                         <div className="absolute top-1 left-1.5 flex flex-col items-center font-bold leading-none">
                            <span className="text-sm">{value}</span>
                        </div>
                        <div className="absolute inset-y-5 inset-x-5">
                            {pips.map(([x, y], i) => (
                                <span
                                    key={i}
                                    role="img"
                                    aria-label="icon"
                                    className={`-z-5 absolute -translate-x-1/2 -translate-y-1/2 leading-none ${pipSize} ${value == 1 ? "rotate-20 pl-6" : "opacity-80"}`}
                                    style={{ left: `${x}%`, top: `${y}%` }}
                                >
                                    {icon}
                                </span>
                            ))}
                            <span role="contentinfo" aria-label={value.toString()} className="text-7xl flex justify-center pt-1 font-manufacturing text-black z-10">
                                {value}
                            </span>
                        </div>
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