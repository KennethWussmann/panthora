export const DocsImage = ({ path, alt }: { path: string; alt?: string }) => {
  const srcLight = `/assets/images/${path}-light.png`;
  const srcDark = `/assets/images/${path}-dark.png`;
  return (
    <>
      <a
        className="light-image"
        href={srcLight}
        target="_blank"
        rel="noreferrer"
      >
        <img src={srcLight} alt={alt ?? ""} />
      </a>
      <a className="dark-image" href={srcDark} target="_blank" rel="noreferrer">
        <img src={srcDark} alt={alt ?? ""} />
      </a>
    </>
  );
};
