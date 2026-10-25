import { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import ReactPaginateModule from "react-paginate";
import ProjectCard from "./ProjectCard";
import useLanguage from "../../context/useLanguage";
import ErrorState from "../../components/ErrorState";
import { getErrorType } from "../../utils/errorType";
// const STRAPI_URL = "http://localhost:1337";

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
const FETCH_PAGE_SIZE = 100;
const PAGE_SIZE = 6;
const ReactPaginate = ReactPaginateModule.default ?? ReactPaginateModule;
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4d00]";
const pageBase =
  "cursor-pointer grid h-10 min-w-10 place-items-center rounded-full bg-white px-3 text-small font-medium tabular-nums text-zinc-700 ring-1 ring-zinc-900/10 transition hover:text-[#ff4d00]";

export default function ProjectsList() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [slow, setSlow] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pageCount = Math.ceil(projects.length / PAGE_SIZE);
  const requestedPage = Math.max(1, parseInt(searchParams.get("page"), 10) || 1);
  const page = pageCount > 0 ? Math.min(requestedPage, pageCount) : requestedPage;
  const visibleProjects = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => setSlow(true), 4000);

    const loadProjects = async () => {
      setErrorType(null);
      try {
        const response = await axios.get(`${STRAPI_URL}/api/my-projects`, {
          params: {
            "populate[image]": true,
            "pagination[page]": 1,
            "pagination[pageSize]": FETCH_PAGE_SIZE,
          },
          timeout: 8000,
          signal: controller.signal,
        });
        const firstPage = response.data?.data ?? response.data;
        const allProjects = Array.isArray(firstPage) ? [...firstPage] : [];
        const pageCount = response.data?.meta?.pagination?.pageCount ?? 1;

        if (Array.isArray(firstPage) && pageCount > 1) {
          const remainingPages = await Promise.all(
            Array.from({ length: pageCount - 1 }, (_, index) =>
              axios.get(`${STRAPI_URL}/api/my-projects`, {
                params: {
                  "populate[image]": true,
                  "pagination[page]": index + 2,
                  "pagination[pageSize]": FETCH_PAGE_SIZE,
                },
                timeout: 8000,
                signal: controller.signal,
              }),
            ),
          );

          remainingPages.forEach((pageResponse) => {
            const pageData = pageResponse.data?.data ?? pageResponse.data;
            if (Array.isArray(pageData)) allProjects.push(...pageData);
          });
        }

        if (!controller.signal.aborted) setProjects(allProjects);
      } catch (error) {
        if (axios.isCancel(error) || controller.signal.aborted) return;
        console.error("Failed to load projects:", error);
        setErrorType(getErrorType(error));
        setProjects((currentProjects) => (currentProjects.length ? currentProjects : []));
      } finally {
        clearTimeout(slowTimer);
        setSlow(false);
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadProjects();

    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [reloadKey]);

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

  useEffect(() => {
    if (pageCount > 0 && requestedPage !== page) {
      setSearchParams({ page: String(page) }, { replace: true });
    }
  }, [page, pageCount, requestedPage, setSearchParams]);

  const handlePageChange = ({ selected }) => {
    setSearchParams({ page: String(selected + 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            {t.projects.listTitle}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-body leading-7 text-zinc-600">
            {t.projects.listDescription}
          </p>
        </div>

        {loading && projects.length === 0 && !errorType && (
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="aspect-3/2 animate-pulse rounded-3xl bg-zinc-200" />
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
        {errorType && projects.length === 0 && <ErrorState type={errorType} onRetry={retry} />}
        {errorType && projects.length > 0 && (
          <p role="alert" className="mb-4 text-small text-zinc-500">
            {t.errors.stale}{" "}
            <button type="button" onClick={retry} className="font-medium text-[#ff4d00] underline">
              {t.errors.retry}
            </button>
          </p>
        )}

        <div className={`grid gap-x-6 gap-y-14 transition-opacity duration-300 sm:grid-cols-2 ${loading ? "opacity-50" : "opacity-100"}`}>
          {visibleProjects.map((project) => (
            <div key={project.id} data-aos="fade-up" data-aos-duration="700" data-aos-offset="30">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>

        {pageCount > 1 && (
          <ReactPaginate
            forcePage={page - 1}
            pageCount={pageCount}
            onPageChange={handlePageChange}
            pageRangeDisplayed={2}
            marginPagesDisplayed={1}
            previousLabel={t.projects.prev}
            nextLabel={t.projects.next}
            breakLabel="…"
            renderOnZeroPageCount={null}
            ariaLabelBuilder={(pageNumber) => `${t.projects.page} ${pageNumber}`}
            previousAriaLabel={t.projects.prev}
            nextAriaLabel={t.projects.next}
            containerClassName="mt-16 flex flex-wrap items-center justify-center gap-2"
            pageLinkClassName={`${pageBase} ${focusRing}`}
            activeLinkClassName="bg-[#ff4d00]! text-white! ring-[#ff4d00]!"
            previousLinkClassName={`${pageBase} px-5 ${focusRing}`}
            nextLinkClassName={`${pageBase} px-5 ${focusRing}`}
            breakClassName="px-1 text-zinc-400"
            disabledClassName="pointer-events-none opacity-40"
          />
        )}
      </div>
    </section>
  );
}