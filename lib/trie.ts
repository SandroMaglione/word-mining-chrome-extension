type TrieLeaf = { tag: "leaf"; isToken: boolean }
type TrieBranch = {
  tag: "branch"
  isToken: boolean
  children: Map<string, Trie>
}
type Trie = TrieLeaf | TrieBranch

const trieInit: Trie = { tag: "leaf", isToken: false }

const addWordToTrie =
  (word: string) =>
  (trie: Trie): Trie => {
    if (word.length === 0) {
      if (trie.tag === "branch") {
        return {
          tag: "branch",
          children: trie.children,
          isToken: true
        }
      } else if (trie.tag === "leaf") {
        return {
          tag: "leaf",
          isToken: true
        }
      } else {
        throw new Error("Unexpected Trie: this should not happen...")
      }
    }

    const letter = word[0]
    if (trie.tag === "leaf") {
      const trieChildren = new Map<string, Trie>()
      trieChildren.set(
        letter,
        addWordToTrie(word.slice(1))({
          tag: "leaf",
          isToken: false
        })
      )

      return {
        tag: "branch",
        isToken: trie.isToken,
        children: trieChildren
      }
    } else if (trie.tag === "branch") {
      const searchChildren = trie.children.get(letter)

      if (typeof searchChildren !== "undefined") {
        const trieChildren = trie.children
        trieChildren.set(letter, addWordToTrie(word.slice(1))(searchChildren))

        return {
          ...trie,
          children: trieChildren
        }
      } else {
        const trieChildren = trie.children
        trieChildren.set(
          letter,
          addWordToTrie(word.slice(1))({ tag: "leaf", isToken: false })
        )

        return {
          ...trie,
          children: trieChildren
        }
      }
    }

    return trie
  }

export const buildTrie = (wordList: string[]) => {
  let trie: Trie = { ...trieInit }
  for (let w = 0; w < wordList.length; w++) {
    const word = wordList[w]
    trie = addWordToTrie(word)(trie)
  }

  return trie
}
