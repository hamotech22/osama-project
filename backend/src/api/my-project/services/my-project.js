'use strict';

/**
 * my-project service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::my-project.my-project');
