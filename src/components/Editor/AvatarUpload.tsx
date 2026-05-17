import { useRef, useCallback } from 'react';
import { Upload, X, User } from 'lucide-react';

interface AvatarUploadProps {
  avatar: string;
  onChange: (avatar: string) => void;
}

export default function AvatarUpload({ avatar, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="flex items-center gap-4">
      {/* Avatar Preview */}
      <div className="relative shrink-0">
        {avatar ? (
          <div className="relative group">
            <img
              src={avatar}
              alt="头像"
              className="w-20 h-20 rounded-md object-cover border-2 border-gray-200"
            />
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="删除头像"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="w-20 h-20 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <User size={28} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
          className="hidden"
        />
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors font-medium"
        >
          <Upload size={14} />
          {avatar ? '更换头像' : '上传头像'}
        </button>
        <p className="text-xs text-gray-400 mt-1.5">
          支持 JPG、PNG 格式，最大 2MB
        </p>
      </div>
    </div>
  );
}
