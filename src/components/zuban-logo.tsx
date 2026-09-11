import zubanMark from "@/assets/zuban-mark.png";

type Props = {
  className?: string;
  alt?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function ZubanLogo({
  className,
  alt = "",
  width = 160,
  height = 160,
  priority = false,
}: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={zubanMark.src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
