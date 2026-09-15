import * as base from '@jsonresume/jsonresume-theme-consultant-polished/dist';

// Sections in the base theme have no stable class names (styled-components
// hashes), so a small script tags each <section> with its <h2> title. It runs
// before Puppeteer prints, so the attribute selectors below work in the PDF.
const sectionTagger = `
<script>
  document.querySelectorAll('section > h2').forEach((h2) => {
    h2.parentElement.setAttribute('data-section', h2.textContent.trim());
  });
</script>
`;

// Print CSS the base theme lacks: keep each entry (a direct div child of a
// section), each bullet, and each section heading together across page breaks.
const printStyles = `
<style>
  @page {
    margin-top: 0.55in;
    margin-bottom: 0.55in;
  }
  @media print {
    section > div {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    h2 {
      break-after: avoid;
      page-break-after: avoid;
    }
    h3 {
      break-after: avoid;
      page-break-after: avoid;
    }
    li {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    section[data-section="Education"] {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }

  /* Render interests as a plain bulleted list instead of heading-style grid items. */
  section[data-section="Interests"] > div {
    display: block;
  }
  section[data-section="Interests"] > div > div {
    display: list-item;
    list-style: disc outside;
    margin: 0 0 0.5rem 1.5rem;
  }
  section[data-section="Interests"] h3 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
    font-size: 1rem;
    font-weight: 400;
    color: #444;
    line-height: 1.6;
    margin: 0;
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

export const render = async (resume) => {
  const html = await base.render(fixDates(resume));
  return html
    .replace('</head>', `${printStyles}</head>`)
    .replace('</body>', `${sectionTagger}</body>`);
};
