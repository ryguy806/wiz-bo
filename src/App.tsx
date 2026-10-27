import './App.css'
import Hand from './components/Hand/Hand'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className='relative h-screen'>
      {/* Opponents Hands */}
      <div id="opponent-1" className="flex flex-row inset-0 gap-10 absolute left-0">
        <div className='rotate-90'>
          <Hand faceUp={false} cards={deck.splice(0, 5)} />
        </div>
      </div>
      <div id="opponent-2" className="flex flex-row inset-0 gap-10 absolute top-0">
        <Hand faceUp={false} cards={deck.splice(0, 5)} />
      </div>
      <div id="opponent-3" className="flex flex-row inset-0 gap-10 absolute right-0 top-10">
        <div className='-rotate-90'>
          <Hand faceUp={false} cards={deck.splice(0, 5)} />
        </div>
      </div>

      {/* Player's Hand */}
      <div id="player" className="flex flex-row inset-0 gap-10 absolute bottom-0">
        <Hand faceUp={true} cards={deck.splice(0, 5)} />
      </div>
    </div>
  )
}

export default App
