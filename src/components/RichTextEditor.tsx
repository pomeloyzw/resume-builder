import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import { useEffect } from 'react'

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 p-2 bg-gray-50 rounded-t-md">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer ${editor.isActive('bold') ? 'bg-gray-200 text-blue-600 px-1.5' : 'text-gray-600'}`}
        type="button"
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer ${editor.isActive('italic') ? 'bg-gray-200 text-blue-600 px-1.5' : 'text-gray-600'}`}
        type="button"
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer ${editor.isActive('bulletList') ? 'bg-gray-200 text-blue-600 px-1.5' : 'text-gray-600'}`}
        type="button"
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded-md text-sm hover:bg-gray-200 transition-colors cursor-pointer ${editor.isActive('orderedList') ? 'bg-gray-200 text-blue-600 px-1.5' : 'text-gray-600'}`}
        type="button"
        title="Numbered List"
      >
        <ListOrdered size={16} />
      </button>
    </div>
  )
}

export default function RichTextEditor({ content, onChange, placeholder = "Type here..." }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        strike: false,
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3 text-sm text-gray-800 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // Sync content when it changes externally (e.g. loading a different profile)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border border-gray-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white relative w-full overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style suppressHydrationWarning>{`
        /* Tiptap Placeholder CSS */
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .tiptap ul p, .tiptap ol p {
          display: inline;
        }
        
        .tiptap ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
        
        .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.25rem;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  )
}
