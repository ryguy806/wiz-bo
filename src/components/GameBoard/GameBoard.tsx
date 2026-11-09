import { useState } from "react"
import type { Card, CardSource, GameState } from "../../helpers/types"
import { canPassTurn, getSourceCard, validatePlay } from "../../helpers/gameStateHelper"
import Deck from "../Deck/Deck"
import BuildingPiles from "../Deck/BuildingPiles"
import Hand from "../Hand/Hand"
import OpponentArea from "../Players/OpponentsArea"

type GameBoardProps = {
    gameState: GameState
    onPlayCard: (source: CardSource, buildingIndex: number) => void
    onDiscard: (cardId: string, discardIndex: number) => void
    onPassTurn: () => void
    onNewGame: () => void
}

const GameBoard = ({gameState, onPlayCard, onDiscard, onPassTurn, onNewGame}: GameBoardProps) => {
    const {players, currentPlayer, drawPile, buildingPiles, completedPile, winner} = gameState
    const [selected, setSelected] = useState<CardSource | null>(null)

    const active = players[currentPlayer]
    const isComputerTurn = active.isComputer
    const opponents = players.filter((_, i) => i !== currentPlayer)
    const selectedCard: Card | undefined = selected ? getSourceCard(active, selected) : undefined

    const isSelected = (source: CardSource) => {
        if (!selected || selected.from !== source.from) return false
        if (source.from === "hand" && selected.from === "hand") return source.cardId === selected.cardId
        if (source.from === "discard" && selected.from === "discard") return source.pile === selected.pile
        return true
    }

    // Clicking the already-selected card puts it back down
    const toggleSelect = (source: CardSource) => {
        if (isComputerTurn) return
        setSelected(isSelected(source) ? null : source)
    }

    const handleBuildingClick = (index: number) => {
        if (!selected || winner || isComputerTurn) return
        onPlayCard(selected, index)
        setSelected(null)
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

    let instruction = "Select a card to play or discard."
    if (selectedCard) {
        instruction = selected?.from === "hand"
            ? "Click a building pile to play it, or one of your discard piles to discard it and end your turn."
            : "Click a building pile to play it."
    }

    return (
        <div className="flex min-h-screen flex-col gap-6 p-4 text-white">
            <header className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Wiz-Bo</h1>
                <button
                    type="button"
                    onClick={onNewGame}
                    className="rounded bg-white/20 px-3 py-1 hover:bg-white/30"
                >
                    New game
                </button>
            </header>

            {opponents.length > 0 && (
                <section className="flex flex-wrap justify-center gap-4">
                    {opponents.map((player) => <OpponentArea key={player.id} player={player} />)}
                </section>
            )}

            <section className="flex flex-wrap items-start justify-center gap-10">
                <div className="flex flex-col items-center gap-3">
                    <Deck name="Draw pile" deck={drawPile} faceUp={false} />
                    <span className="text-xs text-white/70">Draw pile</span>
                </div>
                <div className="flex flex-wrap items-start justify-center gap-6">
                    {buildingPiles.map((pile, i) => (
                        <BuildingPiles
                            key={i}
                            name={`Build ${i + 1}`}
                            cards={pile}
                            onClick={() => handleBuildingClick(i)}
                            highlight={!!selectedCard && validatePlay(selectedCard, pile)}
                        />
                    ))}
                </div>
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-32 w-24 items-center justify-center rounded border-2 border-dashed border-white/40 text-center text-sm text-white/60">
                        {completedPile.length} completed
                    </div>
                    <span className="text-xs text-white/70">Completed</span>
                </div>
            </section>

            <section className="mt-auto flex flex-col items-center gap-4 rounded-lg bg-black/30 p-4">
                <h2 className="text-xl font-semibold">
                    {active.name}'s turn{isComputerTurn && " (thinking...)"}
                </h2>
                {!isComputerTurn && <p className="text-sm text-white/80">{instruction}</p>}

                <div className="flex flex-wrap items-start justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <Deck
                            name="Stock"
                            deck={active.stockPile}
                            faceUp={true}
                            selected={isSelected({from: "stock"})}
                            onClick={() => toggleSelect({from: "stock"})}
                        />
                        <span className="text-xs text-white/70">Stock ({active.stockPile.length} left)</span>
                    </div>

                    {active.discardPiles.map((pile, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <Deck
                                name={`Discard ${i + 1}`}
                                deck={pile}
                                faceUp={true}
                                selected={isSelected({from: "discard", pile: i})}
                                highlight={selected?.from === "hand"}
                                onClick={() => handleDiscardClick(i)}
                            />
                            <span className="text-xs text-white/70">Discard {i + 1}</span>
                        </div>
                    ))}
                </div>

                <Hand
                    faceUp={!isComputerTurn}
                    cards={active.hand}
                    selectedId={selected?.from === "hand" ? selected.cardId : null}
                    onSelect={(card) => toggleSelect({from: "hand", cardId: card.id})}
                />

                {!isComputerTurn && canPassTurn(gameState) && (
                    <button
                        type="button"
                        onClick={() => { setSelected(null); onPassTurn() }}
                        className="rounded bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400"
                    >
                        No cards left in hand: pass turn
                    </button>
                )}
            </section>

            {winner && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70">
                    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 text-black!">
                        <h2 className="text-3xl font-bold">{winner} wins!</h2>
                        <p>They emptied their stock pile first.</p>
                        <button
                            type="button"
                            onClick={onNewGame}
                            className="rounded bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-600"
                        >
                            Play again
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GameBoard