'use strict';
/**
 * `isOwner` policy.
 */


var pluralize = require('pluralize')

module.exports = async (ctx, next) => {
  try {

    let errMsg = "You are not allowed to perform this action.";

    const { id } = await strapi.plugins['users-permissions'].services.jwt.getToken(ctx);

    if (typeof id === "undefined" || id === null) {
      return ctx.unauthorized(`${errMsg} [1]`);
    }


    // [find, count] Only query entities that owned by the current user
    if (ctx.request.method === 'GET') {
      // Remove everything about owner in the query eg. owner.id_in, owner.id, owner etc.
      for (let key in ctx.query) {
        if (key.includes("owner")) {
          delete ctx.query[key];
        }
      }

      // Reset owner.id to current user id
      ctx.query = Object.assign({ 'owner.id': id }, ctx.query);
    }

    // [update, delete] Check owner of an existing entity
    if ((ctx.request.method === 'DELETE' || ctx.request.method === 'PUT') && typeof ctx.params !== "undefined" && ctx.params !== null && typeof ctx.params.id !== "undefined" && ctx.params.id !== null && ctx.params.id !== '') {
      // Extract model name from request path eg. /messages/15
      var modelName = ctx.request.path.match(/^\/(.*)\/\d*$/);
      if (Array.isArray(modelName) === false || modelName.length !== 2 || modelName[1] === '') {
        return ctx.unauthorized(`Invalid request ${ctx.request.path}`);
      }
      // Get existing entity and check for ownership
      let existingEntity = await strapi.query(pluralize.singular(modelName[1])).findOne({
        id: ctx.params.id
      });
      if (typeof existingEntity === "undefined" || existingEntity === null) {
        return ctx.notFound('Not Found');
      }

      if (typeof existingEntity.owner === "undefined" || existingEntity.owner === null || typeof existingEntity.owner.id === "undefined" || existingEntity.owner.id === null || existingEntity.owner.id.toString() !== id.toString()) {
        return ctx.unauthorized(`${errMsg} [2]`);
      }

      // Set owner to current user
      ctx.request.body.owner = id.toString();
    }

    // [create] Set owner for a new entity
    if (ctx.request.method === 'POST') {
      ctx.request.body.owner = id.toString();
    }

    await next();

    // [find.one] Only query entities that owned by the current user
    if (ctx.request.method === 'GET') {
      if (Object.prototype.toString.call(ctx.response.body) === '[object Object]') {
        if (typeof ctx.response.body.owner === "undefined" || ctx.response.body.owner === null || typeof ctx.response.body.owner.id === "undefined" || ctx.response.body.owner.id === null || ctx.response.body.owner.id.toString() !== id.toString()) {
          return ctx.unauthorized(`${errMsg} [3]`);
        }
      }
    }

  } catch (error) {
    return ctx.unauthorized(error);
  }

};