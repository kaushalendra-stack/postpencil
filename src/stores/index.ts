import { create } from 'zustand'

interface UploadModalState {
  isOpen: boolean
  selectedFile: File | null
  open: () => void
  close: () => void
  setFile: (file: File | null) => void
}

export const useUploadModal = create<UploadModalState>((set) => ({
  isOpen: false,
  selectedFile: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, selectedFile: null }),
  setFile: (file) => set({ selectedFile: file }),
}))

interface MobileNavState {
  isOpen: boolean
  toggle: () => void
  close: () => void
}

export const useMobileNav = create<MobileNavState>((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
  close: () => set({ isOpen: false }),
}))
