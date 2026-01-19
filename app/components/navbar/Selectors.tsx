import React from 'react'
import { CustomSelect } from '../CustomSelect'
import { FONTS, HIGHLIGHT_THEMES } from '@/app/config/constants'
import { VscTypeHierarchy, VscColorMode } from 'react-icons/vsc'

interface SelectorsProps {
  langFilter: string;
  languages: any[];
  setLangFilter: (lang: string) => void;
  selectedFont: any;
  setSelectedFont: (font: any) => void;
  editorTheme: any;
  setEditorTheme: (theme: any) => void;
}

const Selectors = ({ 
  langFilter, 
  languages, 
  setLangFilter, 
  selectedFont, 
  setSelectedFont, 
  editorTheme, 
  setEditorTheme 
}: SelectorsProps) => {
  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <CustomSelect 
        value={langFilter} 
        options={languages} 
        onChange={setLangFilter} 
        isLang={true} 
        label="" 
      />

      {/* Font Family Selector */}
      <CustomSelect 
        value={selectedFont.name} 
        options={FONTS} 
        onChange={setSelectedFont} 
        icon={VscTypeHierarchy} 
        label="" 
      />

      {/* Highlight Theme Selector */}
      <CustomSelect 
        value={editorTheme.name} 
        options={HIGHLIGHT_THEMES} 
        onChange={setEditorTheme} 
        icon={VscColorMode} 
        label="" 
      />
    </div>
  )
}

export default Selectors