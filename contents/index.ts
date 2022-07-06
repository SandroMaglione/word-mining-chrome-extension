import {
  mapColorToWord,
  pickTextColorBasedOnBgColorAdvanced
} from "~lib/colors"
import { TAG_CLASS } from "~lib/constants"
import { getStorage, upsertStorage } from "~lib/storage"

const highlightAll = async () => {
  const data = await getStorage()()

  if (data.length > 0) {
    const colorMap = mapColorToWord(data)
    const sortByLength = [...data]
    sortByLength.sort((e1, e2) =>
      e1.length > e2.length ? -1 : e2.length > e1.length ? 1 : 0
    )

    document.querySelectorAll(`.${TAG_CLASS}`).forEach((e) => {
      e.replaceWith(e.textContent ?? "")
    })

    document.querySelectorAll("p, span").forEach((e) => {
      const text = e.textContent
      if (text) {
        console.log({ text })

        const regex = sortByLength.join("|")
        const highlight = text.replace(new RegExp(`${regex}`, "g"), (str) => {
          const bgColor = colorMap.get(str) ?? "#000080"
          return `<a href="https://jpdb.io/search?q=${str}" target="_blank" rel="noopener noreferrer" class="${TAG_CLASS}" style="font-weight:300;background:${bgColor};color:${pickTextColorBasedOnBgColorAdvanced(
            bgColor,
            "#fff",
            "#111"
          )};padding:3px 4px;text-decoration:none;">${str}</a>`
        })

        e.innerHTML = highlight
      }
    })
  }
}

document.onkeydown = async (e) => {
  if (e.altKey && e.ctrlKey) {
    console.log({ key: e.key })

    if (e.key === "Dead") {
      /** Highlight new word (Alt + Ctrl + N) */
      const text = document.getSelection()
      if (text !== null && text.rangeCount > 0) {
        const selection = text.getRangeAt(0).toString()
        console.log({ select: selection })
        await upsertStorage(selection)()
        highlightAll()
      }
    } else if (e.key === "µ") {
      /** Reload word (for SPA apps without SSR) (Alt + Ctrl + M) */
      highlightAll()
    }
  }
}

/** Apply css stylesheet */
const style = document.createElement("style")
style.textContent = `.${TAG_CLASS}:hover { filter: brightness(1.25); }`
document.head.appendChild(style)

highlightAll()
