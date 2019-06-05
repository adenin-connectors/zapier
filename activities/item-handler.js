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
      let date = new Date(request.date).toISOString();
      entity = {
        _type: request._type,
        id: "" + request.id,
        title: request.title,
        description: request.description,
        date: date,
        link: request.link
      };

      if (request.assignedTo.length > 0 || request.roles.length > 0) {
        // case 1: A collection "all" is returned with users and roles
        collections.push({ name: "all", users: request.assignedTo, roles: request.roles, date: date });
        if (request.openValue == true) {

          // case 2: When open == true we return collection “open”, with users and roles
          collections.push({ name: "open", users: request.assignedTo, roles: request.roles, date: date });

          // case 3: When AssignedTo is not empty and open we return a collection “my”, with only users: AssignedTo
          // if assignedTo is empty we use roles instead
          if (request.assignedTo.length > 0) {
            collections.push({ name: "my", users: request.assignedTo, roles: [], date: date });
          } else {
            collections.push({ name: "my", users: [], roles: request.roles, date: date });
          }
          if (request.dueDate) {
            let dueDate = new Date(request.dueDate).toISOString();

            // case 4: When DueDate is provided and open we return a collection “due”, with users and roles; date = DueDate
            collections.push({ name: "due", users: request.assignedTo, roles: request.roles, date: dueDate });

            // case 5: When DueDate is provided and open we return a collection “my-due”, with only users: AssignedTo, date = DueDate
            // if assignedTo is empty we use roles
            if (request.assignedTo.length > 1) {
              collections.push({ name: "my-due", users: request.assignedTo, roles: [], date: dueDate });
            } else {
              collections.push({ name: "my-due", users: [], roles: request.roles, date: dueDate });
            }
          }
        }
      }
    }

    activity.Response.Data = { entity: entity, collections: collections };
  } catch (error) {
    $.handleError(activity, error);
  }

};
