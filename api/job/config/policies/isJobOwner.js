'use strict';
/**
 * `isJobOwner` policy.
 * Delete applicants data if not owner
 */


var pluralize = require('pluralize')

module.exports = async (ctx, next) => {
  const id = ctx.state.user.id

  console.log(ctx.body)
  // console.log(ctx.response.body.applicants)

  // if (id !== ctx.response.body.owner) {
  //   if (typeof ctx.response.body !== 'array') {
  //     delete ctx.response.body.applicants
  //   } else {
  //     ctx.response.body.map(item => delete item.applicants)
  //   }
  // }

  await next();

};