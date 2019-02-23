import {Context} from '../index';
import {Subject} from "rxjs";
import {AnyAction} from "redux";

describe('getData', () => {
    const action$: Subject<AnyAction> = new Subject()
    let singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
    let multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    beforeEach(() => {
        singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
        multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    })
    test('should THROW, if opener is MISSING', (done) => {
        const observer = jest.fn()
        try {
            singleContext.getData('MISSING').subscribe(observer)
        } catch {
            expect(observer).not.toBeCalled()
            done();
        }
    })
    test('should not EMIT data, if context was never OPENED', () => {
        const observer = jest.fn()
        singleContext.getData('OPEN1').subscribe(observer)
        expect(observer).not.toBeCalled()
    })
    test('should EMIT data, if context is OPENED', () => {
        const observer = jest.fn()
        const action = { type: 'OPEN1', payload: 'hello' };
        action$.next(action)
        singleContext.getData('OPEN1').subscribe(observer)
        expect(observer).toBeCalledWith(action)
    })
    test('should NOT EMIT data, if context is CLOSED', () => {
        const observer = jest.fn()
        const open = { type: 'OPEN1', payload: 'hello' };
        const close = { type: 'CLOSE1', payload: 'bye' };
        action$.next(open)
        action$.next(close)
        singleContext.getData('OPEN1').subscribe(observer)
        expect(observer).not.toBeCalled()
    })
    test('should EMIT data, after context is REOPENED', () => {
        const observer = jest.fn()
        const open1 = { type: 'OPEN1', payload: 'hello' };
        const open2 = { type: 'OPEN1', payload: 'hi' };
        const close = { type: 'CLOSE1', payload: 'bye' };
        action$.next(open1)
        action$.next(close)
        action$.next(open2)
        singleContext.getData('OPEN1').subscribe(observer)
        expect(observer).toBeCalledWith(open2)
    })
    test('should EMIT data from extended context', () => {
        const observer = jest.fn()
        const action = { type: 'OPEN1', payload: 'hello' };
        action$.next(action)
        multipleContext.getData('OPEN1').subscribe(observer)
        expect(observer).toBeCalledWith(action)
    })
})
