import {Context} from '../index';
import {Subject} from "rxjs";
import {Action} from "redux";

describe('onClose', () => {
    const action$: Subject<Action> = new Subject()
    let singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
    let multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    beforeEach(() => {
        singleContext = new Context(action$, 'OPEN1', 'CLOSE1')
        multipleContext = singleContext.extend('OPEN2', 'CLOSE2')
    })
    test('should NOT TRIGGER "onClose", if NO CLOSER was dispatched', () => {
        const observer = jest.fn()
        singleContext.onClose().subscribe(observer)
        expect(observer).not.toBeCalled();
    })
    test('should TRIGGER "onClose", if some CLOSER was dispatched', () => {
        const observer = jest.fn()
        singleContext.onClose().subscribe(observer)
        action$.next({ type: 'CLOSE1' })
        expect(observer).toBeCalled();
    })
    test('should TRIGGER "onClose", if first CLOSER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onClose().subscribe(observer)
        action$.next({ type: 'CLOSE1' })
        expect(observer).toBeCalled();
    })
    test('should TRIGGER "onClose", if other CLOSER was dispatched', () => {
        const observer = jest.fn()
        multipleContext.onClose().subscribe(observer)
        action$.next({ type: 'CLOSE2' })
        expect(observer).toBeCalled();
    })
})
