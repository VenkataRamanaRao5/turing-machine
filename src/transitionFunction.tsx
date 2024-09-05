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
    buffer: number,
    blank: string
) {
    return new Promise((resolve) => {
        if (memory.current[index].length === 0) {
            if (setNextState !== undefined) {
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
        else if(isPlaying.current){
            setTimeout(async () => {
                if (isPlaying.current) {
                    console.log(memory.current[index].toString(), heads.current.toString())
                    let next = memory.current[index].shift() as string;
                    console.log(memory.current[index].toString())
                    console.log(index)
                    switch (next) {
                        case 'L':
                            const newLeftHeads = [...heads.current]
                            const newLeftCanvases = [...canvases.current]
                            if (newLeftHeads[index] === buffer) {
                                newLeftCanvases[index] = [blank, ...newLeftCanvases[index]]
                                setCanvases(newLeftCanvases)
                            }
                            else
                                newLeftHeads[index]--
                            setHeads(newLeftHeads)
                            break
                        case 'R':
                            const newRightHeads = [...heads.current]
                            const newRightCanvases = [...canvases.current]
                            if (newRightHeads[index] + 1 === newRightCanvases[index].length - buffer) {
                                newRightCanvases[index] = [...newRightCanvases[index], blank]
                                setCanvases(newRightCanvases)
                            }
                            else
                                newRightHeads[index]++
                            setHeads(newRightHeads)
                            break
                        case 'N':
                            break
                        case 'E': case blank:
                            const newBlankedCanvases = [...canvases.current]
                            newBlankedCanvases[index][heads.current[index]] = blank
                            setCanvases(newBlankedCanvases)
                            break
                        default:
                            const newCanvases = [...canvases.current]
                            newCanvases[index][heads.current[index]] = next
                            setCanvases(newCanvases)
                    }
                    resolve(transitionCanvas(
                        canvases, setCanvases, heads, setHeads, state, setState,
                        isPlaying, memory, delay, setNextState, index, buffer, blank
                    ))
                }
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
    if (!isPlaying.current) {
        console.log("Nope")
    }
    else if (memory.current.some(e => e.length > 0)) {
        console.log("Continuing", memory.current.toString(), state.current, nextState.current, state.current !== nextState.current)
        Promise.all(memory.current.map((_, index) => transitionCanvas(
            canvases, setCanvases, heads, setHeads, state, setState, isPlaying, memory,
            delay,
            (state.current !== nextState.current) ? () => { state.current = nextState.current; setState(nextState.current) } : undefined,
            index, buffer, blank
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
        let syms = canvases.current.map((e, i) => e[heads.current[i]])
        console.log(heads.current.toString(), "l", syms.toString(), "Starting", canvases.current.toString())
        let transition = transFunc.get(JSON.stringify([state.current, syms]))
        if (transition) {
            nextState.current = transition.next
            memory.current = canvases.current.map((_, i) => transition.actions.map(e => e[i] === undefined ? e[0] : e[i]))
            console.log(memory.current.toString(), transition, JSON.stringify([state.current, syms]))
            transF(
                transFunc, canvases, setCanvases, heads, setHeads, state, setState,
                isPlaying, memory, delay, nextState, blank, buffer, isMultiTrack
            )
        }
    }
}

export default transF