import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Home',
      href: '#',
    },
    {
      text: 'Features',
      href: '#features',
    },
    {
      text: 'Use Cases',
      href: '#use-cases',
    },
    {
      text: 'FAQ',
      href: '#faq',
    },
    {
      text: 'Documentation',
      href: 'https://docs.panthora.app',
    },
    {
      text: 'Demo',
      href: 'https://demo.panthora.app',
      target: '_blank',
    },
    {
      text: 'GitHub',
      href: 'https://github.com/KennethWussmann/panthora',
    },
  ],
  actions: [{ text: 'Get started', href: 'https://docs.panthora.app' }],
};

export const footerData = {
  links: [
    {
      title: 'Product',
      links: [
        {
          text: 'Documentation',
          href: 'https://docs.panthora.app',
        },
        {
          text: 'Demo',
          href: 'https://demo.panthora.app',
        },
        {
          text: 'GitHub',
          href: 'https://github.com/KennethWussmann/panthora',
        },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Imprint', href: 'https://kenneth.wussmann.net/imprint' },
    { text: 'Privacy Policy', href: 'https://kenneth.wussmann.net/privacy' },
  ],
  socialLinks: [
    { ariaLabel: 'Github', icon: 'tabler:brand-github', href: 'https://github.com/KennethWussmann/panthora' },
  ],
};
