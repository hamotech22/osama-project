import { useEffect, useRef, useState } from "react";
import axios from "axios";
// [تعديل 1] useSearchParams لحفظ رقم الصفحة في الرابط + react-paginate
import { Link, useSearchParams } from "react-router-dom";
import ReactPaginateModule from "react-paginate";
import useLanguage from "../../context/useLanguage";
import ErrorState from "../../components/ErrorState";
import { getErrorType } from "../../utils/errorType";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

// [تعديل 2] حل مشكلة الـ default export مع Vite
const ReactPaginate = ReactPaginateModule.default ?? ReactPaginateModule;

// [تعديل 3] عدد المقالات في الصفحة + ستايل أزرار الـ pagination
const PAGE_SIZE = 6;

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4d00]";
const pageBase =
  "cursor-pointer grid h-10 min-w-10 place-items-center rounded-full bg-white px-3 text-small font-medium tabular-nums text-zinc-700 ring-1 ring-zinc-900/10 transition hover:text-[#ff4d00]";

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
  const [errorType, setErrorType] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [slow, setSlow] = useState(false);

  // [تعديل 4] رقم الصفحة من الرابط (?page=2): الـ Back من المقال بيرجعك لنفس الصفحة
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);

  // [تعديل 5] عدد الصفحات + التحميل + ref للسكرول
  const [pageCount, setPageCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    // [تعديل 6] إلغاء الطلب القديم لو المستخدم غيّر الصفحة بسرعة
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setSlow(true), 4000);

    const loadPosts = () => {
      setErrorType(null);
      setLoading(true);

      axios
        .get(`${STRAPI_URL}/api/my-blogs`, {
          // [تعديل 7] نفس الـ populate القديم + باراميترات الـ pagination الخاصة بـ Strapi
          params: {
            "populate[authors][populate]": "avatar",
            "populate[image]": true,
            "pagination[page]": page,
            "pagination[pageSize]": PAGE_SIZE,
          },
          timeout: 8000,
          signal: controller.signal,
        })
        .then((response) => {
          const list = response.data?.data ?? response.data;
          const items = Array.isArray(list) ? list : [];
          const meta = response.data?.meta?.pagination;

          if (meta) {
            // [تعديل 8] الحالة العادية: Strapi رجّع الصفحة المطلوبة + meta
            setPosts(items);
            setPageCount(meta.pageCount);

            // لو الرابط فيه صفحة أكبر من الموجود نرجع لآخر صفحة
            if (meta.pageCount > 0 && page > meta.pageCount) {
              setSearchParams({ page: meta.pageCount }, { replace: true });
            }
          } else {
            // [تعديل 9] احتياطي: لو الـ endpoint المخصص مش بيرجّع meta نقسم من الـ frontend
            setPageCount(Math.max(1, Math.ceil(items.length / PAGE_SIZE)));
            setPosts(items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
          }
        })
        .catch((error) => {
          if (axios.isCancel(error)) return;
          console.error("Failed to load blog posts:", error);
          setErrorType(getErrorType(error));
        })
        .finally(() => {
          clearTimeout(slowTimer);
          setSlow(false);
          if (!controller.signal.aborted) setLoading(false);
        });
    };

    loadPosts();

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [page, reloadKey, setSearchParams]);

  useEffect(() => {
    const handleOnline = () => {
      setLoading(true);
      setReloadKey((key) => key + 1);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const retry = () => {
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  // [تعديل 10] تغيير الصفحة (react-paginate بيبدأ من 0 فبنزود 1) + سكرول لأول الليستة
  const handlePageChange = ({ selected }) => {
    setSearchParams({ page: selected + 1 });
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

        {/* [تعديل 11] رسالة تحميل أول مرة بس */}
        {loading && posts.length === 0 && !errorType && (
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-5/4 animate-pulse rounded-2xl bg-zinc-200" />
            ))}
          </div>
        )}
        {slow && loading && (
          <p role="status" className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-center text-small text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4 shrink-0">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {t.errors.slow}
          </p>
        )}
        {errorType && posts.length === 0 && <ErrorState type={errorType} onRetry={retry} />}
        {errorType && posts.length > 0 && (
          <p role="alert" className="mb-4 text-small text-zinc-500">
            {t.errors.stale}{" "}
            <button type="button" onClick={retry} className="font-medium text-[#ff4d00] underline">
              {t.errors.retry}
            </button>
          </p>
        )}

        {/* Posts grid */}
        {/* [تعديل 12] ref للسكرول + الكروت بتبهت أثناء تحميل صفحة جديدة */}
        <div
          ref={listRef}
          className={`grid scroll-mt-24 grid-cols-1 gap-x-6 gap-y-12 transition-opacity duration-300 sm:grid-cols-2 lg:grid-cols-3 ${
            loading ? "opacity-50" : "opacity-100"
          }`}
        >
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
                        <p className="text-body text-zinc-500">
                          {pick(author, "role", lang) || pick(author, "description", lang)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* [تعديل 13] الـ pagination (مش بيظهر لو فيه صفحة واحدة) */}
        {pageCount > 1 && (
          <ReactPaginate
            forcePage={Math.min(page, pageCount) - 1}
            pageCount={pageCount}
            onPageChange={handlePageChange}
            pageRangeDisplayed={2}
            marginPagesDisplayed={1}
            previousLabel={t.blog.prev}
            nextLabel={t.blog.next}
            breakLabel="…"
            renderOnZeroPageCount={null}
            ariaLabelBuilder={(n) => `${t.blog.page} ${n}`}
            previousAriaLabel={t.blog.prev}
            nextAriaLabel={t.blog.next}
            containerClassName="mt-16 flex flex-wrap items-center justify-center gap-2"
            pageLinkClassName={`${pageBase} ${focusRing}`}
            activeLinkClassName="bg-[#ff4d00]! text-white! ring-[#ff4d00]!"
            previousLinkClassName={`${pageBase} px-5 ${focusRing}`}
            nextLinkClassName={`${pageBase} px-5 ${focusRing}`}
            breakClassName="px-1 text-zinc-400"
            disabledClassName="opacity-40 pointer-events-none"
          />
        )}
      </div>
    </section>
  );
}