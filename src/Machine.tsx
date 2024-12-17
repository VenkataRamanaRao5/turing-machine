import { useEffect, useRef, useState } from "react";
import Tape from "./Tape";
import transF from "./transitionFunction"

type transitionFunctionType = Map<string, { next: string; actions: string[][] }>

interface Props {
    noOfCanvases: number;
    isMultiTape?: boolean;
    isMultiTrack?: boolean;
    isHistory: { isCanvasHistory: boolean; isHeadHistory: boolean; isStateHistory: boolean; };
    transitionFunction: transitionFunctionType;
    startState: string;
    finalStates: string[];
}

const Machine = ({
    noOfCanvases,
    isMultiTape = false,
    isMultiTrack = false,
    isHistory,
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

    const stateRef = useRef(state),
            headsRef = useRef(heads), 
            canvasesRef = useRef(canvases),
            isPlayingRef = useRef(isPlaying), 
            delayRef = useRef(500),
            memory = useRef([]), 
            nextStateRef = useRef(''),
            containerRef = useRef<HTMLDivElement>(null)//, blankRef = useRef(blank)

    const index = (ind: number) => isMultiTape ? ind : 0

    const head = (isMultiTape: boolean, isPrimitive: boolean, noOfTracks: number, ind: number) => {
        if(isMultiTape || isPrimitive)  return 4
        else if(ind + 1 === noOfTracks) return 3
        else if(ind === 0)  return 1
        else return 2
    }

    let [history, setHistory] = useState<JSX.Element[][]>([canvases.map((tape, ind) =>
        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))])

    const pausePlay = () => {
        isPlayingRef.current = !isPlayingRef.current
        setIsPlaying(isPlayingRef.current)
        console.log("Yes", finalStates)
        if (isPlayingRef.current) transF(
            transitionFunction, canvasesRef, (s: string[][], shouldDuplicate: boolean) => { 
                setCanvases(_ => s); 
                canvasesRef.current = s;
                console.log(headsRef.current)
                if(isHistory.isCanvasHistory && shouldDuplicate) {
                    setHistory(hist => [...hist, s.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))
                    ])
                    containerRef.current?.scrollIntoView(false)
                }
                else
                    setHistory(hist => [...hist.slice(0, hist.length - 1), s.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))])
            },
            headsRef, (s: number[], shouldDuplicate: boolean) => { 
                setHeads(_ => s)
                headsRef.current = s 
                if (isHistory.isHeadHistory && shouldDuplicate) {
                    setHistory(hist => [...hist, canvasesRef.current.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))
                    ])
                    containerRef.current?.scrollIntoView(false)
                }
                else
                    setHistory(hist => [...hist.slice(0, hist.length - 1), canvasesRef.current.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))])
            },
            stateRef, (s: string, shouldDuplicate: boolean) => { 
                setState(_ => s)
                stateRef.current = s 
                if (isHistory.isStateHistory && shouldDuplicate) {
                    setHistory(hist => [...hist, canvasesRef.current.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))
                    ])
                    containerRef.current?.scrollIntoView(false)
                }
                else
                    setHistory(hist => [...hist.slice(0, hist.length - 1), canvasesRef.current.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))])
            },
            isPlayingRef, memory, delayRef, nextStateRef, blank, buffer, isMultiTrack
        )
        else console.log("no")
    }

    useEffect(() => {
        if(!(isHistory.isCanvasHistory || isHistory.isHeadHistory || isHistory.isStateHistory))
            setHistory(h => [h[h.length - 1]])
    }, [isHistory.isCanvasHistory, isHistory.isHeadHistory, isHistory.isStateHistory])

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
        setHistory([canvasesRef.current.map((tape, ind) =>
            tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks))])
        console.log(isHistory)
    }, [input, noOfCanvases, isMultiTape, isMultiTrack, blank, startState, transitionFunction])

    return (
        <div>
            <div id="options">
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
                    <input type="range" className="form-range" id="delayRange" onChange={e => { delayRef.current = parseInt(e.currentTarget.value); e.currentTarget.blur()}} step={1} min={1} max={2000} defaultValue={delayRef.current}/>
                </div>
                <button onClick={pausePlay}>{isPlaying ? "⏸️" : "▶️"}</button>
            </div>
            <div id="container">

                {history}
                {/* {history.map((machine, _) =>
                    machine.map((tape, ind) =>
                        tapeCreator(tape, headsRef, index, ind, stateRef, blank, isMultiTrack, head, isMultiTape, isPrimitive, noOfTracks)/>)
                    )
                } */}
            </div>
            <div id="scrollHolder" ref={containerRef}></div>
        </div>
    );
}

export default Machine

function tapeCreator(tape: string[], headsRef: React.MutableRefObject<number[]>, index: (ind: number) => number, ind: number, stateRef: React.MutableRefObject<string>, blank: string, isMultiTrack: boolean, head: (isMultiTape: boolean, isPrimitive: boolean, noOfTracks: number, ind: number) => 1 | 4 | 3 | 2, isMultiTape: boolean, isPrimitive: boolean, noOfTracks: number | boolean) {
    return <Tape
        tape={tape}
        headPos={headsRef.current[index(ind)]}
        state={stateRef.current}
        blank={blank}
        isMultiTrack={isMultiTrack}
        shouldShowHead={head(isMultiTape, isPrimitive, noOfTracks as number, ind)} />;
}
