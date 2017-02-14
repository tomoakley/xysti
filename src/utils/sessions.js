import 'isomorphic-fetch'

export const fetchSessionList = async(id) => {
  try {
    const response = await fetch(`/api/sessions/list/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
    return null
  }
}
