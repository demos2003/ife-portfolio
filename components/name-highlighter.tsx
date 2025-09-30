"use client"

import React from "react"

interface NameHighlighterProps {
  text: string
}

// Highlights occurrences of "Ifeoluwa Okusanya" in any order/case
export function NameHighlighter({ text }: NameHighlighterProps) {
  const pattern = /(ifeoluwa\s+okusanya|okusanya\s+ifeoluwa)/gi

  const parts = text.split(pattern)

  return (
    <>
      {parts.map((part, index) => {
        if (part.match(pattern)) {
          return (
            <span key={index} className="text-pink-500 font-bold text-[30px]">
              {part}
            </span>
          )
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </>
  )
}


