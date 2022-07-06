import { nanoid } from "nanoid"

import { supabase } from "./supabase"
import type { ChromeWord } from "./types"

const CHROME_WORD_TABLE = "chrome_word"

export const getAllChromeWord =
  (onlyActive = false) =>
  async (): Promise<ChromeWord[]> => {
    const request = supabase.from<ChromeWord>(CHROME_WORD_TABLE).select()
    const { data, error } = await (onlyActive
      ? request.eq("is_active", true)
      : request)

    if (error) return []
    return data
  }

export const upsertChromeWord =
  (text: string, id_chrome_word?: string) =>
  async (): Promise<ChromeWord | null> => {
    const { data, error } = await supabase
      .from<ChromeWord>(CHROME_WORD_TABLE)
      .upsert({
        id_chrome_word: id_chrome_word ?? nanoid(),
        text
      })
      .single()

    if (error) {
      console.error(error)
    }

    return data
  }
