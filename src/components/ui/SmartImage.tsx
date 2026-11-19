import Image, { type ImageProps } from "next/image";

/** next/image com otimização automática; SVG e domínios externos desconhecidos são servidos sem otimização. */
export function SmartImage(props: ImageProps & { src: string }) {
  const { src } = props;
  const isSvg = /\.svg(\?|$)/i.test(src);
  const isUnknownRemote = /^https?:\/\//.test(src) && !/\.supabase\.co\//.test(src) && !src.includes("i.ytimg.com");
  return <Image {...props} alt={props.alt} unoptimized={isSvg || isUnknownRemote || props.unoptimized} />;
}
