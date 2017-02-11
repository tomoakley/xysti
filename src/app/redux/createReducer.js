export default function createReducer(initialState, actionHandlers) {
  return (state = initialState, {type, ...actionProps}) => {
    if (type in actionHandlers) { return actionHandlers[type](state, actionProps) }
    return state
  }
}
