"use client"

import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ApplicationSearchProps {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearch: () => void
  onClear: () => void
  searchActive: boolean
}

export function ApplicationSearch({ 
  searchQuery, 
  onSearchQueryChange, 
  onSearch, 
  onClear, 
  searchActive 
}: ApplicationSearchProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <div className="flex gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="搜索申請人姓名、電話或牌位上親友名字..."
          className="pl-10 bg-white dark:bg-card border border-border text-base h-12 placeholder:text-base placeholder:text-foreground/60"
        />
      </div>
      <Button 
        onClick={onSearch} 
        disabled={searchQuery.trim() === ""}
        className={searchQuery.trim() !== "" ? "whitespace-nowrap h-12 text-lg bg-primary hover:bg-primary/90" : "whitespace-nowrap h-12 text-lg"}
      >
        搜索
      </Button>
      {searchActive && (
        <Button onClick={onClear} variant="outline" className="whitespace-nowrap hover:bg-muted hover:text-foreground h-12 text-lg">
          <X className="mr-2 h-4 w-4" />
          清除
        </Button>
      )}
    </div>
  )
}

