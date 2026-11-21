/** Primary pointer is a finger (phones and most tablets). Desktop mice stay false. */
export function isCoarsePointer() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  )
}

export const IS_COARSE_POINTER = isCoarsePointer()
