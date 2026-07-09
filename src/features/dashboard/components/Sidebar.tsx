import { useEffect, type ComponentType } from 'react';
import {
  GridIcon,
  BriefcaseIcon,
  ListIcon,
  TrendingUpIcon,
  SettingsIcon,
  PlusIcon,
  CloseIcon,
  LogOutIcon,
  type IconProps,
} from '../../../components/icons';
import Avatar from '../../../components/Avatar';
import { useInfoDialog } from '../../../components/InfoDialog';
import type { Session } from '../../../services/authService';
import styles from './Sidebar.module.css';

interface NavItem {
  label: string;
  icon: ComponentType<IconProps>;
  /** Real, in-app destination vs. a demo placeholder. */
  ready?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: GridIcon, ready: true },
  { label: 'Portfolio', icon: BriefcaseIcon },
  { label: 'Transactions', icon: ListIcon },
  { label: 'Markets', icon: TrendingUpIcon },
  { label: 'Settings', icon: SettingsIcon },
];

interface SidebarProps {
  user: Session;
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ user, open, onClose, onSignOut }: SidebarProps) {
  const { showComingSoon } = useInfoDialog();

  // While the mobile drawer is open: Escape closes it, background can't scroll.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <>
      {open && <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />}

      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.brandRow}>
          <span className={styles.brandMark} aria-hidden="true">
            T
          </span>
          <span className={styles.brandName}>Trove</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <nav className={styles.nav} aria-label="Main navigation">
          {NAV_ITEMS.map(({ label, icon: Icon, ready }) => (
            <button
              key={label}
              type="button"
              className={ready ? styles.navItemActive : styles.navItem}
              aria-current={ready ? 'page' : undefined}
              data-tooltip={ready ? undefined : 'Coming soon'}
              data-tooltip-pos="right"
              onClick={() => {
                onClose();
                if (!ready) showComingSoon(label);
              }}
            >
              <Icon size={17} />
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <Avatar name={user.name} src={user.avatarUrl} size={38} />
            <div className={styles.userMeta}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userPlan}>{user.membership}</span>
            </div>
            <button
              type="button"
              className={styles.signOut}
              onClick={onSignOut}
              aria-label="Sign out"
              data-tooltip="Sign out"
              data-tooltip-pos="end"
            >
              <LogOutIcon size={17} />
            </button>
          </div>
          <button
            type="button"
            className={styles.addFunds}
            onClick={() => showComingSoon('Add funds')}
          >
            <PlusIcon size={15} />
            Add Funds
          </button>
        </div>
      </aside>
    </>
  );
}
