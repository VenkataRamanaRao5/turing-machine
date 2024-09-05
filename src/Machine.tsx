import { useEffect, useRef, useState } from "react";
import Tape from "./Tape";
import transF from "./transitionFunction"

type transitionFunctionType = Map<string, { next: string; actions: string[][] }>

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
    //const [height, setHeight] = useState(window.innerHeight)
    const [input, setInput] = useState("")
    const boxWidth = 50//, boxHeight = 50
    const noOfBoxes = Math.max(Math.floor(screen.width / boxWidth), input.length)
    const buffer = Math.ceil(Math.log10(noOfBoxes + 1))
    const noOfTracks = isMultiTrack && noOfCanvases
    //const noOfTapes = isMultiTape && noOfCanvases
    const isPrimitive = !isMultiTape && !isMultiTrack
    const [blank, setBlank] = useState('B')
    const dummyBlanks: string[] = Array(noOfBoxes).fill(blank)
    const first = useRef([''])
    first.current = dummyBlanks.map((e, i) => i - buffer > -1 && i - buffer < input.length ? input[i - buffer] : e)
    const [state, setState] = useState(startState)
    const [isPlaying, setIsPlaying] = useState(false)

    let [canvases, setCanvases] = useState(Array(noOfCanvases).fill('').map((_, i) => i == 0 ? first.current : dummyBlanks))
    const [heads, setHeads] = useState(Array(noOfCanvases).fill(0).map(() => buffer))
    //let trans: number = 0

    const stateRef = useRef(state), headsRef = useRef(heads), canvasesRef = useRef(canvases),
        isPlayingRef = useRef(isPlaying), delayRef = useRef(500),
        memory = useRef([]), nextStateRef = useRef('')//, blankRef = useRef(blank)

    const index = (ind: number) => isMultiTape ? ind : 0

    const head = (isMultiTape: boolean, isPrimitive: boolean, noOfTracks: number, ind: number) => {
        if(isMultiTape || isPrimitive)  return 4
        else if(ind + 1 === noOfTracks) return 3
        else if(ind === 0)  return 1
        else return 2
    }

    const pausePlay = () => {
        isPlayingRef.current = !isPlayingRef.current
        setIsPlaying(isPlayingRef.current)
        console.log("Yes", finalStates)
        if (isPlayingRef.current) transF(
            transitionFunction, canvasesRef, (s: string[][]) => { setCanvases(_ => s); canvasesRef.current = s },
            headsRef, (s: number[]) => { setHeads(_ => s); headsRef.current = s },
            stateRef, (s: string) => { setState(_ => s); stateRef.current = s },
            isPlayingRef, memory, delayRef, nextStateRef, blank, buffer, isMultiTrack
        )
        else console.log("no")
    }

    useEffect(() => {
        canvasesRef.current = Array(noOfCanvases).fill('').map((_, i) => i == 0 ? first.current : dummyBlanks)
        setCanvases(canvasesRef.current)
        console.log(first.current.toString(), canvases.toString(), transitionFunction)
        stateRef.current = startState
        setState(stateRef.current)
        headsRef.current = Array(noOfCanvases).fill(0).map(() => buffer)
        setHeads(headsRef.current)
        isPlayingRef.current = false
        setIsPlaying(false)
        memory.current = []
    }, [input, noOfCanvases, isMultiTape, isMultiTrack, blank, startState, transitionFunction])

    return (
        <div>
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
                <input type="range" className="form-range" id="delayRange" onMouseUp={e => { delayRef.current = parseInt(e.currentTarget.value); e.currentTarget.blur()}} step={1} min={1} max={2000} defaultValue={delayRef.current}/>
            </div>
            <button onClick={pausePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
            <div id="container">

            {canvases.map((tape, ind) =>
                <Tape
                tape={tape}
                headPos={heads[index(ind)]}
                state={state}
                blank={blank}
                isMultiTrack={isMultiTrack}
                shouldShowHead={head(isMultiTape, isPrimitive, noOfTracks as number, ind)}
                />)
            }
            </div>
        </div>
    );
}

export default Machine