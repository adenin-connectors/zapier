'use strict';
module.exports = async (activity) => {
  try {
    if (!activity.Context.connector.custom1 || (activity.Context.connector.custom1 != activity.Request.Headers["x-apikey"])) {
      activity.Response.ErrorCode = 403;
      activity.Response.Data = {
        ErrorText: "invalid X-APIKEY"
      };
      return;
    }

    if(activity.Request.Data._type == "validate_key") return;

    var request = activity.Request.Data;
    var entity = {};
    var collections = [];

    if (request._type) {
      let date = new Date(request.date).toJSON();
      entity = {
        _type: request._type,
        id: "" + request.id,
        title: request.title,
        description: request.description,
        date: date,
        link: request.link
      };
    }
    activity.Response.Data = { entity: entity, collections: collections };
  } catch (error) {
    $.handleError(activity, error);
  }
};
