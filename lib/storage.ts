import { getAllChromeWord, upsertChromeWord } from "./api"

const STORAGE_KEY = "h-gl"

export const getStorage = () => async (): Promise<string[]> =>
  (await getAllChromeWord(true)()).map(({ text }) => text)

export const upsertStorage = upsertChromeWord
