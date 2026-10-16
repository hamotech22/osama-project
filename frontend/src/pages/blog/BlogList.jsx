import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import useLanguage from "../../context/useLanguage";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4d00]";

const pick = (item, field, lang) => (lang === "ar" && item[`${field}_ar`]) || item[field];

const formatDate = (date, lang) =>
  date
    ? new Date(date).toLocaleDateString(lang === "ar" ? "ar" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

const getAvatarUrl = (avatar) => (avatar?.url ? STRAPI_URL + avatar.url : "/images/about.webp");

export default function BlogList() {
  const { t, lang } = useLanguage();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios
      .get(`${STRAPI_URL}/api/my-blogs?populate[authors][populate]=avatar&populate[image]=true`)
      .then((response) => {
        const list = response.data?.data ?? response.data;
        setPosts(Array.isArray(list) ? list : []);
      })
      .catch((error) => console.error("Failed to load blog posts:", error));
  }, []);

  return (
    <section
      className="w-full bg-white px-5 py-20 sm:py-28 md:px-10 lg:px-16"
      data-aos="fade-up"
      data-aos-duration="700"
      data-aos-offset="30"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 max-w-2xl sm:mb-16" data-aos="fade-up" data-aos-duration="700" data-aos-offset="30">
          <h1 className="text-balance bg-linear-to-b from-zinc-950 to-zinc-600 bg-clip-text text-display font-semibold leading-[1.1] tracking-tight text-transparent">
            {t.blog.listTitle}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-body leading-7 text-zinc-600">{t.blog.listDescription}</p>
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const author = post.authors?.[0] ?? post.author;
            return (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className={`group flex flex-col rounded-2xl ${focusRing}`}
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-offset="30"
            >
              <div className="aspect-5/4 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-900/5">
                <img
                  src={post.image?.url ? STRAPI_URL + post.image.url : ""}
                  alt={pick(post, "title", lang)}
                  loading="lazy"
                  className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <h2 className="mt-5 text-h3 font-semibold leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-[#ff4d00]">
                {pick(post, "title", lang)}
              </h2>

              <p className="mt-2 line-clamp-3 text-body leading-6 text-zinc-600">{pick(post, "excerpt", lang)}</p>

              <time dateTime={post.date} className="mt-auto pt-5 text-small text-zinc-500">
                {formatDate(post.date, lang)}
              </time>

              {author && (
                <div className="mt-3 flex items-center gap-2">
                  <img
                    src={getAvatarUrl(author.avatar)}
                    alt={pick(author, "name", lang)}
                    loading="lazy"
                    className="size-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-body font-medium text-zinc-800">{pick(author, "name", lang)}</p>
                    {(author.role || author.description || author.description_ar) && (
                      <p className="text-body text-zinc-500">{pick(author, "role", lang) || pick(author, "description", lang)}</p>
                    )}
                  </div>
                </div>
              )}
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
