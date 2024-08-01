import { useState } from 'react'
import './App.css'
import Machine from './Machine'
import Table from './Table'

function App() {
  let transitionTable = new Map([
    [JSON.stringify(['b', ['0']]), {next:'c', actions:[['X'], ['R']]}],
    [JSON.stringify(['b', ['Y']]), {next:'e', actions:[['Y'], ['R']]}],
    [JSON.stringify(['c', ['0']]), {next:'c', actions:[['0'], ['R']]}],
    [JSON.stringify(['c', ['1']]), {next:'d', actions:[['Y'], ['L']]}],
    [JSON.stringify(['c', ['Y']]), {next:'c', actions:[['Y'], ['R']]}],
    [JSON.stringify(['d', ['0']]), {next:'d', actions:[['0'], ['L']]}],
    [JSON.stringify(['d', ['X']]), {next:'b', actions:[['X'], ['R']]}],
    [JSON.stringify(['d', ['Y']]), {next:'d', actions:[['Y'], ['L']]}],
    [JSON.stringify(['e', ['Y']]), {next:'e', actions:[['Y'], ['R']]}],
    [JSON.stringify(['e', ['']]),  {next:'f', actions:[[''], ['R']]}]
  ])
  transitionTable = new Map([
    [JSON.stringify(['b', ['0', 'B']]), { next: 'b', actions: [['R']] }],
    [JSON.stringify(['b', ['1', 'B']]), { next: 'b', actions: [['R']] }],
    [JSON.stringify(['b', ['B', 'B']]), { next: 'c', actions: [['L']] }],
    [JSON.stringify(['c', ['0', 'B']]), { next: 'd', actions: [['0', '1'], ['L']] }],
    [JSON.stringify(['c', ['1', 'B']]), { next: 'e', actions: [['1', '0'], ['L']] }],
    [JSON.stringify(['e', ['1', 'B']]), { next: 'e', actions: [['1', '0'], ['L']] }],
    [JSON.stringify(['e', ['0', 'B']]), { next: 'd', actions: [['0', '1'], ['L']] }],
    [JSON.stringify(['e', ['B', 'B']]), { next: 'd', actions: [['B', '1'], ['L']] }],
    [JSON.stringify(['d', ['1', 'B']]), { next: 'd', actions: [['1', '1'], ['L']] }],
    [JSON.stringify(['d', ['0', 'B']]), { next: 'd', actions: [['0', '0'], ['L']] }],
    [JSON.stringify(['d', ['B', 'B']]), { next: 'f', actions: [['L']] }],
  ])
  const [isTable, setIsTable] = useState(true)
  return <div>
    <Machine 
      noOfCanvases={2} 
      isMultiTrack={true} 
      transitionFunction={transitionTable}
      delay={100}
      startState='b'
      finalStates={['f']}
      blank='B'
    />
    <button onClick={() => setIsTable(true)}>Use Table</button>
    <button onClick={() => setIsTable(false)}>Use Editor</button>
    <Table></Table>
  </div>
}
/*
*/
export default App
