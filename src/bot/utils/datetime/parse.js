import chrono from 'chrono-node'

const parseDateTime = (date, time) => {
  let datetime = null
  if (Array.isArray(time)) {
    datetime = {
      from: chrono.parseDate(`${date} ${time[0]}`),
      to: chrono.parseDate(`${date} ${time[1]}}`)
    }
  } else if (typeof time == 'string') {
    datetime = {
      from: chrono.parseDate(`${date} ${time}`),
      to: chrono.parseDate(`${date} ${time}`)
    }
  }
  return datetime
}

export default parseDateTime
