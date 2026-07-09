import type { TransactionStatus } from '../types';
import styles from './StatusBadge.module.css';

const VARIANTS: Record<TransactionStatus, string> = {
  COMPLETED: styles.completed,
  PENDING: styles.pending,
  FAILED: styles.failed,
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <span className={`${styles.badge} ${VARIANTS[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}
