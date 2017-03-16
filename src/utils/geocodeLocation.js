import urlFormat from 'utils/urlFormat'
import 'isomorphic-fetch'

const geocodeAddress = async (address) => {
  const pathname = 'https://maps.googleapis.com/maps/api/geocode/json'
  const query = {
    address,
    components: 'country:uk'
    // key: config.gmaps.key
  }
  const url = urlFormat({pathname, query})
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    return await response.json()
  } catch (err) {
    console.log(err)
    return null
  }
}

export default geocodeAddress

