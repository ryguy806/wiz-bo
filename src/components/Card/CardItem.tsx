import type { Card } from "../../helpers/types"
import CardBackItem from "./CardBackItem"
import CardFrontItem from "./CardFrontItem"

type CardItemProps = {
    card: Card
    faceUp: boolean
    selected?: boolean
    onClick?: () => void
    playerColor?: string
}

const CardItem = ({card, faceUp, selected = false, onClick, playerColor="#000"}: CardItemProps) => {
    const interactive = onClick !== undefined && faceUp

    return (
        <div
            id={card.id}
            onClick={onClick}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onClick()
                }
            } : undefined}
            className={`group w-24 h-32 rounded transition-transform
                ${interactive ? "cursor-pointer hover:-translate-y-1" : ""}
                ${selected ? `-translate-y-3 ring-4 ring-[${playerColor}]` : ""}`}
        >
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