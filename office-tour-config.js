/* Activate a destination by replacing null with its page path.
   Example: projects: { en: 'projects.html', ar: 'projects.html' }
   The current language is appended automatically as ?lang=en or ?lang=ar.
   Keep null until that destination is available. Never put credentials here. */
window.SKOON_OFFICE_CONFIG = {
  version: '1.0.0',
  website: 'index.html',
  autoplay: true,
  links: {
    projects: { en: null, ar: null },
    client: { en: null, ar: null },
    tender: { en: null, ar: null },
    meeting: { en: null, ar: null },
    team: { en: null, ar: null },
    assistant: { en: null, ar: null }
  }
};
