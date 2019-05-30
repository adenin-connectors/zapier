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

    if (activity.Request.Data._type == "validate_key") return;

    const request = activity.Request.Data;
    let entity = {};
    let collections = [];
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

      if (request.openValue == true) {
        if (request.assignedTo) {
          // case 1: A collection “new” is returned with users and roles
          collections.push({ name: "new", users: request.assignedTo, roles: request.roles, date: date });
          // case 2: When open == true we return collection “open”, with users and roles
          collections.push({ name: "open", users: request.assignedTo, roles: request.roles, date: date });
          // case 3: When AssignedTo is not empty and open we return a collection “my”, with only users: AssignedTo  (no roles)
          collections.push({ name: "my", users: request.assignedTo, roles: [], date: date });
          if (request.dueDate) {
            let date = new Date(request.dueDate).toISOString();
            // case 4: When DueDate is provided and open we return a collection “due”, with users and roles; date = DueDate
            collections.push({ name: "due", users: request.assignedTo, roles: request.roles, date: date });
            // case 5: When DueDate is provided and open we return a collection “my-due”, with only users: AssignedTo  (no roles), date = DueDate
            collections.push({ name: "my-due", users: request.assignedTo, roles: [], date: date });
          }
        }
      }
    }

    activity.Response.Data = { entity: entity, collections: collections };
  } catch (error) {
    $.handleError(activity, error);
  }

};
