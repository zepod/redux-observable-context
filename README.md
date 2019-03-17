# redux-observable-context
Library that embeds epics within hierarchical composable contexts

[![Build Status](https://travis-ci.com/zepod/redux-observable-context.png)](https://travis-ci.com/zepod/redux-observable-context)
[![codecov](https://codecov.io/gh/zepod/redux-observable-context/branch/master/graph/badge.svg)](https://codecov.io/gh/zepod/redux-observable-context) [![Greenkeeper badge](https://badges.greenkeeper.io/zepod/redux-observable-context.svg)](https://greenkeeper.io/)
[![Maintainability](https://api.codeclimate.com/v1/badges/281286e1826ff235fecf/maintainability)](https://codeclimate.com/github/zepod/redux-observable-context/maintainability)

# The Problem
When multiple epics share condition requirements it get's increasingly difficult to manage the relationships between actions and epics. Those requirements are called context. I order to group epics affected by the same conditions you might either:

Implement a condition for each epics. While it's easy to reason about the condition within 
a local scope of 1 epic, it becomes challanging to manage conditions on a general level. Condition and epics are tightly coupled.

Another way to manage conditions, is to create additional layer of epics, which serve as a proxy to other epics, encapsulating the definition of condition to one place.

While this approach is much better, it greatly increases complexity of the epics structure. Immediately, epics are not flat but implicitly leveled in layers, which are hard to inspect.

# Solution
`redux-observable-context` provides a simple API, that allows you to separate definition and implementation of conditions in a graphically friendly manner. We either operate on the level of epic composition, with no interest of low level implementations of epics, or we are implementing a behaviour of a epic, with conditions as injected parameters, which have uniform interface.

# Basic Usage
```javascript
const syncUserEpic = (action$, store, { context }) =>
    // emits after LOGIN actions is dispatched
    context.onOpen().pipe(
        action$.pipe(
            ofType(SYNC_USER),
            inteval(500),
            // emits after LOGOUT action is dispatched
            takeUntil(context.onClose())
        ),
        mapTo({ type: FETCH_USER }),
    );
    
const fightEpic = (action$, store, { context }) =>
    // emits after LOGIN and START actions is dispatched
    context.onOpen().pipe( 
        action$.pipe(ofType(ATTACK)),
        // emits after LOGOUT or END action is dispatched
        takeUntil(context.onClose()),
        mapTo({ type: NEXT_TURN }),
    );
    
const inAuthContext = provideContext(LOGIN, LOGOUT);
const inGameContext = provideContext(START, END);

export default combineEpics(
    inAuthContext(
        syncUserEpic,
        inGameContext(
            fightEpic
        )));
```








