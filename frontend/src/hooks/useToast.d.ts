export function useToast(): {
  showToast: (type: "success" | "error" | "info" | "warning", message: string) => void
}
