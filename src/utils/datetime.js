import moment from 'moment'
import chrono from 'chrono-node'
import {pipe, path, complement} from 'ramda'

export const formatDatetime = (datetime) => {
  return moment(datetime).format('dddd D MMM HH:mm')
}

export const parseDateTime = (date, time) => {
  let datetime = null
  if (Array.isArray(time)) {
    datetime = {
      from: chrono.parseDate(`${date} ${time[0]}`),
      to: chrono.parseDate(`${date} ${time[1]}}`)
    }
  } else if (typeof time === 'string') {
    datetime = {
      from: chrono.parseDate(`${date} ${time}`),
      to: chrono.parseDate(`${date} ${time}`)
    }
  }
  return datetime
}

export const isSessionUpcoming = (datetime) => {
  return moment().isBefore(datetime) // return TRUE - upcoming; FALSE - past
}

export const getPastSessions = (sessions) => {
  return sessions.filter(pipe(path(['datetime']), complement(isSessionUpcoming)))
}

export const getUpcomingSessions = (sessions) => {
  return sessions.filter(pipe(path(['datetime']), isSessionUpcoming))
}
