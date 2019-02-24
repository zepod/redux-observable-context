import {AnyAction} from "redux";
import {ActionsObservable, StateObservable} from "redux-observable";
import {Observable, of, Subject} from "rxjs";
import {filter, mergeMap} from "rxjs/operators";

export type Action$ = ActionsObservable<any> | Subject<any>
type ActionType = string;
type ActionTypes = ActionType | ActionType[];
interface InterfaceDependencies {
    [x: string]: any
}
export type Epic = (action$: Action$, store: StateObservable<any>, dependencies: InterfaceDependencies) => Action$ | Observable<any>
type InContext = (open: ActionTypes, close: ActionTypes) =>  (epic: Epic) => Epic

const inArray = (maybeArray: any): any[] => Array.isArray(maybeArray) ? maybeArray : [maybeArray]

export class Context {
    public readonly name: string

    private readonly closes: ActionTypes
    private readonly opens: ActionTypes
    private readonly state: Array<AnyAction | null>
    private readonly action$: Action$
    private readonly opens$: Observable<AnyAction>
    private readonly closes$: Observable<AnyAction>
    constructor(action$: Action$, opens: ActionTypes, closes: ActionTypes, name: string | void) {
        this.name = name || 'context'
        this.opens = inArray(opens)
        this.closes = inArray(closes)
        this.state = Array(this.opens.length).fill(null);
        this.action$ = action$
        this.opens$ = this.action$.pipe(filter(({ type }) => this.opens.includes(type)))
        this.closes$ = this.action$.pipe(filter(({ type }) => this.closes.includes(type)))
        this.opens$.subscribe(({ type, ...rest }: AnyAction) => {
            const index = this.opens.indexOf(type)
            this.state[index] = { type, ...rest }
        })
        this.closes$.subscribe(({ type }: AnyAction) => {
            const index = this.closes.indexOf(type)
            this.state[index] = null
        })
    }

    public onOpen = () => this.opens$.pipe(
        filter(() => this.state.reduce(
            (valid: boolean, maybeActionType: AnyAction | null) =>
                valid && maybeActionType !== null , true
            )
        )
    )

    public onClose = (): Observable<AnyAction> => this.closes$

    public getData = (actionType: ActionType): Observable<AnyAction | null> => {
        if (!this.opens.includes(actionType)) {
            throw new ReferenceError('You are awaiting data that is not in context')
        }
        const maybeData = this.state.find(maybeAction =>
            maybeAction !== null && maybeAction.type === actionType) || null;
        return of(maybeData).pipe(filter(data => data !== null))
    }

    public awaitData = (actionType: ActionType): Observable<any> => {
        if (!this.opens.includes(actionType)) {
            throw new Error('You are awaiting data that is not in context')
        }
        const maybeData = this.state.find(maybeAction =>
            maybeAction !== null && maybeAction.type === actionType);

        return maybeData
            ? of(maybeData)
            : this.onOpen().pipe(mergeMap(() => this.getData(actionType)))
    }
    public extend = (open: ActionTypes, close: ActionTypes) =>
        new Context(
            this.action$,
            [...inArray(this.opens), open],
            [...inArray(this.closes), close],
            this.name,
        )
}

export const provideContext: InContext = (open, close) => epic => (action$, store, dependencies) => {
    const extendedContext = !!dependencies.context
        ? dependencies.context.extend(open, close)
        : new Context(action$, open, close);
    return epic(action$, store, { ...dependencies, context: extendedContext });
}
