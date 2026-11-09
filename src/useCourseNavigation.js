import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { createNavigation } from './navigation.js';
import { parseRoute, routeTitle } from './course-route.js';
import { browserStorage, draftKey, readDraft, writeDraft } from './study-drafts.js';
import { SECTION_LABELS } from './study-target.js';

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function jumpTo(id, { instant = false } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;
  for (let parent = el.parentElement; parent; parent = parent.parentElement) {
    if (parent.tagName === 'DETAILS') parent.open = true;
  }
  if (el.tagName === 'DETAILS') el.open = true;
  const heading = el.matches('h1,h2,h3,summary') ? el : el.querySelector('h1,h2,h3,summary') || el;
  if (!heading.matches('a,button,summary,[tabindex]')) heading.tabIndex = -1;
  heading.focus({ preventScroll: true });
  el.scrollIntoView({ block: 'start', behavior: instant || reducedMotion() ? 'instant' : 'smooth' });
  return true;
}

export function useCourseNavigation(owner, terms) {
  const readPath = () => {
    const path = location.hash.slice(1) || '/';
    if (path !== '/checkin') return path;
    const url = new URL(location.href);
    url.hash = '/account';
    history.replaceState(history.state, '', url);
    return '/account';
  };
  const path = ref(readPath()),
    current = computed(() => parseRoute(path.value, terms));
  const navigating = ref(false),
    pageContent = ref(null),
    storage = browserStorage();
  const resumeKey = (account) => draftKey(account, 'latest', 'resume');
  function readResume(account) {
    const value = readDraft(resumeKey(account), storage);
    const route = value?.path && parseRoute(value.path, terms);
    return route && (['learn', 'boss'].includes(route.view) || (route.view === 'java' && route.topic))
      ? value
      : null;
  }
  const resume = ref(readResume(owner.value));
  const nativeRestoration = window.history.scrollRestoration;
  if (nativeRestoration) window.history.scrollRestoration = 'manual';
  const placeKey = (url, account) => draftKey(account, parseRoute(url, terms).path, 'reading-position');
  const remembers = (url) =>
    ['learn', 'boss'].includes(parseRoute(url, terms).view) ||
    (parseRoute(url, terms).view === 'java' && !!parseRoute(url, terms).topic);
  let scrollSave, togglesCleanup, headerObserver;
  function savePlace(url = path.value, account = owner.value) {
    if (!remembers(url)) return;
    const details = pageContent.value?.querySelectorAll('details[data-study-place]') || [];
    const disclosures = Object.fromEntries(Array.from(details, (e) => [e.dataset.studyPlace, e.open]));
    writeDraft(
      placeKey(url, account),
      { y: Math.max(0, Math.round(window.scrollY)), disclosures },
      storage,
    );
    const sections = [...(pageContent.value?.querySelectorAll('[data-study-section]') || [])];
    const section = sections.filter((e) => e.getBoundingClientRect().top < innerHeight * 0.5).at(-1);
    const lab = pageContent.value?.querySelector('[data-trace-step]');
    const step = section?.id === 'lesson-experiment' ? Number(lab?.dataset.traceStep) : null;
    const route = parseRoute(url, terms);
    const value = {
      path: route.path,
      title: routeTitle(route).replace(' · 算法之旅', ''),
      label:
        (section?.dataset.studyLabel || SECTION_LABELS[section?.id] || '讲解') +
        (Number.isInteger(step) ? ' · 第 ' + (step + 1) + ' 步' : ''),
      when: Date.now(),
    };
    writeDraft(resumeKey(account), value, storage);
    if (account === owner.value) resume.value = value;
  }
  function onScroll() {
    const url = path.value,
      account = owner.value;
    if (!remembers(url)) return;
    clearTimeout(scrollSave);
    scrollSave = setTimeout(() => {
      if (url === path.value && account === owner.value) savePlace(url, account);
    }, 180);
  }
  const onHide = () => savePlace();
  const alignNav = () => {
    const nav = pageContent.value?.querySelector('.lesson-nav'),
      selected = nav?.querySelector('[aria-current="page"]');
    if (!selected || nav.scrollWidth <= nav.clientWidth) return;
    const left =
      selected.getBoundingClientRect().left -
      nav.getBoundingClientRect().left +
      nav.scrollLeft -
      (nav.clientWidth - selected.clientWidth) / 2;
    nav.scrollTo({ left, behavior: reducedMotion() ? 'instant' : 'smooth' });
  };
  async function focusPage() {
    clearTimeout(scrollSave);
    const url = path.value,
      account = owner.value,
      place = remembers(url) ? readDraft(placeKey(url, account), storage) : null;
    document.title = routeTitle(current.value);
    await nextTick();
    if (!pageContent.value?.querySelector('h1')) {
      await new Promise((resolve) => {
        const observer = new MutationObserver(() => {
          if (pageContent.value?.querySelector('h1')) {
            observer.disconnect();
            clearTimeout(limit);
            resolve();
          }
        });
        const limit = setTimeout(() => {
          observer.disconnect();
          resolve();
        }, 5000);
        if (pageContent.value) observer.observe(pageContent.value, { childList: true, subtree: true });
        else {
          clearTimeout(limit);
          resolve();
        }
      });
    }
    await new Promise(requestAnimationFrame);
    if (url !== path.value || account !== owner.value) return;
    togglesCleanup?.();
    const details = Array.from(pageContent.value?.querySelectorAll('details[data-study-place]') || []);
    for (const el of details) {
      const open = place?.disclosures?.[el.dataset.studyPlace];
      if (typeof open === 'boolean') el.open = open;
      el.addEventListener('toggle', onScroll);
    }
    togglesCleanup = () => {
      for (const el of details) el.removeEventListener('toggle', onScroll);
    };
    const located =
      current.value.target?.section && jumpTo(current.value.target.section, { instant: true });
    if (!located) window.scrollTo({ top: Number.isFinite(place?.y) ? place.y : 0, behavior: 'instant' });
    const target = pageContent.value?.querySelector('h1') || pageContent.value;
    if (target) {
      target.tabIndex = -1;
      target.focus({ preventScroll: true });
    }
    alignNav();
    if (current.value.view === 'search')
      pageContent.value?.querySelector('input[type="search"]')?.focus({ preventScroll: true });
    // Save the newly entered lesson only after the old page's position was captured.
    savePlace(url, account);
  }
  const navigation = createNavigation({
    current: () => path.value,
    reducedMotion,
    pending: (value) => {
      navigating.value = value;
    },
    commit: (url) => {
      savePlace();
      const target = new URL(location.href);
      target.hash = url;
      history.pushState({}, '', target);
      path.value = url;
      focusPage();
    },
  });
  function go(url) {
    navigation.request(url === '/checkin' ? '/account' : url);
  }
  function onHash() {
    const url = readPath();
    if (url === path.value) return;
    navigation.cancel();
    savePlace();
    path.value = url;
    focusPage();
  }
  watch(owner, (_next, previous) => {
    savePlace(path.value, previous);
    resume.value = readResume(owner.value);
    focusPage();
  });
  onMounted(() => {
    window.addEventListener('hashchange', onHash);
    window.addEventListener('popstate', onHash);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pagehide', onHide);
    window.addEventListener('blur', onHide);
    window.addEventListener('storage', onResumeStorage);
    window.addEventListener('keydown', searchShortcut);
    window.addEventListener('study-activity', onScroll);
    const header = document.querySelector('.header');
    if (header && typeof ResizeObserver !== 'undefined') {
      const size = () =>
        document.documentElement.style.setProperty(
          '--header-offset',
          Math.ceil(header.getBoundingClientRect().height) + 'px',
        );
      headerObserver = new ResizeObserver(size);
      headerObserver.observe(header);
      size();
    }
    focusPage();
  });
  onUnmounted(() => {
    savePlace();
    togglesCleanup?.();
    clearTimeout(scrollSave);
    navigation.cancel();
    headerObserver?.disconnect();
    document.documentElement.style.removeProperty('--header-offset');
    if (nativeRestoration) history.scrollRestoration = nativeRestoration;
    window.removeEventListener('hashchange', onHash);
    window.removeEventListener('popstate', onHash);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pagehide', onHide);
    window.removeEventListener('blur', onHide);
    window.removeEventListener('storage', onResumeStorage);
    window.removeEventListener('keydown', searchShortcut);
    window.removeEventListener('study-activity', onScroll);
  });
  const refreshResume = () => {
    resume.value = readResume(owner.value);
  };
  function onResumeStorage(event) {
    if (event.key === resumeKey(owner.value)) resume.value = readResume(owner.value);
  }
  function searchShortcut(event) {
    const typing = event.target?.closest?.('input,textarea,[contenteditable="true"]');
    if (
      (event.key.toLowerCase() === 'k' && (event.ctrlKey || event.metaKey)) ||
      (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey)
    ) {
      event.preventDefault();
      savePlace();
      if (current.value.view === 'search')
        document
          .querySelector('.search-page input, .search-page-container input, input[type="search"]')
          ?.focus();
      else go('/search');
    }
  }
  return { path, current, go, navigating, pageContent, resume, refreshResume };
}
