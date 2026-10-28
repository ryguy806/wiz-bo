import type { Card } from "../../helpers/types"
import CardBackItem from "./CardBackItem"
import CardFrontItem from "./CardFrontItem"

type CardItemProps = {
    card: Card
    faceUp: boolean
}

const CardItem = ({card, faceUp}: CardItemProps) => {
    return (
        <div id={card.id} className="group h-32 w-24">
            <div className="relative size-full">
                {
                    !faceUp ? (
                        <div className="absolute inset-0 size-full">
                            <CardBackItem id={card.id} value={card.value}/>
                        </div>
                    ) : (
                        <div className="absolute inset-0 size-full">
                            <CardFrontItem id={card.id} value={card.value} />
                        </div>  
                    )
                } 
            </div>
        </div>
    )
}

export default CardItem