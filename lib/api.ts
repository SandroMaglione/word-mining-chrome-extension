import { nanoid } from "nanoid"
import { isJapanese } from "wanakana"

import { supabase } from "./supabase"
import type { ChromeWord } from "./types"

const CHROME_WORD_TABLE = "chrome_word"

export const getAllChromeWord =
  (options?: { onlyActive?: boolean; sortBy?: keyof ChromeWord }) =>
  async (): Promise<ChromeWord[]> => {
    const request = supabase
      .from<ChromeWord>(CHROME_WORD_TABLE)
      .select()
      .order("is_active", { ascending: false })

    const requestOnlyActive =
      options?.onlyActive ?? false ? request.eq("is_active", true) : request

    const { data, error } = await (typeof options?.sortBy !== "undefined"
      ? requestOnlyActive.order(options.sortBy, { ascending: false })
      : requestOnlyActive)

    if (error) return []
    return data
  }

export const upsertChromeWord =
  (text: string) => async (): Promise<ChromeWord | null> => {
    if (isJapanese(text)) {
      const { data: searchWord, error: searchError } = await supabase
        .from<ChromeWord>(CHROME_WORD_TABLE)
        .select()
        .eq("text", text)
        .limit(1)

      if (searchError) {
        console.error(searchError)
      }

      if (searchWord && searchWord.length > 0) {
        const { data, error } = await supabase
          .from<ChromeWord>(CHROME_WORD_TABLE)
          .update({
            is_active: !searchWord[0].is_active
          })
          .eq("id_chrome_word", searchWord[0].id_chrome_word)
          .single()

        if (error) {
          console.error(error)
        }

        return data
      } else {
        const { data, error } = await supabase
          .from<ChromeWord>(CHROME_WORD_TABLE)
          .insert({
            id_chrome_word: nanoid(),
            text
          })
          .single()

        if (error) {
          console.error(error)
        }

        return data
      }
    } else {
      return null
    }
  }
