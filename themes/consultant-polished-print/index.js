import * as base from '@jsonresume/jsonresume-theme-consultant-polished/dist';

// Sections in the base theme have no stable class names (styled-components
// hashes), so a small script tags the landmarks the CSS below needs. It also
// lifts each entry's company/institution line up into the header row, so the
// title, employer and dates render as a single line. Doing that move in the
// DOM (rather than with grid/flex reordering) keeps every entry an ordinary
// block, which is what lets Chromium split one across a page break.
const domTagger = `
<script>
  (() => {
    const layout = document.querySelector('body > div');
    if (layout) layout.setAttribute('data-layout', '');

    const hero = document.querySelector('header');
    if (hero) hero.setAttribute('data-hero', '');

    document.querySelectorAll('section > h2').forEach((h2) => {
      h2.parentElement.setAttribute('data-section', h2.textContent.trim());
    });

    const oneLine = 'section[data-section="Experience"] > div, section[data-section="Education"] > div';
    document.querySelectorAll(oneLine).forEach((entry) => {
      const header = entry.firstElementChild;
      const company = header && header.nextElementSibling;
      if (!header || !company || company.tagName !== 'DIV') return;
      company.setAttribute('data-company', '');
      // The date is the header's last child; keep it there so it stays right-aligned.
      header.insertBefore(company, header.lastElementChild);
    });
  })();
</script>
`;

// The base theme is styled for the web: generous headings and 2-2.5rem gaps
// between every block. This tightens the vertical rhythm for print and adds
// the page-break rules the base theme lacks.
const printStyles = `
<style>
  html {
    font-size: 15px;
    line-height: 1.45;
  }

  [data-layout] {
    max-width: none;
    padding: 0;
  }

  /* Header */
  [data-hero] {
    margin-bottom: 1.1rem;
    padding-bottom: 0.6rem;
  }
  [data-hero] h1 {
    font-size: 2rem;
    margin-bottom: 0.15rem;
  }
  [data-hero] p {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
  [data-hero] > div {
    gap: 1rem;
  }

  /* Sections */
  section[data-section] {
    margin-bottom: 1rem;
  }
  section[data-section] > h2 {
    font-size: 1.15rem;
    margin-bottom: 0.45rem;
    padding-bottom: 0.15rem;
  }

  /* The summary needs no "Profile" label — the header's own rule already sits
     directly above it, so collapse the heading away entirely rather than
     stacking a second rule 25px under the first. */
  section[data-section="Profile"] > h2 {
    font-size: 0;
    line-height: 0;
    margin: 0;
    padding: 0;
    border-bottom: none;
  }
  section[data-section="Profile"] p {
    font-size: 1rem;
    line-height: 1.5;
  }

  /* Entry header: <title> · <company> ............ <dates> on one line. */
  section[data-section="Experience"] > div,
  section[data-section="Education"] > div {
    margin-bottom: 0.7rem;
  }
  section[data-section="Experience"] > div > div:first-child,
  section[data-section="Education"] > div > div:first-child {
    justify-content: flex-start;
    align-items: baseline;
    flex-wrap: nowrap;
    gap: 0.35rem;
    margin-bottom: 0.15rem;
  }
  section[data-section="Experience"] h3,
  section[data-section="Education"] h3 {
    font-size: 1rem;
    margin: 0;
    white-space: nowrap;
  }
  section[data-section] [data-company] {
    font-size: 0.95rem;
    margin: 0;
  }
  section[data-section] [data-company]:not(:empty)::before {
    content: "· ";
    color: #999;
  }
  /* The date range: last child of the header row. */
  section[data-section="Experience"] > div > div:first-child > div:last-child,
  section[data-section="Education"] > div > div:first-child > div:last-child {
    margin-left: auto;
    padding-left: 0.75rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  /* Entry body */
  section[data-section="Experience"] p {
    margin-bottom: 0.2rem;
  }
  section[data-section="Experience"] ul {
    margin-top: 0.2rem;
    padding-left: 1.1rem;
  }
  section[data-section="Experience"] li {
    margin-bottom: 0.12rem;
    line-height: 1.45;
  }

  /* Skills */
  section[data-section="Skills"] > div {
    gap: 0.5rem 1.5rem;
  }
  section[data-section="Skills"] > div > div {
    margin-bottom: 0.25rem;
  }
  section[data-section="Skills"] h3 {
    font-size: 0.95rem;
    margin-bottom: 0.1rem;
  }

  /* Render interests as a plain bulleted list instead of heading-style grid items. */
  section[data-section="Interests"] > div {
    display: block;
  }
  section[data-section="Interests"] > div > div {
    display: list-item;
    list-style: disc outside;
    margin: 0 0 0.3rem 1.5rem;
  }
  section[data-section="Interests"] h3 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: #444;
    line-height: 1.45;
    margin: 0;
  }

  /* Page breaks. Entries are allowed to split across pages — forbidding it
     strands half a page of whitespace whenever the next entry is tall. What
     must not happen is a heading or a title line breaking away from the text
     it introduces, or a single line being left behind on its own. */
  @media print {
    h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
    }
    li {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    p, ul {
      orphans: 2;
      widows: 2;
    }
    section[data-section="Education"] > div {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
</style>
`;

// The base theme formats dates with new Date('YYYY-MM-DD'), which parses as
// UTC midnight and displays a month early in timezones west of UTC. Anchoring
// each date to local noon keeps the calendar day intact everywhere.
const toLocalNoon = (value) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? `${value}T12:00:00`
    : value;

const fixDates = (node) => {
  if (Array.isArray(node)) return node.map(fixDates);
  if (node && typeof node === 'object') {
    return Object.fromEntries(
      Object.entries(node).map(([key, value]) => [
        key,
        key === 'startDate' || key === 'endDate' ? toLocalNoon(value) : fixDates(value),
      ])
    );
  }
  return node;
};

// Read by resumed and passed straight to Puppeteer's page.pdf().
export const pdfRenderOptions = {
  format: 'letter',
  printBackground: true,
  margin: {
    top: '0.45in',
    bottom: '0.45in',
    left: '0.5in',
    right: '0.5in',
  },
};

export const render = async (resume) => {
  const html = await base.render(fixDates(resume));
  return html
    .replace('</head>', `${printStyles}</head>`)
    .replace('</body>', `${domTagger}</body>`);
};
