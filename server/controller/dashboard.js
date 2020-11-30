import moment from 'moment';
import { USER_ROLES } from '../model/user';
import {
  getAffiliateConversionTable,
  getAffiliateTotals,
  getMerchantConversionTable,
  getMerchantTotals,
} from '../service/statistics';

function getStartEndTime(filter) {
  let { startDate, endDate } = filter;
  if (endDate && startDate < endDate) {
    [startDate, endDate] = [endDate, startDate];
  }
  const yesterday = +moment().subtract(1, 'day').endOf('day');
  const limit = endDate
    ? Math.min(+moment(endDate).startOf('day'), yesterday)
    : yesterday;
  return { startDate, endDate: limit };
}

const getAffiliateDashboard = async (filter, user) => {
  let { startDate } = getStartEndTime(filter);
  if (!startDate) startDate = moment().subtract(1, 'year').endOf('day');
  return {
    table: await getAffiliateConversionTable(user, startDate),
    ...(await getAffiliateTotals(user)),
  };
};

const getMerchantDashboard = async (filter, user) => {
  let { startDate } = getStartEndTime(filter);
  if (!startDate) startDate = moment().subtract(1, 'year').endOf('day');
  return {
    table: await getMerchantConversionTable(user, startDate),
    ...(await getMerchantTotals(user)),
  };
};

export const getDashboard = async (req, res) => {
  const {
    query: filter,
    user: { data: user },
  } = req;
  let dashboard;
  if (user.role === USER_ROLES.AFFILIATE) {
    dashboard = await getAffiliateDashboard(filter, user);
  } else if (user.role === USER_ROLES.MERCHANT) {
    dashboard = await getMerchantDashboard(filter, user);
  }
  res.status(200).json(dashboard);
};
