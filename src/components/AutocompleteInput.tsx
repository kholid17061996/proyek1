'use client'

import React, { useState, useEffect, useRef } from 'react'

interface AutocompleteInputProps {
  value: string
  onChange: (val: string) => void
  options: string[]
  placeholder?: string
  className?: string
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder = '',
  className = ''
}: AutocompleteInputProps) {
  const [suggestion, setSuggestion] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!value) {
      setSuggestion('')
      return
    }

    const lowerValue = value.toLowerCase()
    const match = options.find(opt => opt.toLowerCase().startsWith(lowerValue))
    
    if (match) {
      // Keep the user's typed case for the matched part, and use the option's original case for the rest
      const ghost = value + match.slice(value.length)
      setSuggestion(ghost)
    } else {
      setSuggestion('')
    }
  }, [value, options])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter') && suggestion && suggestion !== value) {
      e.preventDefault()
      onChange(suggestion)
    }
  }

  // Combine standard classes with custom ones
  const baseWrapperClass = "relative flex items-center w-full"
  
  return (
    <div className={baseWrapperClass}>
      {/* Ghost Text Input (Bottom Layer) */}
      <input
        type="text"
        readOnly
        tabIndex={-1}
        value={suggestion}
        className={`absolute inset-0 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 outline-none font-bold text-left pointer-events-none ${className}`}
        style={{ color: suggestion ? '#9ca3af' : 'transparent', backgroundColor: '#f9fafb' }} // gray-400 for text, gray-50 for bg
      />
      
      {/* Real Input (Top Layer) */}
      <input
        ref={inputRef}
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`relative z-10 w-full px-5 py-3.5 bg-transparent border border-transparent focus:border-emas focus:ring-2 focus:ring-emas rounded-2xl outline-none transition-all placeholder:text-gray-400 font-bold text-left ${className}`}
      />
    </div>
  )
}
