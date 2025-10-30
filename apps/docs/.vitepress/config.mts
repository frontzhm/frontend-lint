import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  text: "前端编码规范",
  description: "前端编码规范",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: '首页', link: '/index.md' },
      {
        text: '编码规范',
        items: [
          { text: 'HTML 编码规范', link: '/coding/html.md' },
          { text: 'CSS 编码规范', link: '/coding/css.md' },
          { text: 'JavaScript 编码规范', link: '/coding/javascript.md' },
          { text: 'Typescript 编码规范', link: '/coding/typescript.md' },
          { text: 'Node 编码规范', link: '/coding/node.md' },
        ],
      },
      {
        text: '工程规范',
        items: [
          { text: 'Git 规范', link: '/engineering/git.md' },
          { text: '文档规范', link: '/engineering/doc.md' },
          { text: 'CHANGELOG 规范', link: '/engineering/changelog.md' },
        ],
      },
      {
        text: 'NPM包',
        items: [
          { text: 'eslint-config', link: '/npm/eslint.md' },
          { text: 'stylelint-config', link: '/npm/stylelint.md' },
          { text: 'commitlint-config', link: '/npm/commitlint.md' },
          { text: 'markdownlint-config', link: '/npm/markdownlint.md' },
          { text: 'eslint-plugin', link: '/npm/eslint-plugin.md' },
        ],
      },
      {
        text: '脚手架',
        items: [{ text: 'yan-lint', link: '/cli/yan-lint.md' }],
      },
    ],

    sidebar:[
      {
        text: '编码规范',
        items: [
          {
            text: 'HTML 编码规范',
            link: '/coding/html.md',
          },
          {
            text: 'CSS 编码规范',
            link: '/coding/css.md',
          },
          {
            text: 'JavaScript 编码规范',
            link: '/coding/javascript.md',
          },
          {
            text: 'Typescript 编码规范',
            link: '/coding/typescript.md',
          },
          {
            text: 'Node 编码规范',
            link: '/coding/node.md',
          },
        ],
      },
      {
        text: '工程规范',
        items: [
          {
            text: 'Git 规范',
            link: '/engineering/git.md',
          },
          {
            text: '文档规范',
            link: '/engineering/doc.md',
          },
          {
            text: 'CHANGELOG 规范',
            link: '/engineering/changelog.md',
          },
        ],
      },
      {
        text: 'NPM包',
        items: [
          { text: 'eslint-config', link: '/npm/eslint.md' },
          { text: 'stylelint-config', link: '/npm/stylelint.md' },
          { text: 'commitlint-config', link: '/npm/commitlint.md' },
          { text: 'markdownlint-config', link: '/npm/markdownlint.md' },
          { text: 'eslint-plugin', link: '/npm/eslint-plugin.md' },
        ],
      },
      {
        text: '脚手架',
        items: [{ text: 'fe-lint', link: '/cli/fe-lint.md' }],
      },
    ],
    footer: {
      message: '2025',
      copyright:
        'encode studio | <a href="https://github.com/frontzhm/frontend-lint" target="_blank">github</a>',
    },
    head: [
      ['link', { rel: 'icon', href: '/img/logo.png' }],
      [
        'meta',
        {
          name: 'keywords',
          content: '前端编码规范工程化',
        },
      ],
    ],
    plugins: [
      [
        'one-click-copy',
        {
          copySelector: ['div[class*="language-"] pre', 'div[class*="aside-code"] aside'],
          copyMessage: '复制成功',
          duration: 1000,
          showInMobile: false,
        },
      ],
  
      [
        'vuepress-plugin-zooming',
        {
          selector: '.theme-vdoing-content img:not(.no-zoom)',
          options: {
            bgColor: 'rgba(0,0,0,0.6)',
          },
        },
      ],
    ],
  }
})
