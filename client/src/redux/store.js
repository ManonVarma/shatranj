import { createStore, applyMiddleware } from 'redux'
import { rootReducer } from './reducer'
import logger from 'redux-logger'

const middlewares = []
if (process.env.NODE_ENV === 'development') {  // enable logger only in development and not in production
    middlewares.push(logger)
}

const store = createStore(rootReducer, applyMiddleware(...middlewares))

export default store