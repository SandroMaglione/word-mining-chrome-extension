import {
  mapColorToWord,
  pickTextColorBasedOnBgColorAdvanced
} from "~lib/colors"
import { TAG_CLASS } from "~lib/constants"
import { getStorage, upsertStorage } from "~lib/storage"

const highlightAll = () => {
  const data = getStorage()
  const colorMap = mapColorToWord(data)
  const sortByLength = [...data]
  sortByLength.sort((e1, e2) =>
    e1.length > e2.length ? -1 : e2.length > e1.length ? 1 : 0
  )

  document.querySelectorAll(`.${TAG_CLASS}`).forEach((e) => {
    e.replaceWith(e.textContent ?? "")
  })

  document.querySelectorAll("p").forEach((e) => {
    const text = e.textContent
    if (text) {
      console.log({ sortByLength })

      const regex = sortByLength.join("|")
      const highlight = text.replace(new RegExp(`${regex}`, "g"), (str) => {
        const bgColor = colorMap.get(str) ?? "#000080"
        return `<a href="https://jpdb.io/search?q=${str}" target="_blank" rel="noopener noreferrer" class="${TAG_CLASS}" style="font-weight:300;background:${bgColor};color:${pickTextColorBasedOnBgColorAdvanced(
          bgColor,
          "#fff",
          "#111"
        )};padding:3px 4px">${str}</a>`
      })

      e.innerHTML = highlight
    }
  })
}

/** Highlight new word (Alt + Ctrl + N) */
document.onkeydown = (e) => {
  if (e.altKey && e.ctrlKey && e.key === "Dead") {
    const text = document.getSelection()
    if (text !== null && text.rangeCount > 0) {
      const selection = text.getRangeAt(0).toString()
      console.log({ select: selection })
      upsertStorage(selection)
      highlightAll()
    }
  }
}

/** Apply css stylesheet */
const style = document.createElement("style")
style.textContent = `.${TAG_CLASS}:hover { filter: brightness(1.25); }`
document.head.appendChild(style)

highlightAll()
