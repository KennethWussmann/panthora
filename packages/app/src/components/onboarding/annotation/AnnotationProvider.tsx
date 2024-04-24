import { useRouter } from "next/router";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";

export const annotationCollectionSchema = z.union([
  z.literal("all"),
  z.literal("create-asset-type-1"),
  z.literal("create-asset-type-2"),
]);
const envCollection = annotationCollectionSchema
  .optional()
  .parse(process.env.NEXT_PUBLIC_E2E_ANNOTATION_COLLECTION);

export type AnnotationCollection = z.infer<typeof annotationCollectionSchema>;

type AnnotationsContextType = {
  collection: AnnotationCollection | undefined;
};

const AnnotationsContext = createContext<AnnotationsContextType | undefined>(
  undefined
);

export const AnnotationsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { query } = useRouter();
  const [collection, setCollection] = useState<
    AnnotationCollection | undefined
  >(envCollection);

  useEffect(() => {
    if (query.annotationCollection) {
      setCollection(
        annotationCollectionSchema.parse(query.annotationCollection)
      );
    } else if (envCollection) {
      setCollection(envCollection);
    }
  }, [query]);

  return (
    <AnnotationsContext.Provider value={{ collection }}>
      {children}
    </AnnotationsContext.Provider>
  );
};

export const useAnnotations = () => {
  const context = useContext(AnnotationsContext);
  if (!context) {
    throw new Error(
      "useAnnotations must be used within an AnnotationsProvider"
    );
  }
  return context;
};

export const useAnnotationCollection = (
  ownCollection: AnnotationCollection
) => {
  const { collection } = useAnnotations();
  return {
    collection,
    enabled: collection === ownCollection || collection === "all",
  };
};
