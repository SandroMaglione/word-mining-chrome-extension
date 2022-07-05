export const COLOR_LIST = [
  "#FF6633",
  "#FFB399",
  "#FF33FF",
  "#FFFF99",
  "#00B3E6",
  "#E6B333",
  "#3366E6",
  "#999966",
  "#99FF99",
  "#B34D4D",
  "#80B300",
  "#809900",
  "#E6B3B3",
  "#6680B3",
  "#66991A",
  "#FF99E6",
  "#CCFF1A",
  "#FF1A66",
  "#E6331A",
  "#33FFCC",
  "#66994D",
  "#B366CC",
  "#4D8000",
  "#B33300",
  "#CC80CC",
  "#66664D",
  "#991AFF",
  "#E666FF",
  "#4DB3FF",
  "#1AB399",
  "#E666B3",
  "#33991A",
  "#CC9999",
  "#B3B31A",
  "#00E680",
  "#4D8066",
  "#809980",
  "#E6FF80",
  "#1AFF33",
  "#999933",
  "#FF3380",
  "#CCCC00",
  "#66E64D",
  "#4D80CC",
  "#9900B3",
  "#E64D66",
  "#4DB380",
  "#FF4D4D",
  "#99E6E6",
  "#6666FF"
]

export const COLOR_LIGHT_THRESHOLD = 0.35

/** https://stackoverflow.com/a/41491220/7033357 */
export const pickTextColorBasedOnBgColorAdvanced = (
  bgColor: string,
  lightColor: string,
  darkColor: string
): string => {
  var color = bgColor.charAt(0) === "#" ? bgColor.substring(1, 7) : bgColor
  var r = parseInt(color.substring(0, 2), 16) // hexToR
  var g = parseInt(color.substring(2, 4), 16) // hexToG
  var b = parseInt(color.substring(4, 6), 16) // hexToB
  var uicolors = [r / 255, g / 255, b / 255]
  var c = uicolors.map((col) => {
    if (col <= 0.03928) {
      return col / 12.92
    }
    return Math.pow((col + 0.055) / 1.055, 2.4)
  })
  var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  return L > COLOR_LIGHT_THRESHOLD ? darkColor : lightColor
}

export const mapColorToWord = (wordList: string[]): Map<string, string> => {
  const randomInit = Math.floor(Math.random() * COLOR_LIST.length)
  const colorMap = new Map<string, string>()
  for (let w = 0; w < wordList.length; w++) {
    const word = wordList[w]
    colorMap.set(word, COLOR_LIST[(w + randomInit) % COLOR_LIST.length])
  }
  return colorMap
}
