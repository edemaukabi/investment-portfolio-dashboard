import Skeleton from '../../../components/Skeleton';
import styles from './DashboardSkeleton.module.css';

export default function DashboardSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading portfolio">
      <div className={styles.topGrid}>
        <div className={styles.card}>
          <Skeleton width="34%" height={13} />
          <Skeleton width="48%" height={30} radius={10} />
          <Skeleton width="100%" height={120} radius={12} />
        </div>
        <div className={styles.card}>
          <Skeleton width="45%" height={13} />
          <Skeleton width="100%" height={24} radius={12} />
          <Skeleton width="80%" height={13} />
          <Skeleton width="70%" height={13} />
        </div>
      </div>

      <div className={styles.accountsGrid}>
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className={styles.card}>
            <Skeleton width="55%" height={12} />
            <Skeleton width="70%" height={20} radius={8} />
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <Skeleton width="30%" height={16} />
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} width="100%" height={54} radius={14} />
        ))}
      </div>
    </div>
  );
}
