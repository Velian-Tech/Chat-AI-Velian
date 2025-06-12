import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, Code, X } from 'lucide-react';

interface AttachmentUploadProps {
  onAttachmentAdd: (attachment: any) => void;
  onClose: () => void;
}

export default function AttachmentUpload({ onAttachmentAdd, onClose }: AttachmentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          onAttachmentAdd({
            id: Date.now().toString(),
            name: file.name,
            type: file.type.startsWith('image/') ? 'image' : 'file',
            content: e.target?.result,
            size: file.size
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const attachmentTypes = [
    {
      icon: Image,
      label: 'Gambar',
      accept: 'image/*',
      color: 'text-green-500'
    },
    {
      icon: FileText,
      label: 'Dokumen',
      accept: '.pdf,.doc,.docx,.txt',
      color: 'text-blue-500'
    },
    {
      icon: Code,
      label: 'Kode',
      accept: '.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css',
      color: 'text-purple-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Tambah Lampiran
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {attachmentTypes.map((type, index) => (
          <button
            key={index}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = type.accept;
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
          >
            <type.icon className={`w-6 h-6 ${type.color} mb-2`} />
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {type.label}
            </span>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
        Maksimal 10MB per file
      </div>
    </motion.div>
  );
}