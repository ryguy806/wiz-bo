import { useState } from "react"
import type { Card, CardSource, GameState, Player } from "../../helpers/types"
import { getSourceCard, validatePlay } from "../../helpers/gameStateHelper"
import Deck from "../Deck/Deck"
import BuildingPiles from "../Deck/BuildingPiles"
import Hand from "../Hand/Hand"
import SparkleEffect from "../MagicEffects/SparkleEffect"
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent
} from '@dnd-kit/core'
import CardItem from "../Card/CardItem"
import Menu from "../Layout/Menu"

type GameBoardProps = {
    gameState: GameState
    onPlayCard: (source: CardSource, buildingIndex: number) => void
    onDiscard: (cardId: string, discardIndex: number) => void
    onPassTurn: () => void
    onNewGame: () => void
}

type Side = "top" | "left" | "right"

// Opponent seats are laid out at normal size, then shrunk and rotated to hug an edge.
// SEAT_SCALE shrinks the cards; SEAT_THICKNESS is how far the seat reaches in from the edge.
const SEAT_SCALE = 0.6
const SEAT_THICKNESS = "9rem"
const SEAT_ROTATION: Record<Side, number> = {top: 180, left: 90, right: -90}

const noop = () => {}

type EdgeSeatProps = {
    player: Player
    side: Side
    isTurn: boolean
}

const EdgeSeat = ({player, side, isTurn}: EdgeSeatProps) => {
    const vertical = side !== "top"

    // The wrapper is the box the seat occupies on screen. Rotating with CSS doesn't change
    // layout size, so the inner box gets its length/thickness swapped (via container units)
    // for the sideways seats, then is rotated and scaled to fill the wrapper exactly.
    const wrapperStyle: React.CSSProperties = vertical
        ? {containerType: "size", width: SEAT_THICKNESS, height: "100%"}
        : {containerType: "size", height: SEAT_THICKNESS, width: "min(100%, 48rem)"}

    const innerStyle: React.CSSProperties = {
        width: `calc(${vertical ? "100cqh" : "100cqw"} / ${SEAT_SCALE})`,
        height: `calc(${vertical ? "100cqw" : "100cqh"} / ${SEAT_SCALE})`,
        transform: `translate(-50%, -50%) rotate(${SEAT_ROTATION[side]}deg) scale(${SEAT_SCALE})`,
    }

    return (
        <div className="relative" style={wrapperStyle}>
            <div
                className={`absolute top-1/2 left-1/2 flex flex-col items-center justify-center gap-2 rounded-lg p-2 ${
                    isTurn ? "bg-black/40 ring-4 ring-amber-300" : "bg-black/20"
                }`}
                style={innerStyle}
            >
                <span className="text-base font-semibold">
                    {player.name} · stock {player.stockPile.length}
                </span>

                <div className="flex items-start justify-center gap-3">
                    <Deck name="Stock" deck={player.stockPile} faceUp={true} draggable={false} />
                    {player.discardPiles.map((pile, i) => (
                        <Deck key={i} name={`Discard ${i + 1}`} deck={pile} faceUp={true} draggable={false} />
                    ))}
                </div>

                {/* Last child, so after rotation the hand sits against the screen edge */}
                <Hand
                    faceUp={false}
                    cards={player.hand}
                    selectedId={null}
                    onSelect={noop}
                    dragDisabled
                />
            </div>
        </div>
    )
}

const GameBoard = ({gameState, onPlayCard, onDiscard, onNewGame}: GameBoardProps) => {
    const {players, currentPlayer, drawPile, buildingPiles, completedPile, winner} = gameState
    const [selected, setSelected] = useState<CardSource | null>(null)
    const [draggingCard, setDraggingCard] = useState<Card | null>(null)

    const sensors = useSensors(useSensor(PointerSensor, {activationConstraint: {distance: 8}}))

    const active = players[currentPlayer]
    const isComputerTurn = active.isComputer
    const selectedCard: Card | undefined = selected ? getSourceCard(active, selected) : undefined

    // "Me" is the human player, so my area stays on screen during computer turns
    const me: Player = isComputerTurn ? (players.find((p) => !p.isComputer) ?? active) : active
    const myIndex = players.findIndex((p) => p.id === me.id)

    // Opponents in turn order, starting with whoever plays right after me
    const opponents = [...players.slice(myIndex + 1), ...players.slice(0, myIndex)]

    const seats: {left?: Player, top?: Player, right?: Player} =
        opponents.length === 1 ? {top: opponents[0]}
        : opponents.length === 2 ? {left: opponents[0], right: opponents[1]}
        : {left: opponents[0], top: opponents[1], right: opponents[2]}

    const isSelected = (source: CardSource) => {
        if (!selected || selected.from !== source.from) return false
        if (source.from === "hand" && selected.from === "hand") return source.cardId === selected.cardId
        if (source.from === "discard" && selected.from === "discard") return source.pile === selected.pile
        return true
    }

    // Clicking the already-selected card puts it back down. Ignored on the computer's turn
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

    const findDragSource = (cardId: string): CardSource | null => {
        if (active.hand.some((c) => c.id === cardId)) return {from: "hand", cardId}
        const pile = active.discardPiles.findIndex((p) => p[p.length - 1]?.id === cardId)
        if (pile >= 0) return {from: "discard", pile}
        const stockTop = active.stockPile[active.stockPile.length - 1]
        return stockTop?.id === cardId ? {from: "stock"} : null
    }

    const handleDragStart = (event: DragStartEvent) => {
        if (winner || isComputerTurn) return
        const source = findDragSource(String(event.active.id))
        const card = source ? getSourceCard(active, source) : undefined
        if (!source || !card) return

        setSelected(source)
        setDraggingCard(card)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const cardId = String(event.active.id)
        const overId = event.over ? String(event.over.id) : null

        setSelected(null)
        setDraggingCard(null)

        if (!overId || winner || isComputerTurn) return
        const source = findDragSource(cardId)

        if (!source) return
        if (overId.startsWith("build-")) {
            onPlayCard(source, Number(overId.slice("build-".length)))
        } else if (overId.startsWith("discard-") && source.from === "hand") {
            onDiscard(cardId, Number(overId.slice("discard-".length)))
        }
    }

    const handleDragCancel = () => {
        setDraggingCard(null)
        setSelected(null)
    }

    let instruction = "Select a card to play or discard."
    if (selectedCard) {
        instruction = selected?.from === "hand"
            ? "Click a building pile to play it, or one of your discard piles to discard it and end your turn."
            : "Click a building pile to play it."
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
        {/* Fixed to the viewport so nothing ever scrolls */}
        <div className="relative grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] gap-2 overflow-hidden p-2 text-white">
            <header className="absolute top-3 right-3 z-10">
                <Menu onNewGame={onNewGame}/>
            </header>

            {/* Top edge */}
            <div className="flex justify-center">
                {seats.top && <EdgeSeat player={seats.top} side="top" isTurn={seats.top.id === active.id} />}
            </div>

            {/* Left edge | table | right edge */}
            <div className="grid min-h-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-1 gap-2">
                {seats.left
                    ? <EdgeSeat player={seats.left} side="left" isTurn={seats.left.id === active.id} />
                    : <div />}

                <section className="flex flex-wrap content-center items-start justify-center gap-5">
                    <div className="flex flex-col items-center gap-1">
                        <Deck name="Draw pile" deck={drawPile} faceUp={false} />
                        <span className="text-xs text-white/70">Draw pile</span>
                    </div>
                    <div className="flex flex-wrap items-start justify-center gap-6">
                        {buildingPiles.map((pile, i) => (
                            <BuildingPiles
                                key={i}
                                name={`Build ${i + 1}`}
                                dropId={`build-${i}`}
                                cards={pile}
                                onClick={() => handleBuildingClick(i)}
                                highlight={!isComputerTurn && !!selectedCard && validatePlay(selectedCard, pile)}
                            />
                        ))}
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex h-24 w-18 items-center justify-center rounded border-2 border-dashed border-white/40 text-center text-sm text-white/60">
                            {completedPile.length} completed
                        </div>
                        <span className="text-xs text-white/70">Completed</span>
                    </div>
                </section>

                {seats.right
                    ? <EdgeSeat player={seats.right} side="right" isTurn={seats.right.id === active.id} />
                    : <div />}
            </div>

            {/* My area: bottom edge */}
            <section className="flex flex-col items-center gap-1 rounded-lg bg-black/30 p-1">
                <h2 className="text-base font-semibold">
                    {active.name}'s turn{isComputerTurn && " (thinking...)"}
                </h2>
                {!isComputerTurn && <p className="text-sm text-white/80">{instruction}</p>}

                <div className="flex flex-wrap items-start justify-center gap-6">
                    <div className="flex flex-col items-center gap-1">
                        <Deck
                            name="Stock"
                            deck={me.stockPile}
                            draggable={!isComputerTurn && !winner}
                            faceUp={true}
                            selected={isSelected({from: "stock"})}
                            onClick={() => toggleSelect({from: "stock"})}
                        />
                        <span className="text-xs text-white/70">Stock ({me.stockPile.length} left)</span>
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
                            />
                            <span className="text-xs text-white/70">Discard {i + 1}</span>
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
            </section>

            {winner && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/70">
                    <SparkleEffect />
                    <div className="flex flex-col items-center gap-2 rounded-lg bg-white p-8 text-black">
                        <h2 className="text-3xl font-bold text-black!">{winner} wins!</h2>
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

            <DragOverlay>
                {draggingCard && (
                    <div className="rotate-3 cursor-grabbing">
                        <CardItem card={{...draggingCard, id: `${draggingCard.id}-drag`}} faceUp={true} />
                    </div>
                )}
            </DragOverlay>
        </div>
        </DndContext>
    )
}

export default GameBoard