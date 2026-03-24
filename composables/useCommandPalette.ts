const _isOpen = ref(false)

export function useCommandPalette() {
  function open()   { _isOpen.value = true  }
  function close()  { _isOpen.value = false }
  function toggle() { _isOpen.value = !_isOpen.value }

  return {
    isOpen: readonly(_isOpen),
    open,
    close,
    toggle,
  }
}
