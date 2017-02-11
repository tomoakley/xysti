import createReducer from 'app/redux/createReducer'

function initialStateFactory({config}) {
  return {...config}
}

export default function appFactory({config}) {
  return createReducer(initialStateFactory({config}), {})
}
