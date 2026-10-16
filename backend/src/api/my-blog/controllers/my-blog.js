'use strict';

/**
 * my-blog controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::my-blog.my-blog');
