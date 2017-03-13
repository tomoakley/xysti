import 'isomorphic-fetch'
import config from 'config'

export const fetchSessionList = async(id) => {
  const {
    url: apiUrl
  } = config.api
  try {
    const response = await fetch(`${apiUrl}/sessions/list/${id}`, {
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
