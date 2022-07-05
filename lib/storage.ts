const STORAGE_KEY = "h-gl"

export const getStorage = (): string[] => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data === null) return []

  try {
    return JSON.parse(data) as string[]
  } catch (e) {
    console.error("Could not parse local data", data)
    localStorage.removeItem(STORAGE_KEY)
    return []
  }
}

export const upsertStorage = (text: string) => {
  const dataList = getStorage()
  console.log({ dataList })

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      dataList.includes(text)
        ? dataList.filter((t) => t !== text)
        : [...dataList, text]
    )
  )
}
