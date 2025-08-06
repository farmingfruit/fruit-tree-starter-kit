'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import { Bold as BoldIcon, Italic as ItalicIcon, Link as LinkIcon } from 'lucide-react';
import { useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';

interface WysiwygEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onMergeTagInsert?: (tag: string) => void;
  onEmojiInsert?: (emoji: string) => void;
}

export interface WysiwygEditorRef {
  insertText: (text: string) => void;
  getSelection: () => { from: number; to: number } | null;
  focus: () => void;
}

export const WysiwygEditor = forwardRef<WysiwygEditorRef, WysiwygEditorProps>(
  ({ content, onChange, placeholder, className = '', onMergeTagInsert, onEmojiInsert }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          // Disable some extensions we don't need for church communications
          heading: false,
          code: false,
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
        }),
        Bold.configure({
          HTMLAttributes: {
            class: 'font-semibold',
          },
        }),
        Italic.configure({
          HTMLAttributes: {
            class: 'italic',
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: 'text-blue-600 underline cursor-pointer',
            target: '_blank',
            rel: 'noopener noreferrer',
          },
        }),
        Placeholder.configure({
          placeholder: placeholder || 'Write your message here...',
          emptyEditorClass: 'is-editor-empty',
        }),
      ],
      content: content,
      immediatelyRender: false,
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange(html);
      },
      editorProps: {
        attributes: {
          class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 text-base leading-relaxed ${className}`,
          'data-placeholder': placeholder || 'Write your message here...',
        },
      },
    });

    // Update editor content when prop changes
    useEffect(() => {
      if (editor && content !== editor.getHTML()) {
        editor.commands.setContent(content);
      }
    }, [content, editor]);

    // Expose methods through ref
    useImperativeHandle(ref, () => ({
      insertText: (text: string) => {
        if (editor) {
          editor.commands.insertContent(text);
        }
      },
      getSelection: () => {
        if (editor) {
          const { from, to } = editor.state.selection;
          return { from, to };
        }
        return null;
      },
      focus: () => {
        if (editor) {
          editor.commands.focus();
        }
      },
    }));

    const handleBold = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleBold().run();
      }
    }, [editor]);

    const handleItalic = useCallback(() => {
      if (editor) {
        editor.chain().focus().toggleItalic().run();
      }
    }, [editor]);

    const handleLink = useCallback(() => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        
        const url = prompt('Enter the URL:', 'https://');
        if (url) {
          if (text) {
            // If text is selected, make it a link
            editor
              .chain()
              .focus()
              .extendMarkRange('link')
              .setLink({ href: url })
              .run();
          } else {
            // If no text selected, insert new link
            const linkText = prompt('Enter link text:', 'link text');
            if (linkText) {
              editor
                .chain()
                .focus()
                .insertContent(`<a href="${url}" class="text-blue-600 underline cursor-pointer" target="_blank" rel="noopener noreferrer">${linkText}</a>`)
                .run();
            }
          }
        }
      }
    }, [editor]);

    // Handle keyboard shortcuts
    useEffect(() => {
      if (editor) {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
              case 'b':
                event.preventDefault();
                handleBold();
                break;
              case 'i':
                event.preventDefault();
                handleItalic();
                break;
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
      }
    }, [editor, handleBold, handleItalic]);

    if (!editor) {
      return (
        <div className="min-h-[300px] p-4 border rounded-md bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      );
    }

    return (
      <div className="border rounded-md bg-white" style={{ border: '1px solid #E1E8ED' }}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b bg-gray-50" style={{ borderColor: '#E1E8ED' }}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleBold}
            className={`h-8 w-8 p-0 hover:bg-gray-200 transition-colors ${
              editor.isActive('bold') ? 'bg-gray-200 text-blue-600' : ''
            }`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className={`h-8 w-8 p-0 hover:bg-gray-200 transition-colors ${
              editor.isActive('italic') ? 'bg-gray-200 text-blue-600' : ''
            }`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLink}
            className={`h-8 w-8 p-0 hover:bg-gray-200 transition-colors ${
              editor.isActive('link') ? 'bg-gray-200 text-blue-600' : ''
            }`}
            title="Add Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <div className="ml-2 text-xs text-gray-500 font-medium">
            Select text and click buttons to format, or use Ctrl+B/Ctrl+I
          </div>
        </div>

        {/* Editor Content */}
        <div className="relative">
          <EditorContent 
            editor={editor}
            className="min-h-[300px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-20 transition-all"
          />
        </div>

      </div>
    );
  }
);

WysiwygEditor.displayName = 'WysiwygEditor';