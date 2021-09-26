// With JSDoc @type annotations, IDEs can provide config autocompletion
/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Vlad Khitev',
  tagline: 'Software Engineer | Head of Front-End Chapter at Axon',
  url: 'https://vkhitev.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onDuplicateRoutes: 'throw',
  favicon: 'img/logo.svg',
  organizationName: 'vkhitev',
  projectName: 'vkhitev-web',

  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/vkhitev/vkhitev-web/edit/main/docs/',
        },
        blog: {
          path: 'blog',
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/vkhitev/vkhitev-web/edit/main/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Vlad Khitev',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          {
            to: 'blog',
            label: 'Blog',
            position: 'left',
          },
          {
            href: 'https://github.com/vkhitev/vkhitev-web',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Links',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'About',
                to: '/about',
              },
              {
                label: 'Contact',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: 'Professional',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/vlad-khitev',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/vkhitev',
              },
            ],
          },
          {
            title: 'Media',
            items: [
              {
                label: 'Instagram',
                href: 'https://www.instagram.com/vkhitev',
              },
              {
                label: 'Facebook',
                href: 'https://www.facebook.com/profile.php?id=100011326866860',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/vkhitev',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Vlad Khitev`,
      },
      prism: {
        additionalLanguages: [
          'kotlin',
          'swift',
          'java',
          'haskell',
          'php',
          'csharp',
          'groovy',
          'http',
          'clojure',
          'makefile',
          'mongodb',
          'nginx',
          'objectivec',
          'scala',
          'elm',
          'dart',
        ],
        theme: require('prism-react-renderer/themes/vsDark'),
        darkTheme: require('prism-react-renderer/themes/vsDark'),
      },
    }),
}
