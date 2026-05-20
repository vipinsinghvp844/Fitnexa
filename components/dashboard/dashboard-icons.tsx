import { IconName } from '@/lib/dashboard';

export function DashboardIcon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    viewBox: '0 0 24 24',
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <path d="M4 5.5h7v5H4zM13 5.5h7v13h-7zM4 12.5h7v6H4z" />
        </svg>
      );
    case 'gym':
      return (
        <svg {...common}>
          <path d="M3 10v4M7 8v8M17 8v8M21 10v4M7 12h10M5 12h2M17 12h2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'plans':
      return (
        <svg {...common}>
          <path d="M6 5h12l2 4-8 10L4 9z" strokeLinejoin="round" />
          <path d="M9 5l3 14 3-14" strokeLinejoin="round" />
        </svg>
      );
    case 'subscriptions':
      return (
        <svg {...common}>
          <path d="M12 4a8 8 0 1 0 8 8" strokeLinecap="round" />
          <path d="M12 8v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'payments':
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
          <path d="M3.5 10h17M7 14h3" strokeLinecap="round" />
        </svg>
      );
    case 'coupons':
      return (
        <svg {...common}>
          <path d="M7 5.5h10a2 2 0 0 1 2 2V10a2 2 0 0 0 0 4v2.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V14a2 2 0 0 0 0-4V7.5a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
          <path d="M12 8.5v7" strokeLinecap="round" strokeDasharray="2 2" />
        </svg>
      );
    case 'reports':
      return (
        <svg {...common}>
          <path d="M5 19V9M12 19V5M19 19v-7" strokeLinecap="round" />
          <path d="M4 19h16" strokeLinecap="round" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <path d="M12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Z" />
          <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" strokeLinecap="round" />
        </svg>
      );
    case 'members':
    case 'users':
      return (
        <svg {...common}>
          <path d="M8.5 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16.5 10a2.5 2.5 0 1 0 0-5" />
          <path d="M4.5 19a4.5 4.5 0 0 1 8 0M14 18a3.5 3.5 0 0 1 5-1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'trainers':
      return (
        <svg {...common}>
          <path d="M12 4 4 8l8 4 8-4-8-4Z" strokeLinejoin="round" />
          <path d="M7 10.5V15c0 1.7 2.2 3 5 3s5-1.3 5-3v-4.5" strokeLinejoin="round" />
        </svg>
      );
    case 'staff':
      return (
        <svg {...common}>
          <path d="M6.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM17.5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
          <path d="M3.5 19a4.5 4.5 0 0 1 6-3M14.5 16a4.5 4.5 0 0 1 6 3M8 19a5 5 0 0 1 8 0" strokeLinecap="round" />
        </svg>
      );
    case 'attendance':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="15" rx="2.5" />
          <path d="M8 3.5v3M16 3.5v3M7.5 12l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'classes':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="14" rx="2.5" />
          <path d="M8 9h8M8 13h5" strokeLinecap="round" />
        </svg>
      );
    case 'inventory':
      return (
        <svg {...common}>
          <path d="M5 8.5 12 4l7 4.5v7L12 20l-7-4.5v-7Z" strokeLinejoin="round" />
          <path d="M5 8.5 12 13l7-4.5M12 13v7" strokeLinejoin="round" />
        </svg>
      );
    case 'payroll':
      return (
        <svg {...common}>
          <path d="M7 4.5h8M9 8.5h10M5 12.5h14M7 16.5h8" strokeLinecap="round" />
          <path d="M4 4.5h.01M4 8.5h.01M4 12.5h.01M4 16.5h.01" strokeLinecap="round" />
        </svg>
      );
    case 'expenses':
      return (
        <svg {...common}>
          <path d="M6 5h12M8 5V3.5M16 5V3.5M6 9h12M7 9l1.2 10h7.6L17 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common}>
          <path d="M10 6V4.5A1.5 1.5 0 0 1 11.5 3h6A1.5 1.5 0 0 1 19 4.5v15a1.5 1.5 0 0 1-1.5 1.5h-6A1.5 1.5 0 0 1 10 19.5V18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 12H4M7.5 8.5 4 12l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'moon':
      return (
        <svg {...common}>
          <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5 8 8 0 1 0 19 14.5Z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M18 6l-1.4 1.4M7.4 16.6 6 18M18 18l-1.4-1.4M7.4 7.4 6 6" strokeLinecap="round" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 4 6 6.5v4.7c0 3.8 2.4 6.8 6 8.8 3.6-2 6-5 6-8.8V6.5L12 4Z" strokeLinejoin="round" />
          <path d="m9.5 12 1.7 1.7 3.3-3.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'spark':
      return (
        <svg {...common}>
          <path d="M12 3.5 13.8 9 20 10.2l-4.5 3.8 1.2 6-4.7-2.8-4.7 2.8 1.2-6L4 10.2 10.2 9 12 3.5Z" strokeLinejoin="round" />
        </svg>
      );
    case 'pause':
      return (
        <svg {...common}>
          <rect x="6" y="5" width="4" height="14" rx="1" />
          <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
      );
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
        </svg>
      );
    case 'play':
      return (
        <svg {...common}>
          <path d="M8 5v14l11-7L8 5z" strokeLinejoin="round" />
        </svg>
      );
    case 'refresh':
      return (
        <svg {...common}>
          <path d="M4 4v6h6" strokeLinecap="round" />
          <path d="M20 20v-6h-6" strokeLinecap="round" />
          <path d="M20 8a8 8 0 0 0-15.5 2M4 16a8 8 0 0 0 15.5-2" />
        </svg>
      );
    case 'status':
      return (
        <svg {...common}>
          <path d="M5 12h14" strokeLinecap="round" />
          <path d="M12 5v14" strokeLinecap="round" />
        </svg>
      );
    case 'credit-card':
      return (
        <svg {...common}>
          <rect x="3.5" y="6" width="17" height="12" rx="2.5" />
          <path d="M3.5 10h17" strokeLinecap="round" />
          <path d="M7 14h3" strokeLinecap="round" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      );
    case 'building':
      return (
        <svg {...common}>
          <path d="M4 21V5l7-3 7 3v16H4z" strokeLinejoin="round" />
          <path d="M9 8h2M9 12h2M9 16h2M13 8h2M13 12h2M13 16h2" strokeLinecap="round" />
        </svg>
      );
    case 'arrow-right':
      return (
        <svg {...common}>
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'bell':
      return (
        <svg {...common}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'alert-circle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5v5.5M12 16.5h.01" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12.2 2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="m5 12.5 4.2 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
