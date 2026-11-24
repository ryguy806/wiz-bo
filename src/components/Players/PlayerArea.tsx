import type { Player, CardSource } from "../../helpers/types"
import Deck from "../Deck/Deck"
import Hand from "../Hand/Hand"
import DiscardPile from "../Deck/DiscardPile"

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

    return (
        <div className="flex flex-row relative pt-3">
            <div className="absolute -left-60 top-10">
                <p className="text-2xl font-semibold wrap-word w-50" style={{color: color}}>
                    {active.name}{isComputerTurn && "'s Turn (thinking...)"}
                </p>
                {!isComputerTurn && <p className="text-sm w-50 wrap-word">{instruction}</p>}
            </div>
            <div>
                <div className="flex flex-wrap items-start justify-center gap-8 pb-3">
                    {me.discardPiles.map((pile, i) => (
                        <div key={i}>
                            <DiscardPile 
                                active={active}
                                pile={pile}
                                isComputerTurn={isComputerTurn}
                                winner={winner}
                                pileNumber={i}
                                selected={selected}
                                isSelected={isSelected}
                                color={color} 
                                setSelected={setSelected}
                                onDiscard={onDiscard}
                                toggleSelect={toggleSelect}
                            />
                        </div>
                    ))}
                </div>
                    <div className="flex flex-col items-center gap-1 scale-150 absolute -right-50 top-1/4">
                        <Deck
                            name="Stock"
                            deck={me.stockPile}
                            draggable={!isComputerTurn && !winner}
                            faceUp={true}
                            selected={isSelected({from: "stock"})}
                            onClick={() => toggleSelect({from: "stock"})}
                            color={color}
                        />
                        <p>Stock Pile</p>
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