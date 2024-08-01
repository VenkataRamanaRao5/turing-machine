import { memo, useEffect, useRef, useState } from "react";
import Tape from "./Tape";

type transitionFunctionType = Map<string, { next: string; actions: string[][] }>

interface Props {
    noOfCanvases?: number;
    isMultiTape?: boolean;
    isMultiTrack?: boolean;
    transitionFunction: transitionFunctionType;
    delay: number;
    startState: string;
    finalStates: string[];
    blank: string;
}

const Machine = memo(({
    noOfCanvases = 1,
    isMultiTape = false,
    isMultiTrack = false,
    transitionFunction,
    delay,
    startState,
    finalStates,
    blank,
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
    const dummyBlanks: string[] = Array(noOfBoxes).fill(blank)
    const first = dummyBlanks.map((e, i) => i - buffer > -1 && i - buffer < input.length ? input[i - buffer] : e)
    const [state, setState] = useState(startState)
    const [isPlaying, setIsPlaying] = useState(false)

    let [canvases, setCanvases] = useState(Array(noOfCanvases).fill('').map((e, i) => i == 0 ? first : dummyBlanks))
    const [heads, setHeads] = useState(Array(noOfTapes).fill(0).map(() => buffer))
    let trans: number = 0

    const index = (ind: number) => isMultiTape ? ind : 0

    const startTimer = (isPlaying: boolean) => trans = isPlaying ? setTimeout(transition, delay, transitionFunction) : 0
    const clearTimer = () => { if (trans) clearInterval(trans) }
    const transition = (transFunc: transitionFunctionType) => {

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
                                if(isMultiTape)
                                    setCanvases(f => f.map((e1, i) => i === ind ? [blank].concat(e1): e1))
                                else
                                    setCanvases((track) => track.map(e => [blank].concat(e)))
                            else
                                setHeads(hs => hs.map((head, index) => index === ind ? newPos : head))
                            break;
                        case 'R':
                            newPos = heads[ind] + 1
                            if (newPos + 1 === canvases[ind].length)
                                if (isMultiTape)
                                    setCanvases(f => f.map((e1, i) => i === ind ? e1.concat([blank]) : e1))
                                else
                                    setCanvases((track) => track.map(e => e.concat([blank])))
                            else
                                setHeads(hs => hs.map((head, index) => index === ind ? newPos : head))
                            break;
                        case blank: case 'E':
                            setCanvases(f => f.map((e, i1) => i1 === ind ? e.map((sym, i) => i === heads[index(ind)] ? blank : sym) : e))
                            break
                            default:
                            setCanvases(f => f.map((e, i1) => i1 === ind ? e.map((sym, i) => i === heads[index(ind)] ? trans : sym) : e))
                    }
                })
            })

            setState(transition.next)
        }
        else {
            clearTimer()
            setIsPlaying(false)
        }
    }
    console.log("Hiya")
    console.log(isPlaying)
    console.log(trans, first, input, canvases)

    /*useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth)
            setHeight(window.innerHeight)
        }

        window.addEventListener("resize", handleResize)
        console.log("Boo hooo")
        return () => window.removeEventListener("resize", handleResize)
    }, []);*/

    useEffect(() => {
        startTimer(isPlaying)
        console.log("Hoo boo")
        return () => clearTimer()
    }, [isPlaying, canvases, heads, state])

    useEffect(() => {
        setCanvases(Array(noOfCanvases).fill('').map((e, i) => i == 0 ? first : dummyBlanks))
        setState(startState)
        setHeads(Array(noOfTapes).fill(0).map(() => buffer))
    }, [input])

    return (
        <>
            <div>
                <label htmlFor="name" className="inputs">Input:</label>
                <input id="name" type="text" name="name" className="inputs" onChange={(e) => setInput(e.currentTarget.value)} placeholder="Input"/>
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
            <button onClick={() => setIsPlaying(e => !e)}>{isPlaying ? "⏸️" : "▶️"}</button>
        </>
    );
})

export default Machine