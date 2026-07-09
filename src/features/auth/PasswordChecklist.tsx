import { CheckIcon } from '../../components/icons';
import { PASSWORD_RULES, evaluatePassword } from './passwordRules';
import styles from './PasswordChecklist.module.css';

export default function PasswordChecklist({ value }: { value: string }) {
  const { score, label, passed, total } = evaluatePassword(value);

  return (
    <div className={styles.wrap}>
      <div className={styles.meterRow}>
        <div
          className={styles.meter}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={passed}
          aria-label="Password strength"
        >
          {[0, 1, 2, 3].map((segment) => (
            <span
              key={segment}
              className={styles.segment}
              data-filled={value.length > 0 && segment <= score}
              data-score={score}
            />
          ))}
        </div>
        {value.length > 0 && (
          <span className={styles.strengthLabel} data-score={score}>
            {label}
          </span>
        )}
      </div>

      <ul className={styles.list}>
        {PASSWORD_RULES.map((rule) => {
          const met = rule.test(value);
          return (
            <li
              key={rule.id}
              className={met ? styles.itemMet : styles.item}
            >
              <span className={styles.check} aria-hidden="true">
                {met ? <CheckIcon size={11} /> : <span className={styles.dot} />}
              </span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
