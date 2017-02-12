import urlFormat from '../urlFormat'
import fetch from 'isomorphic-fetch'

const geocodeAddress = (address) => {
  const pathname = 'https://maps.googleapis.com/maps/api/geocode/json'
  const query = {
    address,
    components: 'country:uk'
    // key: config.gmaps.key
  }
  const url = urlFormat({pathname, query})
  return fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => response.json())
}

export default geocodeAddress

