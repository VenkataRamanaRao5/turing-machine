import { useEffect, useState } from 'react'
import './App.css'
import Machine from './Machine'
import Table from './Table'

function App() {
	let transitionTable = new Map([
		[JSON.stringify(['b', ['0']]), { next: 'c', actions: [['X'], ['R']] }],
		[JSON.stringify(['b', ['Y']]), { next: 'e', actions: [['Y'], ['R']] }],
		[JSON.stringify(['c', ['0']]), { next: 'c', actions: [['0'], ['R']] }],
		[JSON.stringify(['c', ['1']]), { next: 'd', actions: [['Y'], ['L']] }],
		[JSON.stringify(['c', ['Y']]), { next: 'c', actions: [['Y'], ['R']] }],
		[JSON.stringify(['d', ['0']]), { next: 'd', actions: [['0'], ['L']] }],
		[JSON.stringify(['d', ['X']]), { next: 'b', actions: [['X'], ['R']] }],
		[JSON.stringify(['d', ['Y']]), { next: 'd', actions: [['Y'], ['L']] }],
		[JSON.stringify(['e', ['Y']]), { next: 'e', actions: [['Y'], ['R']] }],
		[JSON.stringify(['e', ['']]), { next: 'f', actions: [[''], ['R']] }]
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
	const [transitionArray, setTransitionArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState((JSON.parse(sessionStorage.getItem('transitionTable') as string) || [Array(4).fill('')]) as string[][])
	const [variablesArray, setVariablesArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState([Array(2).fill('')])
	const [machType, setMachType] = useState("1")
	const [canvases, setCanvases] = useState(1)
	const [tF, setTF] = useState(transitionTable)
	const handleRadioChange = (e: React.FormEvent<HTMLInputElement>) => { setMachType(e.currentTarget.value); if (e.currentTarget.value === "1") setCanvases(1)}

	let variables: Map<string, string[]> = new Map()

	useEffect(() => {
		let aliases: string[] | undefined = []
		variables.clear()
		transitionTable.clear()
		variablesArray.forEach((elems) => variables.set(elems[0], elems[1].split(',')))
		transitionArray.forEach((elems) => {
			aliases = variables.get(elems[1])
			let acts = Array.from(elems[3].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(','))
			let syms = Array.from(elems[1].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(','))
			if(aliases){
				//to-do
			}
			else{
				transitionTable.set(
					JSON.stringify([elems[0], syms[0]]), 
					{next: elems[2], actions: acts})
			}
		})
		setTF(transitionTable)
	}, [transitionArray, variablesArray])

	console.log(canvases, transitionTable)

	return <div>
		<label className="radio-inline">
			<input type="radio" name="machineType" value="1" checked={machType === "1"} onChange={handleRadioChange} /> Primitive
		</label>
		<label className="radio-inline">
			<input type="radio" name="machineType" value="2" checked={machType === "2"} onChange={handleRadioChange} /> Multi-Tape
		</label>
		<label className="radio-inline">
			<input type="radio" name="machineType" value="3" checked={machType === "3"} onChange={handleRadioChange} /> Multi-Track
		</label>
		{(machType === "2" || machType === "3") && <div>
			<label>No. of {machType === "2" ? "tapes" : "tracks"}</label>
			<input type="number" onChange={(e) => setCanvases(parseInt(e.currentTarget.value))} value={canvases}/>
		</div>}
		<Machine
			noOfCanvases={canvases}
			isMultiTape={machType === "2"}
			isMultiTrack={machType === "3"}
			transitionFunction={tF}
			delay={1000}
			startState={transitionArray[0][0]}
			finalStates={['f']}
		/>
		<button onClick={() => setIsTable(true)}>Use Table</button>
		<button onClick={() => setIsTable(false)}>Use Editor</button>
		<Table
			header={['State', 'Symbol', 'Next State', 'Actions']}
			tableElems={transitionArray}
			setTableElems={(e) => setTransitionArray(e)}
		/>
		<Table
			header={['Variable', 'Symbols']}
			tableElems={variablesArray}
			setTableElems={(e) => setVariablesArray(e)}
		/>
	</div>
}
/*
*/
export default App
