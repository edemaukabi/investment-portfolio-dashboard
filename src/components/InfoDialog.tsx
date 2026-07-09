import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { HelpCircleIcon, SparklesIcon } from './icons';
import styles from './InfoDialog.module.css';

interface DialogContent {
  title: string;
  message: string;
  variant?: 'coming-soon' | 'info';
}

interface DialogApi {
  showDialog: (content: DialogContent) => void;
  showComingSoon: (feature: string) => void;
}

const DialogContext = createContext<DialogApi | null>(null);

export function useInfoDialog(): DialogApi {
  const context = useContext(DialogContext);
  if (context === null) {
    throw new Error('useInfoDialog must be used inside an InfoDialogProvider');
  }
  return context;
}

/**
 * One lightweight, accessible dialog for the whole app — used to give
 * honest feedback on demo features that aren't built (and for help text)
 * instead of leaving dead buttons around.
 */
export function InfoDialogProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<DialogContent | null>(null);
  const okButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const showDialog = useCallback((next: DialogContent) => {
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setContent(next);
  }, []);

  const showComingSoon = useCallback(
    (feature: string) =>
      showDialog({
        title: feature,
        message:
          'This part of Trove is on its way — it is not included in the demo just yet.',
        variant: 'coming-soon',
      }),
    [showDialog],
  );

  const close = useCallback(() => {
    setContent(null);
    restoreFocusRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!content) return undefined;
    okButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [content, close]);

  const api = useMemo(() => ({ showDialog, showComingSoon }), [showDialog, showComingSoon]);
  const isComingSoon = content?.variant !== 'info';

  return (
    <DialogContext.Provider value={api}>
      {children}
      {content && (
        <div className={styles.overlay} onMouseDown={close} role="presentation">
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="info-dialog-title"
            aria-describedby="info-dialog-message"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span
              className={isComingSoon ? styles.iconSoon : styles.iconInfo}
              aria-hidden="true"
            >
              {isComingSoon ? <SparklesIcon size={20} /> : <HelpCircleIcon size={20} />}
            </span>
            {isComingSoon && <span className={styles.kicker}>Coming soon</span>}
            <h2 id="info-dialog-title" className={styles.title}>
              {content.title}
            </h2>
            <p id="info-dialog-message" className={styles.message}>
              {content.message}
            </p>
            <button
              ref={okButtonRef}
              type="button"
              className={styles.okButton}
              onClick={close}
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
