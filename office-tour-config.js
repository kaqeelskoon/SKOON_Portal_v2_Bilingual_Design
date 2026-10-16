/* Activate a destination by replacing null with its page path.
   Example: projects: { en: 'projects.html', ar: 'projects.html' }
   The current language is appended automatically as ?lang=en or ?lang=ar.
   Keep null until that destination is available. Never put credentials here. */
window.SKOON_OFFICE_CONFIG = {
  version: '1.1.0',
  website: 'index.html',
  autoplay: true,
  links: {
    projects: { en: 'reception.html?view=projects', ar: 'reception.html?view=projects' },
    client: { en: 'reception.html?view=client', ar: 'reception.html?view=client' },
    tender: { en: 'reception.html?view=tender', ar: 'reception.html?view=tender' },
    meeting: { en: 'reception.html?view=meeting', ar: 'reception.html?view=meeting' },
    team: { en: 'reception.html?view=team', ar: 'reception.html?view=team' },
    assistant: { en: 'reception.html?view=assistant', ar: 'reception.html?view=assistant' }
  }
};
