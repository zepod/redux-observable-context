import { Context } from '../index';
import {Subject} from "rxjs";
import {Action} from "redux";

describe('onOpen', () => {
    const action$: Subject<Action> = new Subject()
    let singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
    let multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    beforeEach(() => {
        singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
        multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    })
    test('should NOT TRIGGER "onOpen", if NO OPENER was dispatched', () => {
        const observer = jest.fn()
        singleContext.onOpen().subscribe(observer)
        expect(observer).not.toBeCalled();
    })
    test('should TRIGGER "onOpen", if A OPENER was dispatched', () => {
        const observer = jest.fn()
        singleContext.onOpen().subscribe(observer)
        action$.next({ type: 'OPEN1' })
        expect(observer).toBeCalled();
    })
    test('should NOT TRIGGER "onOpen", if NOT EVERY OPENER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onOpen().subscribe(observer)
        action$.next({ type: 'OPEN1' })
        expect(observer).not.toBeCalled();
    })
    test('should TRIGGER "onOpen", if EVERY OPENER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onOpen().subscribe(observer)
        action$.next({ type: 'OPEN1' })
        action$.next({ type: 'OPEN2' })
        expect(observer).toBeCalled();
    })
    test('should NOT TRIGGER "onOpen", if SOME CLOSER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onOpen().subscribe(observer)
        action$.next({ type: 'OPEN1' })
        action$.next({ type: 'CLOSE1' })
        action$.next({ type: 'OPEN2' })
        expect(observer).not.toBeCalled();
    })
    test('should NOT TRIGGER "onOpen", if ANY CLOSER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onOpen().subscribe(observer)
        action$.next({ type: 'OPEN1' })
        action$.next({ type: 'CLOSE1' })
        action$.next({ type: 'OPEN2' })
        action$.next({ type: 'CLOSE2' })
        action$.next({ type: 'OPEN1' })
        expect(observer).not.toBeCalled();
    })
})
