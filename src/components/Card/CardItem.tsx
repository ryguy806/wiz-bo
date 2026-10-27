import type { Card } from "../../helpers/types"
import CardBackItem from "./CardBackItem"
import CardFrontItem from "./CardFrontItem"

const CardItem = ({id, value}: Card) => {
    return (
        <div id={id} className="group h-64 w-48 [perspective:1000px]">
            <div className="relative size-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <div className="absolute inset-0 size-full [backface-visibility:hidden]">
                    <CardBackItem id={id} value={value}/>
                </div>
                <div className="absolute inset-0 size-full [transform:rotateY(180deg)] [backface-visibility:hidden]">
                    <CardFrontItem id={id} value={value} />
                </div>
            </div>
        </div>
    )
}

export default CardItem