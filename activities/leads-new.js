'use strict';

const api = require('./common/api');

module.exports = async (activity) => {
  try {
    api.initialize(activity);

    const pagination = $.pagination(activity);
    const dateRange = $.dateRange(activity);

    const response = await api(`/lead/new?page=${pagination.page}&pageSize=${pagination.pageSize}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);

    if ($.isErrorResponse(activity, response)) return;

    const items = response.body.Data.items;

    let count = 0;
    let readDate = (new Date(new Date().setDate(new Date().getDate() - 30))).toISOString(); // default read date 30 days in the past

    if (activity.Request.Query.readDate) readDate = activity.Request.Query.readDate;

    for (let i = 0; i < items.length; i++) {
      if (items[i].date > readDate) count++;
    }

    activity.Response.Data.items = items;

    if (parseInt(pagination.page) === 1) {
      activity.Response.Data.title = T(activity, 'New Leads');
      activity.Response.Data.thumbnail = 'https://www.adenin.com/assets/images/wp-images/logo/zapier.svg';
      activity.Response.Data.actionable = count > 0;

      if (count > 0) {
        activity.Response.Data.value = count;
        activity.Response.Data.date = activity.Response.Data.items[0].date;
        activity.Response.Data.color = 'blue';
        activity.Response.Data.description = count > 1 ? T(activity, 'There are {0} new leads.', count) : T(activity, 'There is 1 new lead.');
      } else {
        activity.Response.Data.description = T(activity, 'There are no new leads.');
      }
    }
  } catch (error) {
    $.handleError(activity, error);
  }
};
