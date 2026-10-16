'use strict';

/**
 * my-blog service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-blog.my-blog');
