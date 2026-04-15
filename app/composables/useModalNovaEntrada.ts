export function useModalNovaEntrada() {
  const abrir = useState<boolean>('modal-nova-entrada', () => false)

  function abrirModal() {
    abrir.value = true
  }

  function fecharModal() {
    abrir.value = false
  }

  return { abrir, abrirModal, fecharModal }
}
