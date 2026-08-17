/* Harvest Trend · รู้ทันราคา — brand mark (identical logo on every page) */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/brand-logo.png"
      alt=""
      height={size}
      className="block h-full w-auto"
      aria-hidden="true"
    />
  );
}