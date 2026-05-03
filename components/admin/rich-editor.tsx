"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Quote,
  Undo,
  Redo,
  Minus,
} from "lucide-react"
import { useCallback } from "react"

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "underline text-[#ff6b35]" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-2xl border-2 border-[#1a1a1a]/10" },
      }),
      Placeholder.configure({
        placeholder: placeholder || "Γράψε εδώ...",
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm md:prose-base max-w-none focus:outline-none min-h-[280px] px-5 py-4",
      },
    },
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const previous = editor.getAttributes("link").href
    const url = window.prompt("URL", previous)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(async () => {
    if (!editor) return
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      if (!res.ok) return
      const data = await res.json()
      editor.chain().focus().setImage({ src: data.url, alt: file.name }).run()
    }
    input.click()
  }, [editor])

  if (!editor) {
    return (
      <div className="border-2 border-[#1a1a1a]/15 rounded-2xl bg-white min-h-[320px]" />
    )
  }

  return (
    <div className="border-2 border-[#1a1a1a]/15 rounded-2xl bg-white overflow-hidden">
      <div className="flex flex-wrap items-center gap-1 border-b border-[#1a1a1a]/10 px-2 py-2 bg-[#f7e7ce]/40">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon={Bold} />
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon={Italic} />
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} icon={Heading2} />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} icon={Heading3} />
        <Sep />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon={List} />
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon={ListOrdered} />
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} icon={Quote} />
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} icon={Minus} />
        <Sep />
        <Btn onClick={setLink} active={editor.isActive("link")} icon={LinkIcon} />
        <Btn onClick={addImage} icon={ImageIcon} />
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()} icon={Undo} />
        <Btn onClick={() => editor.chain().focus().redo().run()} icon={Redo} />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function Btn({
  onClick,
  active,
  icon: Icon,
}: {
  onClick: () => void
  active?: boolean
  icon: any
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded-lg hover:bg-[#f7e7ce] transition-colors ${
        active ? "bg-[#1a1a1a] text-[#ffc107]" : "text-[#1a1a1a]"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}

function Sep() {
  return <span className="w-px h-5 bg-[#1a1a1a]/15 mx-0.5" />
}
