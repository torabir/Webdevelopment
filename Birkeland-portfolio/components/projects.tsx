"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { projectsData } from "@/lib/data";
import Project from "./project";
import { useSectionInView } from "@/lib/hooks";

export default function Projects() {
  const { ref } = useSectionInView("Projects", 0.5);

  return (
    <section ref={ref} id="projects" className="scroll-mt-28 mb-28">
      <SectionHeading>My projects</SectionHeading>

      <p className="mb-6">
        I’ve selected a few projects that reflect my skills and interests. For a
        full overview, visit my{" "}
        <a
          href="https://github.com/torabir"
          target="_blank"
          rel="noopener noreferrer"
          className="
      inline-block
      font-medium
      underline underline-offset-4 decoration-gray-400
      text-gray-900
      transition
      hover:text-gray-950
      hover:decoration-gray-600
      hover:-translate-y-[1px]
      hover:scale-[1.05]
      dark:text-white
      dark:hover:text-white
    "
        >
          GitHub
        </a>
        .
      </p>

      <div>
        {projectsData.map((project, index) => (
          <React.Fragment key={index}>
            <Project {...project} />
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
