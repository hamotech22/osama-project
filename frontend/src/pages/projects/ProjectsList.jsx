import { useEffect, useState } from "react";
import axios from "axios";
import ProjectCard from "./ProjectCard";
import useLanguage from "../../context/useLanguage";
// const STRAPI_URL = "http://localhost:1337";


const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

export default function ProjectsList() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios
      .get(`${STRAPI_URL}/api/my-projects?populate[image]=true`)
      .then((response) => setProjects(response.data?.data ?? response.data))
      .catch((error) => console.error("Failed to load projects:", error));
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
            {t.projects.listTitle}
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-body leading-7 text-zinc-600">
            {t.projects.listDescription}
          </p>
        </div>

        {/* Project cards */}
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} data-aos="fade-up" data-aos-duration="700" data-aos-offset="30">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}