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
    index: number,
    headIndex: number,
    buffer: number,
    blank: string
) {
    return new Promise((resolve) => {
        if (memory.current[index].length === 0) {
            console.log("Hey")
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
                        if (index !== headIndex) break
                        if (heads.current[headIndex] === buffer)
                            canvases.current[index] = [blank].concat(canvases.current[index])
                        else
                            heads.current[headIndex]--
                        setHeads(heads.current)
                        break
                    case 'R':
                        if (index !== headIndex) break
                        if (heads.current[headIndex] + 1 === canvases.current.length - buffer)
                            canvases.current[index] = canvases.current[index].concat([blank])
                        else
                            heads.current[headIndex]++
                        setHeads(heads.current)
                        break
                    case 'N':
                        break
                    case 'E': case blank:
                        canvases.current[index][heads.current[headIndex]] = blank
                        setCanvases(canvases.current)
                        break
                    default:
                        canvases.current[index][heads.current[headIndex]] = next
                        setCanvases(canvases.current)
                }
                resolve(transitionCanvas(
                    canvases, setCanvases, heads, setHeads, state, setState,
                    isPlaying, memory, delay, index, headIndex, buffer, blank
                ))
            }, delay.current)
        }
        else{
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
    if(!isPlaying.current){
        console.log("Nope")
    }
    else if (memory.current.some(e => e.length > 0)){
        console.log("Continuing", memory.current.toString())
        Promise.all(memory.current.map((_, index) => transitionCanvas(
            canvases, setCanvases, heads, setHeads, state, setState, isPlaying, memory,
            delay, index, headIndex(index), buffer, blank
        )))
        .then((data) => {
            console.log(data)
            state.current = nextState.current
            setState(state.current)
        }).then(() => {
            transF(
                transFunc, canvases, setCanvases, heads, setHeads, state, setState,
                isPlaying, memory, delay, nextState, blank, buffer, isMultiTrack
            )
        })
    }
    else{
        console.log("Starting", memory.current.toString())
        let syms = canvases.current.map((e, i) => e[heads.current[headIndex(i)]])
        let transition = transFunc.get(JSON.stringify([state.current, syms]))
        if(transition){
            nextState.current = transition.next
            memory.current = canvases.current.map((_, i) => transition.actions.map(e => e[i]))
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
    delay: number;
    startState: string;
    finalStates: string[];
}

const Machine = ({
    noOfCanvases,
    isMultiTape = false,
    isMultiTrack = false,
    transitionFunction,
    delay,
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
        isPlayingRef = useRef(isPlaying), blankRef = useRef(blank), delayRef = useRef(delay), 
        memory = useRef([]), nextStateRef = useRef('')
    
    const index = (ind: number) => isMultiTape ? ind : 0

    const startTimer = (isPlaying: boolean) => trans = isPlaying ? setTimeout(transF, delay, transitionFunction) : 0
    const clearTimer = () => { if (trans) clearInterval(trans) }


    /*const transition = (transFunc: transitionFunctionType) => {
        console.log("Goooo")
        let symbols = isMultiTape ? heads.map((pos, tpind) => canvases[tpind][pos]) : canvases.map((track) => track[heads[0]])
        let key = JSON.stringify([state, symbols])
        let transition = transFunc.get(key)
        let newPos: number
        console.log(transition, key, state, heads)
        if (transition) {
            transition.actions.forEach((action) => {
                action.forEach((trans, ind) => {
                    switch (trans) {
                        case 'L':
                            newPos = heads[ind] - 1
                            if (newPos === 1)
                                if (isMultiTape)
                                    setCanvases(f => f.map((e1, i) => i === ind ? [blank].concat(e1) : e1))
                                else
                                    setCanvases((track) => track.map(e => [blank].concat(e)))
                            else
                                setHeads(hs => hs.map((head, index) => index === ind ? head - 1 : head))
                            break;
                        case 'R':
                            newPos = heads[ind] + 1
                            if (newPos + 1 === canvases[ind].length)
                                if (isMultiTape)
                                    setCanvases(f => f.map((e1, i) => i === ind ? e1.concat([blank]) : e1))
                                else
                                    setCanvases((track) => track.map(e => e.concat([blank])))
                            else
                                setHeads(hs => hs.map((head, index) => index === ind ? head + 1 : head))
                            break;
                        case blank: case 'E':
                            setCanvases(f => f.map((e, i1) => i1 === ind ? e.map((sym, i) => i === heads[index(ind)] ? blank : sym) : e))
                            break
                        case 'N':
                            break
                        default:
                            setCanvases(f => f.map((e, i1) => i1 === ind ? e.map((sym, i) => i === heads[index(ind)] ? trans : sym) : e))
                    }
                    console.log(heads[0])
                })
            })

            setState(transition.next)
        }
        else {
            clearTimer()
            setIsPlaying(false)
        }
    }*/
    
    /*console.log("Hiya")
    console.log(isPlaying)
    console.log(trans, transitionFunction, input, noOfCanvases, canvases, startState)*/

    /*useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
            setHeight(window.innerHeight)
        }

        window.addEventListener("resize", handleResize)
        console.log("Boo hooo")
        return () => window.removeEventListener("resize", handleResize)
    }, []);*/

    const pausePlay = () => {
        isPlayingRef.current = !isPlayingRef.current
        setIsPlaying(isPlayingRef.current)
        console.log("Yes")
        if(isPlayingRef.current)   transF(
            transitionFunction, canvasesRef, (s: string[][]) => {let boo = s;setCanvases(_=>boo)},
            headsRef, (s: number[]) => {let boo = s; setHeads(_=>boo)}, 
            stateRef, (s: string) => {let boo = s;setState(_=>boo)},
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