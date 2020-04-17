'use strict';
const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async find(ctx) {
    let entities;
    if (ctx.query._q) {
      entities = await strapi.services.job.search(ctx.query);
    } else {
      entities = await strapi.services.job.find(ctx.query);
    }

    return entities.map(entity => {
      // hide applicants unless owner
      if ((ctx.state && ctx.state.user && ctx.state.user.id) !== (entity.owner && entity.owner.id)) {
        delete entity.applicants
      }
      return sanitizeEntity(entity, { model: strapi.models.job })
    });
  },
  async findOne(ctx) {
    const { id } = ctx.params;

    const entity = await strapi.services.job.findOne({ id });

    // hide applicants unless owner
    if ((ctx.state && ctx.state.user && ctx.state.user.id) !== (entity.owner && entity.owner.id)) {
      delete entity.applicants
    }

    return sanitizeEntity(entity, { model: strapi.models.job });
  },
};
