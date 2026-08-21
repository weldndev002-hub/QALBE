import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Fragment, Slice } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  List,
  Link as LinkIcon,
  Link2Off,
  Image as ImageIcon,
} from 'lucide-react';
import * as adminService from '../services/adminService';

interface Props {
  value: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}

const ToolbarButton = ({ active, disabled, title, onClick, children }: ToolbarButtonProps) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
      active ? 'bg-[#7e3188] text-white' : 'text-neutral-600 hover:bg-neutral-200/60'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="w-px h-5 bg-neutral-200 mx-1" />;

/** Deteksi URL (dengan protokol) di teks hasil copas. */
const URL_REGEX = /https?:\/\/[^\s<>"'()]+/gi;

/** Sisipkan teks hasil paste; segmen URL otomatis dijadikan link. */
function insertTextWithAutoLinks(view: import('@tiptap/pm/view').EditorView, text: string): boolean {
  const { state } = view;
  const { schema, tr } = state;
  const re = new RegExp(URL_REGEX.source, 'gi');
  const nodes = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(schema.text(text.slice(last, m.index)));
    let url = m[0];
    // Buang tanda baca di akhir URL (.,;:!? ) biar linknya bersih.
    while (url.length > 1 && '.,;:!?'.includes(url[url.length - 1])) url = url.slice(0, -1);
    if (url.length > 0) {
      nodes.push(schema.text(url, [schema.marks.link.create({ href: url })]));
      last = m.index + url.length;
    } else {
      last = m.index;
    }
  }
  if (last < text.length) nodes.push(schema.text(text.slice(last)));
  if (nodes.length === 0) return false;
  tr.deleteSelection();
  tr.replaceSelection(new Slice(Fragment.from(nodes), 0, 0));
  view.dispatch(tr);
  return true;
}

/** Image extension dengan attribute data-align untuk alignment gambar. */
const AlignableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      'data-align': {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-align') || 'left',
        renderHTML: (attributes) => {
          const align = attributes['data-align'] as string;
          if (!align || align === 'left') return {};
          return { 'data-align': align };
        },
      },
    };
  },
});

/** Rich text editor (TipTap) untuk isi konten admin. Output HTML. */
export default function RichTextEditor({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, defaultProtocol: 'https' }),
      AlignableImage,
    ],
    content: value,
    editorProps: {
      // Copas teks berisi URL → URL otomatis terdeteksi jadi link.
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData('text/html') ?? '';
        // Paste HTML (copy dari browser/web) biasanya sudah punya tag <a> — biarkan default TipTap.
        if (html) return false;
        const text = event.clipboardData?.getData('text/plain') ?? '';
        if (!text) return false;
        const re = new RegExp(URL_REGEX.source, 'gi');
        if (!re.test(text)) return false;
        event.preventDefault();
        return insertTextWithAutoLinks(view, text);
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sinkron saat value berubah dari luar (mis. ganti konten yang sedang diedit)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  /** Upload file gambar, lalu sisipkan di posisi kursor. */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    // Reset input supaya file yang sama bisa dipilih lagi
    if (fileInputRef.current) fileInputRef.current.value = '';

    setUploading(true);
    try {
      const url = await adminService.uploadAdminContentMedia(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err: any) {
      console.error('Upload gambar gagal:', err);
      alert('Gagal mengunggah gambar: ' + (err.message || ''));
    } finally {
      setUploading(false);
    }
  };

  /** Set alignment pada gambar yang sedang terpilih. */
  const setImageAlign = (align: string) => {
    if (!editor) return;
    editor.chain().focus().updateAttributes('image', { 'data-align': align }).run();
  };

  /** Cek apakah gambar terpilih dengan alignment tertentu. */
  const isImageAlign = (align: string) => {
    if (!editor) return false;
    return editor.isActive('image') && editor.getAttributes('image')['data-align'] === align;
  };

  if (!editor) return null;

  const hasImageSelected = editor.isActive('image');

  const setLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Masukkan URL link', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white focus-within:border-purple-500 transition-colors">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-neutral-100 bg-neutral-50">
        <ToolbarButton active={editor.isActive('bold')} title="Tebal" onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('italic')} title="Miring" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('underline')} title="Garis bawah" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={16} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={editor.isActive('heading', { level: 1 })} title="Judul besar" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 2 })} title="Judul sedang" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('heading', { level: 3 })} title="Judul kecil" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={16} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={editor.isActive({ textAlign: 'left' })} title="Rata kiri" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: 'center' })} title="Rata tengah" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: 'right' })} title="Rata kanan" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive({ textAlign: 'justify' })} title="Rata kiri kanan" onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <AlignJustify size={16} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={editor.isActive('orderedList')} title="Penomoran" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={16} />
        </ToolbarButton>
        <ToolbarButton active={editor.isActive('bulletList')} title="Poin" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={16} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton active={editor.isActive('link')} title="Sisipkan link" onClick={setLink}>
          <LinkIcon size={16} />
        </ToolbarButton>
        <ToolbarButton
          disabled={!editor.isActive('link')}
          title="Hapus link"
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Link2Off size={16} />
        </ToolbarButton>

        <Divider />

        {/* Tombol sisipkan gambar */}
        <ToolbarButton
          disabled={uploading}
          title={uploading ? 'Mengunggah...' : 'Sisipkan gambar'}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon size={16} />
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Tombol alignment gambar (aktif hanya saat gambar terpilih) */}
        <ToolbarButton
          active={isImageAlign('left')}
          disabled={!hasImageSelected}
          title="Gambar rata kiri"
          onClick={() => setImageAlign('left')}
        >
          <AlignLeft size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={isImageAlign('center')}
          disabled={!hasImageSelected}
          title="Gambar rata tengah"
          onClick={() => setImageAlign('center')}
        >
          <AlignCenter size={16} />
        </ToolbarButton>
        <ToolbarButton
          active={isImageAlign('right')}
          disabled={!hasImageSelected}
          title="Gambar rata kanan"
          onClick={() => setImageAlign('right')}
        >
          <AlignRight size={16} />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
}