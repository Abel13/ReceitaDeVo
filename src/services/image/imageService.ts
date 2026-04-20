import imageCompression from 'browser-image-compression'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase/config'

// ─────────────────────────────────────────────
//  Image Service
//  Responsabilidade única: otimização e upload de imagens
// ─────────────────────────────────────────────

interface CompressionOptions {
  maxSizeMB?:        number
  maxWidthOrHeight?: number
  quality?:          number
}

/** Comprime a imagem antes de qualquer upload */
const compressImage = async (file: File, options: CompressionOptions = {}): Promise<File> => {
  const config = {
    maxSizeMB:        options.maxSizeMB        ?? 0.8,    // máx 800 KB
    maxWidthOrHeight: options.maxWidthOrHeight  ?? 1200,   // máx 1200px
    useWebWorker:     true,
    fileType:         'image/webp',                        // converte para WebP
    initialQuality:   options.quality           ?? 0.82,
  }

  return imageCompression(file, config)
}

/** Gera thumbnail ainda menor para cards */
const compressThumbnail = (file: File): Promise<File> =>
  compressImage(file, { maxSizeMB: 0.15, maxWidthOrHeight: 400, quality: 0.75 })

/** Faz upload de um File já comprimido */
const uploadToStorage = async (file: File, path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

/** Remove imagem do Cloud Storage */
const deleteFromStorage = async (url: string): Promise<void> => {
  const storageRef = ref(storage, url)
  await deleteObject(storageRef)
}

export const imageService = {
  /**
   * Otimiza e faz upload da foto da receita.
   * Retorna { fullUrl, thumbUrl } prontos para salvar no Firestore.
   */
  uploadRecipePhoto: async (
    file: File,
    recipeId: string,
    index: number
  ): Promise<{ fullUrl: string; thumbUrl: string }> => {
    const [compressed, thumbnail] = await Promise.all([
      compressImage(file),
      compressThumbnail(file),
    ])

    const basePath = `recipes/${recipeId}`

    const [fullUrl, thumbUrl] = await Promise.all([
      uploadToStorage(compressed, `${basePath}/photo_${index}.webp`),
      uploadToStorage(thumbnail,  `${basePath}/thumb_${index}.webp`),
    ])

    return { fullUrl, thumbUrl }
  },

  /** Upload de avatar do usuário */
  uploadAvatar: async (file: File, userId: string): Promise<string> => {
    const compressed = await compressImage(file, { maxSizeMB: 0.2, maxWidthOrHeight: 300 })
    return uploadToStorage(compressed, `avatars/${userId}.webp`)
  },

  deletePhoto: deleteFromStorage,
}
