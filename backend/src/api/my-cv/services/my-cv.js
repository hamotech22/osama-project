'use strict';

/**
 * my-cv service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-cv.my-cv');
