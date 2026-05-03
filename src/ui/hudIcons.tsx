import type { SVGProps } from "react";

type HudIconProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill" | "stroke">;

function HudIconBase({ children, className = "h-4 w-4 shrink-0", ...rest }: HudIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function CalendarIcon(props: HudIconProps) {
  return (
    <HudIconBase {...props}>
      <rect x="3.75" y="5.5" width="16.5" height="14.75" rx="2.25" />
      <path d="M7.5 3.75v3.5M16.5 3.75v3.5M3.75 10h16.5" />
    </HudIconBase>
  );
}

export function BadgeIcon(props: HudIconProps) {
  return (
    <HudIconBase {...props}>
      <path d="M12 3.75l2.55 5.166 5.7.828-4.125 4.02.975 5.678L12 16.75l-5.1 2.692.975-5.678-4.125-4.02 5.7-.828L12 3.75z" />
    </HudIconBase>
  );
}

export function ListIcon(props: HudIconProps) {
  return (
    <HudIconBase {...props}>
      <path d="M5.25 7.5h2.25M9.75 7.5h9M5.25 12h2.25M9.75 12h9M5.25 16.5h2.25M9.75 16.5h9" />
    </HudIconBase>
  );
}

export function PauseIcon(props: HudIconProps) {
  return (
    <HudIconBase {...props}>
      <rect x="5.5" y="4.5" width="4.5" height="15" rx="1" />
      <rect x="14" y="4.5" width="4.5" height="15" rx="1" />
    </HudIconBase>
  );
}

export function PlayIcon(props: HudIconProps) {
  return (
    <HudIconBase {...props}>
      <path d="M8.25 5.5l9.5 6.5-9.5 6.5V5.5z" />
    </HudIconBase>
  );
}
