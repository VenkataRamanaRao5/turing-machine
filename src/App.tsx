import { useEffect, useState } from 'react'
import './App.css'
import Machine from './Machine'
import Table from './Table'
import Editor from './Editor'
import examples from './assets/exampleMachines'

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

	let tS = [
		["b", "0", "c", "X,R"],
		["b", "Y", "e", "Y,R"],
		["c", "0", "c", "0,R"],
		["c", "1", "d", "Y,L"],
		["c", "Y", "c", "Y,R"],
		["d", "0", "d", "0,L"],
		["d", "X", "b", "X,R"],
		["d", "Y", "d", "Y,L"],
		["e", "Y", "e", "Y,R"],
		["e", "B", "f", "B,R"]
	]

	const [isTable, setIsTable] = useState(true)
	const [transitionArray, setTransitionArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState(sessionStorage.getItem('transitionTable') ? JSON.parse(sessionStorage.getItem('transitionTable') as string) : tS)
	const [variablesArray, setVariablesArray]: [string[][], React.Dispatch<React.SetStateAction<string[][]>>] = useState(sessionStorage.getItem('variableTable') ? JSON.parse(sessionStorage.getItem('variableTable') as string) : [Array(2).fill('')])
	const [machType, setMachType] = useState("1")
	const [canvases, setCanvases] = useState(1)
	const [tF, setTF] = useState(transitionTable)
	const [isHistory, setIsHistory] = useState(false)
	const [historyStates, setHistoryStates] = useState({
		isCanvasHistory: false,
		isHeadHistory: false,
		isStateHistory: false,
	})

	const handleToggle = (key: keyof typeof historyStates) => {
		setHistoryStates((prevStates) => ({
			...prevStates,
			[key]: !prevStates[key],
		}));
	};

	const toggleHistory = () => {
		setIsHistory((h) => {
			const newHistoryState = !h;
			setHistoryStates({
				isCanvasHistory: newHistoryState,
				isHeadHistory: newHistoryState,
				isStateHistory: newHistoryState,
			});
			return newHistoryState;
		});
	};

	const historyKeys = Object.keys(historyStates);

	const handleRadioChange = (e: React.FormEvent<HTMLInputElement>) => { setMachType(e.currentTarget.value); if (e.currentTarget.value === "1") setCanvases(1) }
	const splitMultiLineDelimitedString = (s: string, delimiter: string | RegExp) => s.split('\n').map(e => e.split(delimiter).map(f => f.trim()))
	const replace = (e: [string, string[], string, string[][]], lhs: string, rhs: string[]) => {
		if (e[1].some(inp => inp == lhs)) {
			return rhs.map(value =>
				[e[0], e[1].map(inp => inp === lhs ? value : inp),
				e[2], e[3].map(actions => actions.map(action => action === lhs ? value : action))] as [string, string[], string, string[][]]
			)
		}
		else {
			return [e]
		}
	}

	let variables: [string, string[]][] = [['', ['']]]

	useEffect(() => {
		transitionTable.clear()
		variables = variablesArray.map((elems) => [elems[0], elems[1].split(/, ?/)])
		console.log(transitionArray)
		let newTransArray = transitionArray.map((elems) => {
			let acts = Array.from(elems[3].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(/, ?/))
			let syms = Array.from(elems[1].matchAll(/\[([^\]]*)\]|([^,\s]+)/g)).map((e) => e[1] ? e[1] : e[0]).map(e => e.split(/, ?/))

			if (syms.length == 0) syms.push([])
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
		console.log(transitionTable)
		setTF(transitionTable)
	}, [transitionArray, variablesArray])
	//console.log(Array.from(examples.keys()))
	//console.log(canvases, transitionTable)

	return <div>
		<div id="machineType">
			{['1', '2', '3'].map(type => (
				<label key={type} className="radio-inline">
					<input
						type="radio"
						name="machineType"
						value={type}
						checked={machType === type}
						onChange={handleRadioChange}
					/>
					{type === '1' ? 'Primitive' : type === '2' ? 'Multi-Tape' : 'Multi-Track'}
				</label>
			))}
			{(machType === "2" || machType === "3") && <div>
				<label className='inputs'>No. of {machType === "2" ? "tapes" : "tracks"}: </label>
				<input className='inputs' type="number" onChange={(e) => setCanvases(parseInt(e.currentTarget.value) || 1)} onBlur={(e) => e.currentTarget.value = canvases.toString()} min="1" />
			</div>}
		</div>
		<button id="historyButton" onClick={toggleHistory}>Set history {isHistory ? "Off" : "On"}</button>

		<div id="historyType" className="justify-content-center align-items-center">
			{isHistory && historyKeys.map(key => (
				<div key={key} className="form-check form-switch">
					<input
						className="form-check-input"
						type="checkbox"
						id={key}
						checked={historyStates[key as keyof typeof historyStates]}
						onChange={() => handleToggle(key as keyof typeof historyStates)}
					/>
					<label htmlFor={key}>{key}</label>
				</div>
			))}
		</div>

		<Machine
			noOfCanvases={canvases}
			isMultiTape={machType === "2"}
			isMultiTrack={machType === "3"}
			isHistory={historyStates}
			transitionFunction={tF}
			startState={transitionArray[0][0]}
			finalStates={['f']}
		/>

		<div>
			<button onClick={() => setIsTable(true)}>Use Table</button>
			<button onClick={() => setIsTable(false)}>Use Editor</button>
			<select defaultValue="0^n1^n" onChange={(e) => {
				console.log(e.currentTarget.value)
				let mach = examples.get(e.currentTarget.value)
				if (mach) {
					setMachType(mach.machType.toString())
					setCanvases(mach.noOfCanvases)
					setTransitionArray(mach.transitions.split(/\n */).map(row => row.trim().split(/; */)))
					setVariablesArray(mach.varibles.split(/\n */).map(row => row.trim().split(/; */)))
					console.log(mach.transitions.split(/\n */).map(row => row.trim().split(/; */)).toString())
				}

			}}>
				{Array.from(examples.keys()).map(key => <option value={key}>{key}</option>)}
			</select>
		</div>
		{
			isTable ?
				<>
					<Table
						header={['State', 'Symbol', 'Next State', 'Actions']}
						tableElems={transitionArray}
						setTableElems={(e) => { setTransitionArray(e); sessionStorage.setItem('transitionTable', JSON.stringify(e)) }}
					/>
					<Table
						header={['Variable', 'Symbols']}
						tableElems={variablesArray}
						setTableElems={(e) => { setVariablesArray(e); sessionStorage.setItem('variableTable', JSON.stringify(e)) }}
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
