import React from "react";
import { CgWorkAlt } from "react-icons/cg";
import { FaReact } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
// import corpcommentImg from "@/public/corpcomment.png";
// import rmtdevImg from "@/public/rmtdev.png";
// import wordanalyticsImg from "@/public/wordanalytics.png";
import {
  prosjekt1,
  prosjekt2,
  prosjekt3,
  prosjekt4,
  prosjekt5,
} from "@/public/index";

export const links = [
  {
    name: "Home",
    hash: "#home",
  },
  {
    name: "About",
    hash: "#about",
  },
  {
    name: "Projects",
    hash: "#projects",
  },
  {
    name: "Skills",
    hash: "#skills",
  },
  {
    name: "Experience",
    hash: "#experience",
  },
  {
    name: "Contact",
    hash: "#contact",
  },
] as const;

export const experiencesData = [
  {
    title: "Bachelor Thesis – Industry Collaboration",
    location: "NTNU Trondheim",
    description:
      "Bachelor thesis on vulnerability and risk assessment in the marine aquaculture industry, conducted in collaboration with industry consultants (Bouvet).",
    icon: React.createElement(LuGraduationCap),
    date: "2025 – 2026",
  },
  {
    title: "BSc Digital Infrastructure & Cybersecurity",
    location: "NTNU Trondheim",
    description:
      "Focus on digital infrastructure, cloud platforms, networking, and cybersecurity, with an emphasis on practical and industry-relevant skills. Exchange semester in South Korea.",
    icon: React.createElement(LuGraduationCap),
    date: "2023 – Present",
  },
  {
    title: "Tour Manager / Stage Manager",
    location: "The Entertainment Company AS",
    description:
      "Planned and coordinated touring operations for a commercial performing artist, including logistics, scheduling, on-site coordination, and financial settlements.",
    icon: React.createElement(CgWorkAlt),
    date: "2021 – 2022",
  },
  {
    title: "Production & Project Coordination",
    location: "NRK (National Television)",
    description:
      "Worked across multiple productions with responsibilities in coordination, planning, stakeholder communication, and editorial support.",
    icon: React.createElement(CgWorkAlt),
    date: "2019 – 2021",
  },
  {
    title: "Bachelor in Project Management",
    location: "Westerdals Oslo ACT",
    description:
      "Studied project leadership, coordination, and collaboration in creative and professional settings.",
    icon: React.createElement(LuGraduationCap),
    date: "2016 – 2019",
  },
  {
    title: "One-year Programme in Economics & Management",
    location: "OsloMet",
    description:
      "Introductory studies in economics, management, organization, and decision-making.",
    icon: React.createElement(LuGraduationCap),
    date: "2015 – 2016",
  },
  {
    title: "Military Service",
    location: "Norwegian Armed Forces",
    description:
      "Completed mandatory military service with responsibility and structured team-based work.",
    icon: React.createElement(CgWorkAlt),
    date: "2013 – 2014",
  },
] as const;

export const projectsData = [
  {
    title: "COMMING SOON",
    description: "COMING SOON",
    tags: ["Secret Project", "Classified", "Top Secret"],
    imageUrl: prosjekt1,
    href: "https://github.com/torabir",
    links: [],
  },
  {
    title: "Elden Ring Wiki",
    description:
      "A full-stack web application developed as a group project and graded A, which I deployed on a self-managed VPS using nginx, MySQL, and a Node.js backend.",
    tags: ["Full-Stack", "React", "Node.js", "MySQL", "nginx", "Linux"],
    imageUrl: prosjekt2,
    href: "http://49.13.229.6",
    links: [],
  },

  {
    title: "Security Risk Analysis (NTNU)",
    description:
      "Academic security risk analysis from the NTNU course Risk Management. Based on a fictional case and graded A.",
    tags: ["Risk Management", "Infosec", "ISO 27001", "ISMS"],
    imageUrl: prosjekt3,
    href: "https://raw.githubusercontent.com/torabir/academic-security-case-studies/main/Risikoanalyse%20helsesektor%20fiktiv%20case%20utdrag.pdf",
    links: [],
  },
  {
    title: "NRK TV-aksjonen",
    description:
      "Held main responsibility for the fundraising auction at NRK TV-aksjonen (2021), including planning and stakeholder communication.",
    tags: ["NRK", "Project coordination", "Stakeholders", "Fundraising"],
    imageUrl: prosjekt4,
    href: "https://www.nrk.no/tvaksjonen/tv-aksjonens-auksjon_-se-hva-du-kan-by-pa-1.15693567",
    links: [],
  },
  {
    title: "NRK TV-aksjonen",
    description:
      "In 2020, the TV-aksjonen was carried out as a fully digital campaign, raising over NOK 239 million for WWF’s work against plastic pollution in the oceans.",
    tags: ["NRK", "Digital campaign", "Fundraising results", "WWF"],
    imageUrl: prosjekt5,
    href: "https://www.nrk.no/presse/239-millioner-samlet-inn-i-2020-1.15205526",
    links: [],
  },
] as const;

export const skillsData = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Git",

  "Linux / Bash",
  "Operating Systems (C)",
  "Docker",
  "Kubernetes (basic)",
  "Microsoft Azure",
  "OpenStack",
  "Infrastructure as Code (Terraform)",
  "Virtualization",

  "SQL (MySQL)",
  "REST APIs",
  "Firebase",

  "Risk Analysis",
  "Threat Modeling",
  "Vulnerability Assessment",
  "Security Controls",
  "Identity & Access Management (basic)",

  "Networking Fundamentals",
  "Wireshark",
  "Cisco Packet Tracer",

  "Software Development (Agile/Scrum)",
  "Slack",
  "Microsoft Teams + 365",
  "Google Workspace",
] as const;
