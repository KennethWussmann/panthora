import { type ReactNode } from "react";
import {
  Flex,
  Tag,
  type TagProps,
  Tooltip,
  useColorModeValue,
  type TooltipProps,
} from "@chakra-ui/react";
import {
  type AnnotationCollection,
  useAnnotationCollection,
} from "./AnnotationProvider";

type AnnotationSize = "sm" | "md" | "lg";

type AnnotationProps = {
  number?: number;
  variant?: "error" | "info" | "success";
  text?: ReactNode;
  collection: AnnotationCollection;
  size?: AnnotationSize;
  children?: ReactNode;
  placement?: TooltipProps["placement"];
};

const variantColorMap = {
  error: "red",
  info: "blue",
  success: "green",
};

export const Annotation: React.FC<AnnotationProps> = ({
  size = "md",
  variant = "error",
  number,
  text,
  collection,
  children,
  placement,
}) => {
  const { enabled } = useAnnotationCollection(collection);
  const tooltipColorStyle = useColorModeValue(
    {
      bg: `${variantColorMap[variant]}.400`,
      color: `${variantColorMap[variant]}.900`,
    },
    {
      bg: `${variantColorMap[variant]}.300`,
      color: `${variantColorMap[variant]}.900`,
    }
  );
  const tagColorStyle = useColorModeValue(
    {
      bg: `${variantColorMap[variant]}.500`,
      color: `${variantColorMap[variant]}.900`,
    },
    {
      bg: `${variantColorMap[variant]}.200`,
      color: `${variantColorMap[variant]}.900`,
    }
  );

  const tooltipSizeStyle: Partial<TooltipProps> = (
    {
      sm: {
        fontSize: "14pt",
        px: 3,
      },
      md: {
        fontSize: "17pt",
        px: 4,
      },
      lg: {
        fontSize: "24pt",
        px: 5,
      },
    } satisfies Record<AnnotationSize, Partial<TooltipProps>>
  )[size];
  const tagSizeStyle: Partial<TagProps> = (
    {
      sm: {
        fontSize: "14pt",
        px: 3,
      },
      md: {
        fontSize: "xl",
      },
      lg: {
        fontSize: "30pt",
        px: 6,
      },
    } satisfies Record<AnnotationSize, Partial<TagProps>>
  )[size];

  if (!enabled) {
    return children;
  }

  const numberWithTag = (
    <Flex justify={"center"} alignItems={"center"} gap={2}>
      <Tag rounded={"full"} {...tagColorStyle} {...tagSizeStyle}>
        {number}
      </Tag>
      {text}
    </Flex>
  );

  return (
    <Tooltip
      hasArrow
      isOpen
      label={number ? numberWithTag : text}
      placement={placement ?? "left"}
      rounded={"full"}
      boxShadow={"lg"}
      {...tooltipSizeStyle}
      {...tooltipColorStyle}
    >
      {children}
    </Tooltip>
  );
};
