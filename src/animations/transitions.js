export const softSpring = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.7,
}

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
}
