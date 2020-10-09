import {USER_ROLES} from "../model/user";
import moment from "moment";

//eslint-disable-next-line
const getAffiliateDashboard = async (filter, user) => {
  let {startDate, endDate} = filter;
  if (endDate && startDate < endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  const yesterday = +moment().subtract(1, 'day').endOf('day')
  const limit = endDate ? Math.min(+moment(endDate).startOf('day'), yesterday) : yesterday;
  let table = [];
  const campaigns = [{name: "Mock 1", zignalyId: 111, code: 111}, {name: "Mock 2", zignalyId: 222, code: 222}];
  let counter = 1;
  if(!startDate) startDate = moment().subtract(1, 'year').endOf('day')
  for (let day = moment(startDate).startOf('day'); +day < limit; day.add(1, 'day')) {
    for (let campaign of campaigns) {
      table.push({
        day: day.toJSON(), campaign,
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

const getMerchantDashboard = () => null;

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
