import { nanoid } from "nanoid"

import { Storage } from "@plasmohq/storage"

import {
  mapColorToWord,
  pickTextColorBasedOnBgColorAdvanced
} from "~lib/colors"
import { OVERVIEW_ID, TAG_CLASS } from "~lib/constants"
import { getStorage, upsertStorage } from "~lib/storage"

const storage = new Storage()

type FoundWord = {
  id: string
  word: string
}

/**
 * Match `text` with given `searchRegex`.
 *
 * Return node with highlight if search found (`undefined` otherwise)
 * and new list of found words.
 */
const matchNodeText =
  (text: string | null) =>
  ({
    searchRegex,
    colorMap,
    foundWords
  }: {
    searchRegex: RegExp
    colorMap: Map<string, string>
    foundWords: FoundWord[]
  }): [string | undefined, FoundWord[]] => {
    // const text = element.textContent
    const textMatch = text?.match(searchRegex) ?? []

    // Has text with matching word in regex (word list)
    if (text && textMatch.length > 0) {
      const wordIds = Array.from(textMatch, () => nanoid())
      let wordIndexId = 0

      const highlight = text.replace(searchRegex, (str) => {
        const wordId = wordIds[wordIndexId]
        wordIndexId = wordIndexId + 1

        const bgColor = colorMap.get(str) ?? "#000080"
        return `<a href="https://jpdb.io/search?q=${str}" target="_blank" rel="noopener noreferrer" id="${wordId}" class="${TAG_CLASS}" style="font-weight:300;background:${bgColor};color:${pickTextColorBasedOnBgColorAdvanced(
          bgColor,
          "#fff",
          "#111"
        )};scroll-margin-top: 60px;padding:3px 4px;text-decoration:none;">${str}</a>`
      })

      return [
        highlight,
        [
          ...foundWords,
          ...textMatch.map((matchWord, index) => ({
            word: matchWord,
            id: wordIds[index]
          }))
        ]
      ]
    }

    return [undefined, foundWords]
  }

const applyHighlight =
  (
    searchRegex: RegExp,
    colorMap: Map<string, string>,
    foundWords: FoundWord[]
  ) =>
  (element: Node): FoundWord[] => {
    /** Node is **only** text */
    if (element.nodeType === Node.TEXT_NODE) {
      const [highlight, newWordList] = matchNodeText(element.textContent)({
        colorMap,
        foundWords,
        searchRegex
      })

      const parent = element.parentElement

      /** Add highlight to Node */
      if (highlight && parent) {
        const newChild = document.createElement("span")
        newChild.innerHTML = highlight
        parent.replaceChild(newChild, element)
      }

      return newWordList
    }
    // Leaf node (no children)
    else if (element instanceof Element && element.children.length === 0) {
      if (element.id === OVERVIEW_ID) {
        return foundWords
      }

      // Not already highlighted
      if (!element.classList.contains(TAG_CLASS)) {
        const text = element.textContent
        const [highlight, newWordList] = matchNodeText(text)({
          colorMap,
          foundWords,
          searchRegex
        })

        if (highlight) {
          element.innerHTML = highlight
        }

        return newWordList
      }

      return foundWords
    } else {
      return Array.from(element.childNodes)
        .map((childNode) =>
          applyHighlight(searchRegex, colorMap, foundWords)(childNode)
        )
        .flat()
    }
  }

const highlightAll = async () => {
  const data = await getStorage()()

  if (data.length > 0) {
    const colorMap = mapColorToWord(data)
    const sortByLength = [...data]
    sortByLength.sort((e1, e2) =>
      e1.length > e2.length ? -1 : e2.length > e1.length ? 1 : 0
    )

    const regex = sortByLength.join("|")
    const foundWords = applyHighlight(
      new RegExp(`${regex}`, "g"),
      colorMap,
      []
    )(document.body)

    if (foundWords.length > 0) {
      const element =
        document.getElementById(OVERVIEW_ID) ?? document.createElement("p")

      foundWords.forEach(({ id, word }) => {
        const a = document.createElement("a")
        a.href = `#${id}`
        a.textContent = word
        element.appendChild(a)
      })

      element.classList.add(`${OVERVIEW_ID}`)
      element.id = `${OVERVIEW_ID}`
      document.body.appendChild(element)
    }
  }
}

document.onkeydown = async (e) => {
  if (e.altKey && e.ctrlKey) {
    if (e.key === "Dead") {
      /** Highlight new word (Alt + Ctrl + N) */
      const text = document.getSelection()
      if (text !== null && text.rangeCount > 0) {
        const selection = text.getRangeAt(0).toString()
        await upsertStorage(selection)()
        highlightAll()
      }
    } else if (e.key === "µ") {
      /** Reload words (for SPA apps without SSR) (Alt + Ctrl + M) */
      highlightAll()
    }
  }
}

/** Apply css stylesheet */
const style = document.createElement("style")
style.textContent = `.${OVERVIEW_ID} { display: flex; flex-wrap: wrap; column-gap: 6px; max-width: 33vw; position: fixed; bottom: 0; right: 0; padding: 12px 16px; background: white; border-radius: 8px 0 0 0; border: 1px solid rgb(125 211 252); } .${TAG_CLASS}:hover { filter: brightness(1.25); }`
document.head.appendChild(style)

highlightAll()
document.addEventListener("selectionchange", async (event) => {
  const data = await storage.get("a")
  const selection = document.getSelection()
  const focusNode = selection?.focusNode
  const parent = focusNode?.parentElement
  if (parent) {
    const { top, right } = parent.getBoundingClientRect()
    const newDiv = document.createElement("div")
    newDiv.style.position = "fixed"
    newDiv.style.top = `${top}px`
    newDiv.style.right = `${right}px`
    newDiv.style.width = "100px"
    newDiv.style.height = "100px"
    newDiv.style.background = "#e3e3e3"

    parent.appendChild(newDiv)
  }

  const selected = selection?.toString() ?? ""
  if (selected.length > 0) {
    alert(selection?.toString())
  }
})

setTimeout(() => {
  highlightAll()
}, 3000)
