import { memo, useEffect, useRef, useState } from "react";
import Tape from "./Tape";

type transitionFunctionType = Map<string, { next: string; actions: string[][] }>
type Ref<T> = React.MutableRefObject<T>

function transitionCanvas(
    canvases: Ref<string[][]>,
    setCanvases: (s: string[][]) => void,
    heads: Ref<number[]>,
    setHeads: (s: number[]) => void,
    state: Ref<string>,
    setState: (s: string) => void,
    isPlaying: Ref<Boolean>,
    memory: Ref<string[][]>,
    delay: Ref<number>,
    setNextState: (() => void) | undefined,
    index: number,
    headIndex: number,
    buffer: number,
    blank: string
) {
    return new Promise((resolve) => {
        if (memory.current[index].length === 0) {
            if(setNextState !== undefined){
                console.log("It is")
                setTimeout(() => {
                    console.log("Hey")
                    setNextState()
                    resolve(5)
                }, delay.current)
            }
            else
                resolve(5)
        }
        else if (isPlaying.current) {
            setTimeout(async () => {
                console.log(memory.current[index].toString(), heads.current.toString())
                let next = memory.current[index].shift() as string;
                console.log(memory.current[index].toString())
                console.log(headIndex, index)
                switch (next) {
                    case 'L':
                        const newLeftHeads = [...heads.current]
                        const newLeftCanvases = [...canvases.current]
                        if (index !== headIndex) break
                        if (newLeftHeads[headIndex] === buffer) {
                            newLeftCanvases[index] = [blank, ...newLeftCanvases[index]]
                            setCanvases(newLeftCanvases)
                        }
                        else
                            newLeftHeads[headIndex]--
                        setHeads(newLeftHeads)
                        break
                    case 'R':
                        const newRightHeads = [...heads.current]
                        const newRightCanvases = [...canvases.current]
                        if (index !== headIndex) break
                        if (newRightHeads[headIndex] + 1 === newRightCanvases.length - buffer) {
                            newRightCanvases[index] = [...newRightCanvases[index], blank]
                            setCanvases(newRightCanvases)
                        }
                        else
                            newRightHeads[headIndex]++
                        setHeads(newRightHeads)
                        break
                    case 'N':
                        break
                    case 'E': case blank:
                        const newBlankedCanvases = [...canvases.current]
                        newBlankedCanvases[index][heads.current[headIndex]] = blank
                        setCanvases(newBlankedCanvases)
                        break
                    default:
                        const newCanvases = [...canvases.current]
                        newCanvases[index][heads.current[headIndex]] = next
                        setCanvases(newCanvases)
                }
                resolve(transitionCanvas(
                    canvases, setCanvases, heads, setHeads, state, setState,
                    isPlaying, memory, delay, setNextState, index, headIndex, buffer, blank
                ))
            }, delay.current)
        }
        else {
            resolve(7)
        }
    })
}

async function transF(
    transFunc: transitionFunctionType,
    canvases: Ref<string[][]>,
    setCanvases: (s: string[][]) => void,
    heads: Ref<number[]>,
    setHeads: (s: number[]) => void,
    state: Ref<string>,
    setState: (s: string) => void,
    isPlaying: Ref<Boolean>,
    memory: Ref<string[][]>,
    delay: Ref<number>,
    nextState: Ref<string>,
    blank: string,
    buffer: number,
    isMultiTrack: Boolean
) {
    const headIndex = (ind: number) => isMultiTrack ? 0 : ind
    if (!isPlaying.current) {
        console.log("Nope")
    }
    else if (memory.current.some(e => e.length > 0)) {
        console.log("Continuing", memory.current.toString(), state.current, nextState.current, state.current !== nextState.current)
        Promise.all(memory.current.map((_, index) => transitionCanvas(
            canvases, setCanvases, heads, setHeads, state, setState, isPlaying, memory,
            delay, 
            (state.current !== nextState.current) ? () => {state.current = nextState.current; setState(nextState.current)} : undefined, 
            index, headIndex(index), buffer, blank
        )))
            .then((data) => {
                console.log(data)
                
            }).then(() => {
                transF(
                    transFunc, canvases, setCanvases, heads, setHeads, state, setState,
                    isPlaying, memory, delay, nextState, blank, buffer, isMultiTrack
                )
            })
    }
    else {
        let syms = canvases.current.map((e, i) => e[heads.current[headIndex(i)]])
        console.log(syms.toString(), "Starting", canvases.current.toString())
        let transition = transFunc.get(JSON.stringify([state.current, syms]))
        if (transition) {
            nextState.current = transition.next
            memory.current = canvases.current.map((_, i) => transition.actions.map(e => e[i] === undefined ? 'N' : e[i]))
            console.log(memory.current.toString(), transition, JSON.stringify([state.current, syms]))
            transF(
                transFunc, canvases, setCanvases, heads, setHeads, state, setState,
                isPlaying, memory, delay, nextState, blank, buffer, isMultiTrack
            )
        }
    }
}
interface Props {
    noOfCanvases: number;
    isMultiTape?: boolean;
    isMultiTrack?: boolean;
    transitionFunction: transitionFunctionType;
    startState: string;
    finalStates: string[];
}

const Machine = ({
    noOfCanvases,
    isMultiTape = false,
    isMultiTrack = false,
    transitionFunction,
    startState,
    finalStates,
}: Props) => {
    //const [width, setWidth] = useState(window.innerWidth)
    const [height, setHeight] = useState(window.innerHeight)
    const [input, setInput] = useState("")
    const boxWidth = 50, boxHeight = 50
    const noOfBoxes = Math.max(Math.floor(screen.width / boxWidth), input.length)
    const buffer = Math.ceil(Math.log10(noOfBoxes + 1))
    const noOfTracks = isMultiTrack && noOfCanvases
    const noOfTapes = isMultiTape && noOfCanvases
    const isPrimitive = !isMultiTape && !isMultiTrack
    const [blank, setBlank] = useState('B')
    const dummyBlanks: string[] = Array(noOfBoxes).fill(blank)
    const first = useRef([''])
    first.current = dummyBlanks.map((e, i) => i - buffer > -1 && i - buffer < input.length ? input[i - buffer] : e)
    const [state, setState] = useState(startState)
    const [isPlaying, setIsPlaying] = useState(false)

    let [canvases, setCanvases] = useState(Array(noOfCanvases).fill('').map((e, i) => i == 0 ? first.current : dummyBlanks))
    const [heads, setHeads] = useState(Array(noOfTapes).fill(0).map(() => buffer))
    let trans: number = 0

    const stateRef = useRef(state), headsRef = useRef(heads), canvasesRef = useRef(canvases),
        isPlayingRef = useRef(isPlaying), blankRef = useRef(blank), delayRef = useRef(500),
        memory = useRef([]), nextStateRef = useRef('')

    const index = (ind: number) => isMultiTape ? ind : 0

    const pausePlay = () => {
        isPlayingRef.current = !isPlayingRef.current
        setIsPlaying(isPlayingRef.current)
        console.log("Yes")
        if (isPlayingRef.current) transF(
            transitionFunction, canvasesRef, (s: string[][]) => { setCanvases(_ => s); canvasesRef.current = s },
            headsRef, (s: number[]) => { setHeads(_ => s); headsRef.current = s },
            stateRef, (s: string) => { setState(_ => s); stateRef.current = s },
            isPlayingRef, memory, delayRef, nextStateRef, blank, buffer, isMultiTrack
        )
        else console.log("no")
    }

    useEffect(() => {
        canvasesRef.current = Array(noOfCanvases).fill('').map((e, i) => i == 0 ? first.current : dummyBlanks)
        setCanvases(canvasesRef.current)
        console.log(first.current.toString(), canvases.toString(), canvasesRef.current.toString())
        stateRef.current = startState
        setState(stateRef.current)
        headsRef.current = Array(noOfTapes).fill(0).map(() => buffer)
        setHeads(headsRef.current)
    }, [input, noOfCanvases, isMultiTape, isMultiTrack, blank, startState])

    return (
        <>
            <div>
                <label htmlFor="name" className="inputs">Input:</label>
                <input id="name" type="text" name="name" className="inputs" onChange={(e) => setInput(e.currentTarget.value)} placeholder="Input" />
            </div>
            <div>
                <label htmlFor="blank" className="inputs">Blank:</label>
                <input id="blank" type="text" name="blank" className="inputs" onChange={(e) => setBlank(e.currentTarget.value)} value={blank} />
            </div>
            <div>
                <label htmlFor="delayRange" className="form-label">Delay</label>
                <input type="range" className="form-range" id="delayRange" value={delayRef.current} onChange={e => (delayRef.current = parseInt(e.currentTarget.value))} step={1} min={1} max={2000} />
            </div>
            {canvases.map((tape, ind) =>
                <Tape
                    tape={tape}
                    headPos={heads[index(ind)]}
                    state={state}
                    blank={blank}
                    isMultiTrack={isMultiTrack}
                    shouldShowHead={isMultiTape || (isMultiTrack && (ind + 1 === noOfTracks)) || isPrimitive}
                />)
            }
            <button onClick={pausePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
        </>
    );
}

export default Machine