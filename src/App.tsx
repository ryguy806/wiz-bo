import './App.css'
import Hand from './components/Hand/Hand'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className="flex flex-row gap-10">
      <Hand faceUp={true} cards={deck.splice(0, 5)} />
    </div>
  )
}

export default App
