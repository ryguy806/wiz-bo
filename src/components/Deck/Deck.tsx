import type { Card } from "../../helpers/types"
import CardItem from "../Card/CardItem"

type DeckProps = {
    name: string
    deck: Card[]
    faceUp: boolean
}

const Deck = ({name, deck, faceUp}: DeckProps) => {
  return (
    <div id={name} className="relative flex justify-center items-center">
        {
            deck.map((card, i) => (
                <div key={i} className="absolute -top-20 left-20">
                    <CardItem faceUp={faceUp} card={card} />
                </div>
            ))
        }
        
    </div>
  )
}

export default Deck