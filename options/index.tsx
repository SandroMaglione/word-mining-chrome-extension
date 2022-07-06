import { ReactElement, useState } from "react"
import useSWR from "swr"
import { isJapanese } from "wanakana"

import { getAllChromeWord, upsertChromeWord } from "~lib/api"

import "../main.css"

export default function Options(): ReactElement {
  const [customWord, setCustomWord] = useState("")
  const { data, mutate } = useSWR(
    `words`,
    getAllChromeWord({ sortBy: "created_at" })
  )

  const canAddCustomWord =
    customWord.length > 0 &&
    isJapanese(customWord) &&
    !data?.some((word) => word.text === customWord)

  const onClickToggleActive = (text: string) =>
    upsertChromeWord(text)().then(() => mutate())

  const onSubmitCustomWord = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (canAddCustomWord) {
      onClickToggleActive(customWord).then(() => {
        setCustomWord("")
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto mb-24">
      <form
        onSubmit={onSubmitCustomWord}
        className="sticky top-0 z-10 py-8 bg-white bg-opacity-[0.9725]">
        <label
          htmlFor="word"
          className="block text-sm font-medium text-slate-700">
          Custom word
        </label>
        <div className="flex items-center mt-1">
          <div className="flex-1">
            <input
              type="text"
              name="word"
              id="word"
              className="block w-full shadow-sm rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-slate-300"
              placeholder="Insert custom word"
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
            />
          </div>
          <div className="self-stretch flex-none">
            <button
              type="submit"
              className="inline-flex items-center h-full px-8 py-2 text-sm font-medium leading-4 text-white bg-indigo-600 border border-transparent shadow-sm disabled:opacity-25 rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={!canAddCustomWord}>
              Save word
            </button>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-3 gap-16 mt-8">
        {(data ?? [])
          .filter(
            (word) => customWord.length === 0 || word.text.includes(customWord)
          )
          .map((word) => (
            <div key={word.id_chrome_word} className="flex flex-col">
              <div className={`${word.is_active ? "" : "opacity-30"}`}>
                <a
                  href={`https://jpdb.io/search?q=${word.text}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-5xl block break-all font-light text-slate-800 ${
                    word.is_active
                      ? "transform transition-transform hover:translate-y-[-2px] hover:text-slate-700"
                      : ""
                  }`}>
                  {word.text}
                </a>
                <div className="mt-1">
                  <span className="text-xs font-light text-slate-700">
                    {new Date(word.created_at).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-2">
                <button
                  type="button"
                  title={`Turn to ${word.is_active ? "inactive" : "active"}`}
                  onClick={() => onClickToggleActive(word.text)}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                    word.is_active
                      ? "bg-indigo-100 text-indigo-800 hover:bg-rose-100"
                      : "bg-rose-100 text-rose-600 hover:bg-indigo-100"
                  }`}>
                  {word.is_active ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
