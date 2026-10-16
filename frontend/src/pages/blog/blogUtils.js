// const STRAPI_URL = "http://localhost:1337";

// export function getPostAuthor(post, translatedRole, lang) {
//   const author = post?.author ?? post?.authors?.[0];
//   if (!author) return null;

//   const avatar = author.avatar;
//   const avatarUrl =
//     typeof avatar === "string"
//       ? avatar.startsWith("http")
//         ? avatar
//         : `${STRAPI_URL}${avatar}`
//       : avatar?.url
//         ? `${STRAPI_URL}${avatar.url}`
//         : "/images/about.webp";

//   return {
//     ...author,
//     name: (lang === "ar" && author.name_ar) || author.name,
//     role:
//       (lang === "ar" && (author.description_ar || author.title_ar)) ||
//       translatedRole ||
//       author.role ||
//       author.description ||
//       "",
//     avatarUrl,
//   };
// }

// export function localizePost(post, lang, translation = {}) {
//   const localized = { ...post, ...translation };
//   if (lang === "ar") {
//     localized.title = post.title_ar || translation.title || post.title;
//     localized.excerpt = post.excerpt_ar || translation.excerpt || post.excerpt;
//     localized.content = post.content_ar || translation.content || post.content;
//   } else {
//     localized.title = post.title || translation.title;
//     localized.excerpt = post.excerpt || translation.excerpt;
//     localized.content = post.content || translation.content;
//   }

//   const author = getPostAuthor(post, translation.authorRole, lang);
//   if (author) localized.author = author;

//   return localized;
// }
