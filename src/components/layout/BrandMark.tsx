/* Harvest Trend · รู้ทันราคา — brand mark (identical SVG grammar on every page) */
export function BrandMark({ size = 25 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E8B54A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="14.3" r="8.3" strokeWidth="1.8" />
      <circle cx="12" cy="14.3" r="5.9" strokeWidth="0.7" opacity="0.55" />
      <path d="M12 11.6V4.5" stroke="#FFFDF6" strokeWidth="1.7" />
      <path d="M12 8C10.2 7.7 8.8 6.4 8.6 3.6C10.5 3.9 11.9 5.6 12 8Z" fill="#FFFDF6" stroke="none" />
      <path d="M12 6.8C13.8 6.5 15.2 5.2 15.4 3.2C13.5 3.5 12.1 5.2 12 6.8Z" fill="#FFFDF6" stroke="none" />
    </svg>
  );
}