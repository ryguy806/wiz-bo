import type { Player } from "../../helpers/types"
import Deck from "../Deck/Deck"

const OpponentArea = ({player}: {player: Player}) => (
    <div className="rounded-lg bg-black/30 p-3">
        <h3 className="mb-2 text-center font-semibold text-white">{player.name}</h3>
        <div className="flex items-start justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
                <Deck name="Stock" deck={player.stockPile} faceUp={true} />
                <span className="text-xs text-white/70">Stock</span>
            </div>
            {player.discardPiles.map((pile, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                    <Deck name={`Discard ${i + 1}`} deck={pile} faceUp={true} />
                    <span className="text-xs text-white/70">Discard {i + 1}</span>
                </div>
            ))}
        </div>
    </div>
)

export default OpponentArea