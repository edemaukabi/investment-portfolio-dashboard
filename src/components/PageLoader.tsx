import styles from './PageLoader.module.css';

export default function PageLoader() {
  return (
    <div className={styles.wrap} aria-busy="true" aria-label="Loading page">
      <span className={styles.spinner} />
    </div>
  );
}
