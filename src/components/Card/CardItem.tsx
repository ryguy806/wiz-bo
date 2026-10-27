import type { Card } from "../../helpers/types"
import CardBackItem from "./CardBackItem"
import CardFrontItem from "./CardFrontItem"

const CardItem = ({id, value}: Card) => {
    return (
        <div id={id} className="group">
            <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Back (shown first) */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <CardBackItem id={id} value={value}/>
        </div>

        {/* Front (rotated so it's correct once flipped) */}
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <CardFrontItem id={id} value={value} />
        </div>
      </div>
        </div>
    )
}

export default CardItem