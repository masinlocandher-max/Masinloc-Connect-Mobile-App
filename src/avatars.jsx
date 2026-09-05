import { Check } from 'lucide-react';

export const DEFAULT_AVATAR_ID = 'mango';

export const FRUIT_AVATARS = [
  { id: 'mango', label: 'Mango', col: 0, row: 0 },
  { id: 'pineapple', label: 'Pineapple', col: 1, row: 0 },
  { id: 'coconut', label: 'Coconut', col: 2, row: 0 },
  { id: 'banana', label: 'Banana', col: 0, row: 1 },
  { id: 'apple', label: 'Apple', col: 1, row: 1 },
  { id: 'watermelon', label: 'Watermelon', col: 2, row: 1 },
  { id: 'orange', label: 'Orange', col: 0, row: 2 },
  { id: 'grapes', label: 'Grapes', col: 1, row: 2 },
  { id: 'strawberry', label: 'Strawberry', col: 2, row: 2 },
];

const avatarMap = new Map(FRUIT_AVATARS.map((avatar) => [avatar.id, avatar]));

export function FruitAvatar({ id = DEFAULT_AVATAR_ID, className = '', size = 72, decorative = false }) {
  const avatar = avatarMap.get(id) || avatarMap.get(DEFAULT_AVATAR_ID);
  const positionX = avatar.col * 50;
  const positionY = avatar.row * 50;
  return <span
    className={`fruit-avatar ${className}`.trim()}
    style={{
      '--avatar-size': `${size}px`,
      backgroundPosition: `${positionX}% ${positionY}%`,
    }}
    role={decorative ? undefined : 'img'}
    aria-hidden={decorative ? 'true' : undefined}
    aria-label={decorative ? undefined : `${avatar.label} avatar`}
  />;
}

export function AvatarPicker({ value, onChange }) {
  return <fieldset className="avatar-picker">
    <legend>Choose your avatar</legend>
    <p className="avatar-picker-help">Pick one of the official Masinloc Connect fruit characters.</p>
    <div className="avatar-picker-grid">
      {FRUIT_AVATARS.map((avatar) => {
        const selected = value === avatar.id;
        return <button
          className={selected ? 'avatar-option selected' : 'avatar-option'}
          type="button"
          key={avatar.id}
          onClick={() => onChange(avatar.id)}
          aria-pressed={selected}
          aria-label={`Choose ${avatar.label} avatar`}
        >
          <FruitAvatar id={avatar.id} size={86} decorative />
          <span className="avatar-option-label">{avatar.label}</span>
          {selected ? <span className="avatar-selected-mark" aria-hidden="true"><Check size={14} strokeWidth={3} /></span> : null}
        </button>;
      })}
    </div>
  </fieldset>;
}
