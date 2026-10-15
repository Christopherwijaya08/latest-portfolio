import photo from '../assets/profile.jpeg'

export const profile = {
  name: 'Christopher Wijaya',
  role: 'Full-stack & mobile developer',
  location: 'Medan, Indonesia',
  email: 'cwcwchristopher@gmail.com',
  cv: './christopher-wijaya-cv.pdf',
  photo,
  summary:
    'Three years building and maintaining web and mobile apps for distribution, retail, HR and finance teams. Angular and React on the front, REST APIs in Laravel, FastAPI and ASP.NET behind them, Flutter when the work happens away from a desk.',
}

export type ProjectId = 'ice' | 'hris' | 'esim' | 'pos' | 'fx'

export type Project = {
  id: ProjectId
  name: string
  kind: string
  description: string
  features: string[]
  stack: string[]
}

export const projects: Project[] = [
  {
    id: 'ice',
    name: 'Ice Tracker',
    kind: 'Web admin + driver mobile app',
    description:
      'Drivers log every drop-off from a Flutter app. The admin dashboard shows where each truck is, how much ice is left in the cold store, and what the day earned.',
    features: ['Live truck tracking per route', 'Ice stock in and out', 'Financial reports', 'Driver attendance'],
    stack: ['Laravel', 'Flutter'],
  },
  {
    id: 'hris',
    name: 'HRIS Management System',
    kind: 'Web app',
    description:
      'Employee records, attendance and leave in one place, so HR stops reconciling spreadsheets at the end of the month.',
    features: ['Employee directory', 'Attendance and leave', 'Role-based access'],
    stack: ['Angular', 'Bootstrap', 'Tailwind', 'TypeScript'],
  },
  {
    id: 'esim',
    name: 'Roamly eSIM Store',
    kind: 'E-commerce website',
    description:
      'Travellers pick a destination, choose a data plan and get their eSIM QR code right after checkout.',
    features: ['Plans by country and region', 'Checkout and payment', 'Instant QR delivery'],
    stack: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    id: 'pos',
    name: 'Supermarket POS',
    kind: 'Point of sale',
    description:
      'A cashier screen built for queues: barcode scanning, quick discounts and receipts, with stock updating as items sell.',
    features: ['Barcode checkout', 'Stock sync', 'Shift and sales reports'],
    stack: ['ASP.NET', 'jQuery', 'C#'],
  },
  {
    id: 'fx',
    name: 'Money Changer System',
    kind: 'Web app',
    description:
      'Tellers record buy and sell transactions against the day’s rates, and the owner sees currency balances and margin at closing.',
    features: ['Daily buy and sell rates', 'Transaction records', 'Currency balance reports'],
    stack: ['React', 'TypeScript', 'Tailwind'],
  },
]

export const experience = [
  {
    role: 'Fullstack Developer',
    company: 'Wilmar Consultancy Services',
    period: 'Jun 2026 — Present',
    points: [
      'Develop and maintain enterprise transportation and industrial applications in Java and ASP.NET.',
      'Diagnose and resolve production issues to keep systems stable and reliable.',
      'Work with cross-functional teams to ship and support releases.',
    ],
  },
  {
    role: 'Fullstack & Mobile Developer',
    company: 'UD. Aguaris',
    period: 'Sep 2024 — Present · Remote',
    points: [
      'Built an employee attendance and ice-distribution sales tracker with FastAPI, React and Flutter, including real-time attendance from mobile.',
      'Kept the API structure clean so web and mobile share the same data flow.',
    ],
  },
  {
    role: 'Fullstack & Mobile Developer (Intern)',
    company: 'PT. Capella',
    period: 'Jul 2024 — Dec 2024',
    points: [
      'Designed a sales monitoring system across Laravel (API), React (web) and Flutter (mobile).',
      'Shipped customer management, orders, down payments and multi-level approval flows.',
    ],
  },
  {
    role: 'Web Developer',
    company: 'PT. SumatraSarana Sekar Sakti',
    period: 'May 2023 — Jun 2026',
    points: [
      'Built and maintained HRIS, inventory, POS and project management systems in Angular + Bootstrap and React + Tailwind.',
      'Wrote reusable components that became the base for the team’s internal apps.',
    ],
  },
]

export const skills = [
  { group: 'Frontend', items: ['React', 'Angular', 'Next.js', 'TypeScript', 'Tailwind', 'Bootstrap'] },
  { group: 'Backend', items: ['Laravel', 'FastAPI / Python', 'Java', 'ASP.NET', 'RESTful API'] },
  { group: 'Mobile & data', items: ['Flutter', 'MySQL'] },
]

export const education = {
  degree: 'Bachelor’s degree in Informatics',
  school: 'Universitas Pelita Harapan',
  period: 'Aug 2021 — Dec 2024',
}
