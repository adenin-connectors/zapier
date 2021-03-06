'use strict';
const api = require('./common/api');

module.exports = async function (activity) {
  try {
    api.initialize(activity);

    const pagination = $.pagination(activity);
    const dateRange = $.dateRange(activity);

    const response = await api(`/ticket/open?page=${pagination.page}&pageSize=${pagination.pageSize}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);

    if ($.isErrorResponse(activity, response)) return;

    const items = response.body.Data.items;
    const value = items.length;

    activity.Response.Data.items = items;

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'Open Tickets');
      activity.Response.Data.actionable = value > 0;
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/zapier.svg';

      if (value > 0) {
        activity.Response.Data.value = value;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.description = value > 1 ? T(activity, 'There are {0} open tickets.', value) : T(activity, 'There is 1 open ticket.');
        activity.Response.Data.briefing = activity.Response.Data.description + ' The latest is <b>' + items[0].title + '</b>';
      } else {
        activity.Response.Data.description = T(activity, 'There are no open tickets.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
