import {AnyAction} from "redux";
import {Epic} from "redux-observable";
import {Observable, of} from "rxjs";
import {filter, mergeMap} from "rxjs/operators";

type ActionType = string;
type Action$ = Observable<AnyAction>;

export class Context {

    private readonly closes: ActionType[]
    private readonly opens: ActionType[]
    private readonly state: Array<AnyAction | null>
    private readonly action$: Action$
    private readonly opens$: Observable<AnyAction>
    private readonly closes$: Observable<AnyAction>
    constructor(action$: Action$, opens: ActionType | ActionType[], closes: ActionType | ActionType[]) {
        this.opens = Array.isArray(opens) ? opens : [opens]
        this.closes = Array.isArray(closes) ? closes : [closes]
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
    public extend = (open: ActionType, close: ActionType) =>
        new Context(
            this.action$,
            [...this.opens, open],
            [...this.closes, close]
        )
}
type InContext = (open: string, close: string) =>  (epic: Epic) => Epic
export const provideContext: InContext = (open, close) => epic => (action$, store, dependencies) => {
    const extendedContext = !!dependencies.context
        ? dependencies.context.extend(open, close)
        : new Context(action$, open, close);
    return epic(action$, store, { ...dependencies, context: extendedContext });
}
