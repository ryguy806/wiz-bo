import './App.css'
import Hand from './components/Hand/Hand'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className='relative h-screen w-screen'>
      <div id="hands" className="size-full">
        {/* Opponents Hands */}
        <div id="opponent-1" className="flex flex-row gap-10 absolute -left-30 bottom-100">
          <div className='rotate-90'>
            <Hand faceUp={false} cards={deck.splice(0, 5)} />
          </div>
        </div>
        <div id="opponent-2" className="flex flex-row gap-10 absolute top-10 left-70">
          <Hand faceUp={false} cards={deck.splice(0, 5)} />
        </div>
        <div id="opponent-3" className="flex flex-row gap-10 absolute -right-10 bottom-100">
          <div className='-rotate-90'>
            <Hand faceUp={false} cards={deck.splice(0, 5)} />
          </div>
        </div>

        {/* Player's Hand */}
        <div id="player" className="flex flex-row gap-10 absolute left-70 bottom-10">
          <Hand faceUp={true} cards={deck.splice(0, 5)} />
        </div>
      </div>
      <div className="absolute top-50 bottom-50 left-50 right-50">deck</div>
    </div>
  )
}

export default App
