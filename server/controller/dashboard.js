import {USER_ROLES} from "../model/user";
import moment from "moment";

function getStartEndTime(filter) {
  let {startDate, endDate} = filter;
  if (endDate && startDate < endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  const yesterday = +moment().subtract(1, 'day').endOf('day')
  const limit = endDate ? Math.min(+moment(endDate).startOf('day'), yesterday) : yesterday;
  return {startDate, endDate: limit};
}

// mocked
// eslint-disable-next-line
const getAffiliateDashboard = async (filter, user) => {
  let {startDate, endDate} = getStartEndTime(filter);
  let table = [];
  const campaigns = [{name: "Mock 1", zignalyId: 111, subtrack: 'subtraaaaack', code: 111}, {name: "Mock 2", subtrack: '', zignalyId: 222, code: 222}];
  let counter = 1;
  if(!startDate) startDate = moment().subtract(1, 'year').endOf('day')
  for (let day = moment(startDate).startOf('day'); +day < endDate; day.add(1, 'day')) {
    for (let campaign of campaigns) {
      table.push({
        day: day.toJSON(),
        campaign,
        conversions: {
          click: counter * 17,
          signup: counter * 7,
          conversion: counter * 5
        },
        earnings: counter * 1500
      });
      counter++;
    }
  }
  return {
    table,
    totalPaid: 1570.05,
    totalPending: 10.05,
  };
};

// mocked
// eslint-disable-next-line
const getMerchantDashboard = async (filter, user) => {
  let {startDate, endDate} = getStartEndTime(filter);
  let table = [];
  const campaigns = [{name: "Mock 1"}, {name: "Mock 2"}];
  let counter = 1;
  if(!startDate) startDate = moment().subtract(1, 'year').endOf('day')
  for (let day = moment(startDate).startOf('day'); +day < endDate; day.add(1, 'day')) {
    for (let campaign of campaigns) {
      table.push({
        day: day.toJSON(),
        campaign,
        affiliate: ['Jack', "John", "Peter"][counter % 3],
        code: ['1213234', '3e132e123', '123e123e12'][counter % 3],
        conversions: {
          click: counter * 17,
          signup: counter * 7,
          conversion: counter * 5
        },
        amount: counter * 1500
      });
      counter++;
    }
  }
  return {
    table,
    totalRevenue: 2370.05,
    totalPaid: 1570.05,
    totalPending: 10.05,
  };
};

export const getDashboard = async (req, res) => {
  const {query: filter, user: {data: user}} = req;
  let dashboard;
  if (user.role === USER_ROLES.AFFILIATE) {
    dashboard = await getAffiliateDashboard(filter, user);
  } else if (user.role === USER_ROLES.MERCHANT) {
    dashboard = await getMerchantDashboard(filter, user);
  }
  console.error(dashboard, user)
  res.status(200).json(dashboard);
};
