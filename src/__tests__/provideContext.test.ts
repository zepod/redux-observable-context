import {Epic, provideContext, Context} from "../index";
import {filter, mapTo} from "rxjs/operators";
import {Subject} from "rxjs";
import {StateObservable} from "redux-observable";


describe('provideContext', () => {
    const state$ = new StateObservable(new Subject(), {})
    it('should return working epic', () => {
        const action$ = new Subject();
        const input = { type: 'INPUT' }
        const output = { type: 'OUTPUT' }
        const observer = jest.fn()
        const epic: Epic = (_action$) => _action$.pipe(
            filter(({ type }) => type === 'INPUT'),
            mapTo(output)
        )
        const epicInContext = provideContext('OPEN', 'CLOSE')(epic)
        epicInContext(action$, state$, {}).subscribe(observer)
        action$.next(input)
        expect(observer).toBeCalled()
    })
    it('should provide context', () => {
        const action$ = new Subject();
        const observer = jest.fn()
        const epic: Epic = (_action$, store, dependencies) => _action$.pipe(
            filter(({ type }) => type === 'INPUT'),
            mapTo({ type: 'OUTPUT', payload: dependencies && dependencies.context && dependencies.context.name })
        )
        const epicInContext = provideContext('OPEN', 'CLOSE')(epic)
        epicInContext(action$, state$, {}).subscribe(observer)
        action$.next({ type: 'INPUT' })
        expect(observer).toBeCalledWith({ type: 'OUTPUT', payload: 'context' })
    })
    it('should provide extended context', () => {
        const action$ = new Subject();
        const observer = jest.fn()
        const epic: Epic = (_action$, store, dependencies) => _action$.pipe(
            filter(({ type }) => type === 'INPUT'),
            mapTo({ type: 'OUTPUT', payload: dependencies && dependencies.context && dependencies.context.name })
        )
        const epicInContext = provideContext('OPEN2', 'CLOSE2')(epic)
        epicInContext(action$, state$, { context: new Context(action$, 'OPEN1', 'CLOSE1', 'parent') }).subscribe(observer)
        action$.next({ type: 'INPUT' })
        expect(observer).toBeCalledWith({ type: 'OUTPUT', payload: 'parent' })
    })
    it('should preserve other dependencies', () => {
        const action$ = new Subject();
        const observer = jest.fn()
        const epic: Epic = (_action$, store, dependencies) => _action$.pipe(
            filter(({ type }) => type === 'INPUT'),
            mapTo({ type: 'OUTPUT', payload: dependencies && dependencies.other })
        )
        const epicInContext = provideContext('OPEN2', 'CLOSE2')(epic)
        epicInContext(action$, state$, { other: 'other', context: new Context(action$, 'OPEN1', 'CLOSE1', 'parent') }).subscribe(observer)
        action$.next({ type: 'INPUT' })
        expect(observer).toBeCalledWith({ type: 'OUTPUT', payload: 'other' })
    })
    it('should create new context if none to extend', () => {})
})
