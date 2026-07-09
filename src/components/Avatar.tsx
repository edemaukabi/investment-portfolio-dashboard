import { useState } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Shows a profile photo when one loads, and falls back to the user's
 * initials if there's no `src` or the image fails to load.
 */
export default function Avatar({ name, src, size = 36 }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.initials} style={{ fontSize: size * 0.36 }}>
          {initialsOf(name)}
        </span>
      )}
    </span>
  );
}
