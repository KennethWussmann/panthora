export default {
  logo: <span>Panthora</span>,
  project: {
    link: "https://github.com/KennethWussmann/panthora",
  },
  docsRepositoryBase:
    "https://github.com/KennethWussmann/panthora/tree/main/packages/docs",
  useNextSeoProps() {
    return {
      titleTemplate: "%s – Panthora",
    };
  },
};
