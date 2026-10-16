import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import useLanguage from "../../context/useLanguage";

// const STRAPI_URL = "http://localhost:1337";
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

const getImageUrl = (image) => (image?.url ? STRAPI_URL + image.url : "");
const getAvatarUrl = (avatar) => (avatar?.url ? STRAPI_URL + avatar.url : "/images/about.webp");

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 256 256"
      aria-hidden="true"
      className="size-4 fill-current transition duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
    >
      <path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z" />
    </svg>
  );
}

export default function Blog() {
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

  const featured = posts.find((post) => post.featured);
  const otherPosts = posts.filter((post) => post.id !== featured?.id);
  const featuredAuthor = featured?.authors?.[0] ?? featured?.author;

  return (
    <section className="w-full bg-white px-5 py-20 sm:py-28 md:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl" data-aos="fade-up" data-aos-duration="700" data-aos-easing="ease-out-cubic" data-aos-offset="30">
            <h2 className="text-balance bg-linear-to-b from-zinc-950 to-zinc-600 bg-clip-text text-h2 font-semibold leading-[1.2] tracking-tight text-transparent">
              {t.blog.homeTitle}
            </h2>

            <p className="mt-5 max-w-xl text-pretty text-body leading-7 text-zinc-600">{t.blog.homeDescription}</p>
          </div>

          <Link
            to="/blog"
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-easing="ease-out-cubic"
            data-aos-offset="30"
            className={`group inline-flex w-fit items-center gap-2.5 rounded-full border border-[#ff4d00]/40 px-5 py-2.5 text-small font-medium text-[#ff4d00] transition hover:border-[#ff4d00] hover:bg-[#ff4d00] hover:text-white ${focusRing}`}
          >
            {t.blog.viewAll}
            <ArrowIcon />
          </Link>
        </div>

        {/* Featured post */}
        {featured && (
          <Link
            to={`/blog/${featured.id}`}
            data-aos="fade-up"
            data-aos-duration="700"
            data-aos-easing="ease-out-cubic"
            data-aos-offset="30"
            className={`group grid grid-cols-1 items-center gap-6 rounded-3xl bg-zinc-50 p-3 ring-1 ring-zinc-900/5 transition duration-300 hover:bg-zinc-100/70 sm:p-4 md:grid-cols-[1.45fr_1fr] lg:gap-10 ${focusRing}`}
          >
            <div className="aspect-3/2 overflow-hidden rounded-2xl bg-zinc-200">
              <img
                src={getImageUrl(featured.image)}
                alt={pick(featured, "title", lang)}
                className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
              />
            </div>

            <div className="flex flex-col px-2 pb-2 sm:px-4 md:py-4 lg:pe-8">
              <h3 className="text-balance text-h3 font-semibold leading-[1.3] tracking-tight text-zinc-950 transition-colors group-hover:text-[#ff4d00]">
                {pick(featured, "title", lang)}
              </h3>

              <p className="mt-4 text-pretty text-body leading-7 text-zinc-600">{pick(featured, "excerpt", lang)}</p>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200 pt-6">
                {featuredAuthor && (
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(featuredAuthor.avatar)}
                      alt={pick(featuredAuthor, "name", lang)}
                      className="size-11 rounded-full object-cover ring-2 ring-white"
                    />

                    <div>
                      <p className="text-body font-medium text-zinc-950">{pick(featuredAuthor, "name", lang)}</p>
                      <p className="mt-0.5 text-body text-zinc-500">{pick(featuredAuthor, "role", lang) || pick(featuredAuthor, "description", lang)}</p>
                    </div>
                  </div>
                )}

                <time dateTime={featured.date} className="text-small text-zinc-500">
                  {formatDate(featured.date, lang)}
                </time>
              </div>
            </div>
          </Link>
        )}

        {/* Other posts */}
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {otherPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              data-aos="fade-up"
              data-aos-duration="700"
              data-aos-easing="ease-out-cubic"
              data-aos-offset="30"
              className={`group flex flex-col rounded-2xl ${focusRing}`}
            >
              <div className="aspect-5/4 overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-900/5">
                <img
                  src={getImageUrl(post.image)}
                  alt={pick(post, "title", lang)}
                  loading="lazy"
                  className="size-full object-cover transition duration-700 ease-out group-hover:scale-105"
                />
              </div>

              <h3 className="mt-5 text-h3 font-semibold leading-snug tracking-tight text-zinc-950 transition-colors group-hover:text-[#ff4d00]">
                {pick(post, "title", lang)}
              </h3>

              <p className="mt-2 line-clamp-3 text-body leading-6 text-zinc-600">{pick(post, "excerpt", lang)}</p>

              <time dateTime={post.date} className="mt-auto pt-5 text-small text-zinc-500">
                {formatDate(post.date, lang)}
              </time>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
