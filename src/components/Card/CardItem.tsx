import type { Card } from "../../helpers/types"
import CardBackItem from "./CardBackItem"
import CardFrontItem from "./CardFrontItem"

type CardItemProps = {
    card: Card
    faceUp: boolean
}

const CardItem = ({card, faceUp}: CardItemProps) => {
    return (
        <div id={card.id} className="group h-64 w-48">
            <div className="relative size-full">
                <div className="absolute inset-0 size-full" hidden={faceUp}>
                    <CardBackItem id={card.id} value={card.value}/>
                </div>
                <div className="absolute inset-0 size-full" hidden={!faceUp}>
                    <CardFrontItem id={card.id} value={card.value} />
                </div>
            </div>
        </div>
    )
}

export default CardItem