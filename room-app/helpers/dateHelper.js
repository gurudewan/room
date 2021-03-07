import moment from 'moment'
import _ from 'lodash'

export function formatDateNicely(dateString) {
  /*
    Takes a date string. Returns a nicely formatted date, accounting for 'Today', 'Yest', 'Same Year'.
   */

    moment.calendarFormat = function (myMoment, now) {
      var diff = myMoment.diff(now, 'days', true);

      var key = (diff < -1) && (myMoment.year() === now.year()) ? 'sameYear' :
        diff < -1 ? 'sameElse' :
          diff < 0 ? 'lastDay' :
            diff < 1 ? 'sameDay' : 'sameElse'

      return key;
    }

    let day = moment(dateString).startOf('day').calendar(null,
      {
        sameDay: '[Today]',
        lastDay: '[Yesterday]',
        sameYear: 'dddd, DD MMM',
        sameElse: 'dddd, DD MMM YYYY'
      })

    return day
  }

  export function groupAssetsByDay(data) {
      // takes in the raw assets data
      // groups into days format
      // ready to be presented
    sortedData = _.orderBy(data, d => d.timestamp, ['desc'])
    groupedData = _.groupBy(sortedData, d => d.timestamp.slice(0, 10))

    formattedData = _.reduce(groupedData, (acc, next, index) => {
      acc.push({
        title: formatDateNicely(index),
        data: next
      })
      return acc
    }, [])
    return formattedData
  }

  export function groupAssetsByMonth(data, month) {
    // 2019-01, 1997-12 is the format for month.

    sortedData = _.orderBy(data, d => d.timestamp, ['desc'])
    monthData = _.filter(sortedData, (d) => d.timestamp.slice(0, 7) == month)
    
    return monthData
  }

  export function getCurrentMonth(data) {

    sortedData = _.orderBy(data, d => d.timestamp, ['desc'])
    let currentMonth = sortedData[0].timestamp.slice(0, 7)
    return currentMonth

  }

  export function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}