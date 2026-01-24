"use client";

import React from "react";
import SectionHeading from "./section-heading";
import { motion } from "framer-motion";
import { useSectionInView } from "@/lib/hooks";

export default function About() {
  const { ref } = useSectionInView("About");

  return (
    <motion.section
      ref={ref}
      className="mb-28 max-w-[45rem] text-center leading-8 sm:mb-40 scroll-mt-28"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.175 }}
      id="about"
    >
      <SectionHeading>About me</SectionHeading>

      <p className="mb-3">
        I am <span className="font-medium">Tor Arne Birkeland</span>, a
        final-year bachelor’s student in{" "}
        <span className="font-medium">
          Digital Infrastructure and Cybersecurity
        </span>{" "}
        at NTNU Trondheim.
      </p>

      <p className="mb-3">
        Prior to my current studies, I worked on large-scale (and small)
        productions and live projects within{" "}
        <span className="font-medium">NRK (national television)</span>, where I
        was involved in coordination, planning, stakeholder communication, and
        editorial support. I also hold a{" "}
        <span className="font-medium">
          bachelor’s degree in Project Management
        </span>
        , which has shaped how I approach structure, collaboration, and
        delivery.
      </p>

      <p className="mb-3">
        My interest in technology has always been there, but became professional
        when I started building websites in my spare time — first for myself,
        and later for others. This gradually led me from web development into{" "}
        <span className="font-medium">
          infrastructure, cloud platforms, and cybersecurity
        </span>
        .
      </p>

      <p className="mb-3">
        I currently focus on{" "}
        <span className="font-medium">
          cybersecurity, cloud infrastructure, and risk analysis
        </span>
        , and am completing my bachelor thesis on vulnerability and risk
        assessment in the marine aquaculture industry, in collaboration with
        industry consultants.
      </p>

      <p>
        <span className="italic">Outside of tech</span>, I enjoy music
        production, working out, hiking, gaming, and film. I am calm,
        structured, creative and curious, and I thrive in environments that
        value learning and thoughtful problem-solving.
      </p>
    </motion.section>
  );
}
