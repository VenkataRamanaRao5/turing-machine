import { useEffect, useState } from 'react'
import './App.css'
import Machine from './Machine'
import Table from './Table'
import Editor from './Editor'

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
	let _transitionTable = new Map([
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
	const [transitionArray, setTransitionArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState( sessionStorage.getItem('transitionTable') ? JSON.parse(sessionStorage.getItem('transitionTable') as string) : [Array(4).fill('')])
	const [variablesArray, setVariablesArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState(sessionStorage.getItem('variableTable') ? JSON.parse(sessionStorage.getItem('variableTable') as string) : [Array(2).fill('')])
	const [machType, setMachType] = useState("1")
	const [canvases, setCanvases] = useState(1)
	const [tF, setTF] = useState(transitionTable)
	const handleRadioChange = (e: React.FormEvent<HTMLInputElement>) => { setMachType(e.currentTarget.value); if (e.currentTarget.value === "1") setCanvases(1)}
	const splitMultiLineDelimitedString = (s: string, delimiter: string | RegExp) => s.split('\n').map(e => e.split(delimiter))
	const replace = (e: [string, string[], string, string[][]], lhs: string, rhs: string[]) => {
		if(e[1].some(inp => inp == lhs)){
			return rhs.map(value => 
				[e[0], e[1].map(inp => inp === lhs ? value : inp),
					e[2], e[3].map(actions => actions.map(action => action === lhs ? value : action))] as [string, string[], string, string[][]]
			)
		}
		else{
			return [e]
		}
	}

	let variables: [string, string[]][] = [['', ['']]]

	useEffect(() => {
		transitionTable.clear()
		variables = variablesArray.map((elems) => [elems[0], elems[1].split(/, ?/)])
		//console.log(transitionArray)
		let newTransArray = transitionArray.map((elems) => {
			let acts = Array.from(elems[3].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(/, ?/))
			let syms = Array.from(elems[1].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(/, ?/))

			if(syms.length == 0) syms.push([])
			return [elems[0], syms[0], elems[2], acts] as [string, string[], string, string[][]]
			
		})
		console.log(newTransArray)
		variables.forEach(mapping => {
			newTransArray = newTransArray.flatMap(e => replace(e, mapping[0], mapping[1]))
		})
		newTransArray.forEach(elems => {
			transitionTable.set(
				JSON.stringify([elems[0], elems[1]]),
				{ next: elems[2], actions: elems[3] })
		})
		setTF(transitionTable)
	}, [transitionArray, variablesArray])

	//console.log(canvases, transitionTable)

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
			startState={transitionArray[0][0]}
			finalStates={['f']}
		/>
		<div>
			<button onClick={() => setIsTable(true)}>Use Table</button>
			<button onClick={() => setIsTable(false)}>Use Editor</button>
			<select defaultValue="Example Machines">
				<option value="1">Add 1</option>
				<option value="2">Spacify</option>
			</select>
		</div>
		{
			isTable ? 
			<>
				<Table
					header={['State', 'Symbol', 'Next State', 'Actions']}
					tableElems={transitionArray}
					setTableElems={(e) => {setTransitionArray(e); sessionStorage.setItem('transitionTable', JSON.stringify(e))}}
				/>
				<Table
					header={['Variable', 'Symbols']}
					tableElems={variablesArray}
					setTableElems={(e) => { setVariablesArray(e); sessionStorage.setItem('variableTable', JSON.stringify(e))} }
				/>
			</>
			: 
			<>
				<Editor 
					tableElems={transitionArray} 
					setTableElems={(s) => setTransitionArray(splitMultiLineDelimitedString(s, /; ?/))}
				/>
				<Editor 
					tableElems={variablesArray} 
					setTableElems={(s) => setVariablesArray(splitMultiLineDelimitedString(s, /, ?/))}
				/>
			</>
		}
	</div>
}
/*
*/
export default App
