// module.exports = {
//   async beforeCreate(event) {
//     const adminUser = strapi.requestContext.get()?.state?.user;
//     if (!adminUser?.email) return;

//     const author = await strapi.db.query("api::author.author").findOne({
//       where: { email: adminUser.email },
//     });

//     if (author) event.params.data.author = author.id;
//   },
// };