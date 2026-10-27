import './App.css'
import CardItem from './components/Card/CardItem'
import { createDeck } from "./helpers/gameStateHelper"

function App() {

  const deck = createDeck()

  return (
    <div className="flex flex-row gap-10">
      { deck.map((card) => (
        <div key={card.id}>
          <CardItem value={card.value} id={card.id} />
        </div>
      )) }
    </div>
  )
}

export default App
