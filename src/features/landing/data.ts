export const FRAMEWORKS = [
  'Express', 'NestJS', 'Go', 'Laravel', 'FastAPI',
  'Hono', 'Koa', 'Fastify', 'Django', 'Rails',
];

export const ENDPOINTS = [
  { method: 'GET', path: '/api/users', confidence: 100 },
  { method: 'POST', path: '/api/auth/login', confidence: 100 },
  { method: 'PUT', path: '/api/users/:id', confidence: 95 },
  { method: 'DELETE', path: '/api/users/:id', confidence: 88 },
  { method: 'GET', path: '/api/products', confidence: 100 },
  { method: 'POST', path: '/api/orders', confidence: 84 },
] as const;

export const METHOD_COLOR: Record<string, string> = {
  GET: '#61AFFE', POST: '#49CC90', PUT: '#FCA130', DELETE: '#F93E3E',
};

export type ProblemRow = {
  text: string;
  label: string;
  /** Shown when the row is expanded—ties the pain to the product. */
  payoff: string;
};

export const PROBLEM_ROWS: ProblemRow[] = [
  {
    text: 'Written docs are missing or outdated. Only the code tells the truth.',
    label: 'Docs you cannot trust',
    payoff:
      'Rauts reads your project and lists the exact endpoints your code actually exposes.',
  },
  {
    text: 'Routes are scattered across files. There is no single view of the API.',
    label: 'Everything is scattered',
    payoff:
      'Rauts pulls every route into a single searchable, shareable view.',
  },
  {
    text: 'Simple questions mean Slack, meetings, or digging through the repo.',
    label: "Knowledge in people's heads",
    payoff:
      'Get instant answers about your endpoints without waiting on who wrote them.',
  },
];

export const DEMO_BENEFITS = [
  'No changes to your code',
  'Picks up your framework on its own',
  'Results in a few seconds on most projects',
];

export const HOW_IT_WORKS = [
  { step: '01', title: 'Run one command', cmd: 'npm rauts scan', desc: 'Run it in your project folder. No install or config file needed.' },
  { step: '02', title: 'We find your routes', cmd: 'Parsing routes...', desc: 'We detect your framework and walk the code to find each API route.' },
  { step: '03', title: 'See your API', cmd: 'Schema ready ✓', desc: 'You get a clear list of endpoints, ready to browse or export.' },
];

export const FEATURE_TILES: [string, string][] = [
  ['GitHub import', 'Connect your repository and scan in the cloud. We email you when your schema is ready.'],
  ['Fast scans', 'Scan your entire project locally or in the cloud in just a few seconds.'],
  ['Many frameworks', 'Works out-of-the-box with Express, NestJS, Go, Django, Laravel, and more.'],
  ['Confidence scores', 'See which endpoints are fully verified and which ones need a second look.'],
  ['Real codebases', 'Built to handle complex folder structures, messy logic, and legacy patterns.'],
];

export const AUDIENCE_ROWS: [string, string][] = [
  ['Teams with large or old APIs', 'See every route without reading every file.'],
  ['New hires and contractors', 'Get oriented before your first PR.'],
  ['Teams with weak or no docs', 'Turn the code into a shared API overview.'],
];

export const ROADMAP = [
  { q: 'Live', title: 'GitHub scanning', desc: 'Connect GitHub, pick a repo, and scan in the cloud. We email you when your endpoints are ready.' },
  { q: 'Q3 2026', title: 'OpenAPI Export', desc: 'Generate and download complete OpenAPI/Swagger schemas in one click to import into Postman or custom docs.' },
  { q: 'Q4 2026', title: 'Change history', desc: 'See how your API changed over time with visual endpoint diffs and release notes.' },
];
