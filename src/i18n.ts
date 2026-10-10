// English lives at /, Chinese at /zh/. Every page exists in both.
export type Lang = 'en' | 'zh';

export function getLang(url: URL): Lang {
  return url.pathname === '/zh' || url.pathname.startsWith('/zh/') ? 'zh' : 'en';
}

/** Prefix an English path for the given language: localize('zh', '/contact/') → '/zh/contact/'. */
export function localize(lang: Lang, path: string) {
  return lang === 'zh' ? `/zh${path}` : path;
}

/** The same page in the other language. */
export function alternatePath(url: URL) {
  const { pathname } = url;
  return getLang(url) === 'zh' ? pathname.replace(/^\/zh/, '') || '/' : `/zh${pathname}`;
}

export const ui = {
  en: {
    htmlLang: 'en',
    ogLocale: 'en_US',
    siteTitle: 'Léon — Issue Nº 01',
    description:
      'Yang (Léon) Li — Ph.D. candidate at Université de Montréal researching the trajectories, energy use, and observability of AI agents. Projects and writing.',
    place: 'MONTRÉAL, QC',
    switchLabel: '中文',
    switchHreflang: 'zh-CN',
    toDark: 'Dark',
    toLight: 'Light',
    themeAria: 'Toggle dark mode',
    nav: { about: 'About', projects: 'Projects', writing: 'Writing', contact: 'Contact' },
    colophon: 'Colophon — set in Fraunces, Inter & JetBrains Mono.',
    email: 'Email',
    writingTitle: 'Writing',
    writingSub: '— notes & essays',
    writingKicker: 'Blog',
    allWriting: 'All writing →',
    backToWriting: '← All writing',
    entries: 'entries',
    empty: 'The first notes are being written. Check back soon.',
    minutes: (n: number) => `${n} min`,
    read: 'read',
    draft: 'Draft',
    kinds: { Essay: 'Essay', Research: 'Research', Notes: 'Notes' },
  },
  zh: {
    htmlLang: 'zh-CN',
    ogLocale: 'zh_CN',
    siteTitle: 'Léon — 第 01 期',
    description:
      'Yang (Léon) Li — 蒙特利尔大学计算机博士候选人，研究 AI Agent 的运行轨迹、能耗与可观测性验证。项目与写作。',
    place: '蒙特利尔',
    switchLabel: 'EN',
    switchHreflang: 'en',
    toDark: '夜间',
    toLight: '日间',
    themeAria: '切换夜间模式',
    nav: { about: '关于', projects: '项目', writing: '写作', contact: '联系' },
    colophon: '版权页 — 字体：Fraunces、Inter、JetBrains Mono 与思源宋体。',
    email: '邮箱',
    writingTitle: '写作',
    writingSub: '— 笔记与随笔',
    writingKicker: '博客',
    allWriting: '全部文章 →',
    backToWriting: '← 全部文章',
    entries: '篇',
    empty: '第一批笔记正在写作中，敬请期待。',
    minutes: (n: number) => `${n} 分钟`,
    read: '阅读',
    draft: '草稿',
    kinds: { Essay: '随笔', Research: '研究', Notes: '笔记' },
  },
} as const;
