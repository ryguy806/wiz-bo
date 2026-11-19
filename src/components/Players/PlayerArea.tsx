import type { Player, CardSource } from "../../helpers/types"
import Deck from "../Deck/Deck"
import Hand from "../Hand/Hand"

type PlayerAreaProps = {
    active: Player
    me: Player
    isComputerTurn: boolean
    instruction: string
    winner: string | null
    color: string
    selected: CardSource | null
    setSelected: (selected: CardSource | null) => void
    onDiscard: (cardId: string, discardIndex: number) => void
}

const PlayerArea = ({active, me, isComputerTurn, instruction, winner, color, selected, setSelected, onDiscard}: PlayerAreaProps) => {

    const isSelected = (source: CardSource) => {
        if (!selected || selected.from !== source.from) return false
        if (source.from === "hand" && selected.from === "hand") return source.cardId === selected.cardId
        if (source.from === "discard" && selected.from === "discard") return source.pile === selected.pile
        return true
    }
    
    const toggleSelect = (source: CardSource) => {
        if (isComputerTurn) return
        setSelected(isSelected(source) ? null : source)
    }

    const handleDiscardClick = (index: number) => {
        if (winner || isComputerTurn) return
        if (selected?.from === "hand") {
            onDiscard(selected.cardId, index)
            setSelected(null)
        } else if (active.discardPiles[index].length > 0) {
            toggleSelect({from: "discard", pile: index})
        }
    }

    return (
        <div className="flex flex-row relative pt-3">
            <div className="absolute -left-60 top-10">
                <p className="text-2xl font-semibold wrap-word w-50" style={{color: color}}>
                    {active.name}'s Turn{isComputerTurn && " (thinking...)"}
                </p>
                {!isComputerTurn && <p className="text-sm w-50 wrap-word">{instruction}</p>}
            </div>
            <div>
                <div className="flex flex-wrap items-start justify-center gap-6 pb-3">
                    <div className="flex flex-col items-center gap-1">
                        <Deck
                            name="Stock"
                            deck={me.stockPile}
                            draggable={!isComputerTurn && !winner}
                            faceUp={true}
                            selected={isSelected({from: "stock"})}
                            onClick={() => toggleSelect({from: "stock"})}
                            color={color}
                        />
                    </div>

                    {me.discardPiles.map((pile, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <Deck
                                name={`Discard ${i + 1}`}
                                dropId={`discard-${i}`}
                                draggable={!isComputerTurn && !winner}
                                deck={pile}
                                faceUp={true}
                                selected={isSelected({from: "discard", pile: i})}
                                highlight={!isComputerTurn && selected?.from === "hand"}
                                onClick={() => handleDiscardClick(i)}
                                color={color}
                            />
                        </div>
                    ))}
                </div>
                <Hand
                    faceUp={true}
                    cards={me.hand}
                    selectedId={selected?.from === "hand" ? selected.cardId : null}
                
                    onSelect={(card) => toggleSelect({from: "hand", cardId: card.id})}
                    dragDisabled={isComputerTurn || !!winner}
                />
            </div>
        </div>
    )
}

export default PlayerArea