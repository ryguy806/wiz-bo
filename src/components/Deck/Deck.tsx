import type { Card } from "../../helpers/types"
import CardItem from "../Card/CardItem"

type DeckProps = {
    name: string
    deck: Card[]
}

const Deck = ({name, deck}: DeckProps) => {
  return (
    <div id={name} className="relative flex justify-center items-center">
        {
            deck.map((card, i) => (
                <div key={i} className="absolute top-0 left-0">
                    <CardItem faceUp={false} card={card} />
                </div>
            ))
        }
        
    </div>
  )
}

export default Deck