import { getAllChromeWord, upsertChromeWord } from "./api"

export const getStorage = () => async (): Promise<string[]> =>
  (await getAllChromeWord({ onlyActive: true })()).map(({ text }) => text)

export const upsertStorage = upsertChromeWord
