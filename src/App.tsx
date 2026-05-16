import { useState, useRef } from 'react';
import { FileText, Download, Printer, FileSpreadsheet, Save, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import ResumeForm from './components/Editor/ResumeForm';
import ResumePreview from './components/Preview/ResumePreview';
import { exportToPdf } from './utils/exportPdf';
import { exportToWord } from './utils/exportWord';
import { exportResume, importResume } from './utils/importExport';
import { useResumeStore } from './stores/resumeStore';

function App() {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const data = useResumeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleExportPdf = () => {
    exportToPdf('resume-preview', `${data.personalInfo.name || '简历'}.pdf`);
  };

  const handleExportWord = () => {
    exportToWord(data, `${data.personalInfo.name || '简历'}.docx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveJson = () => {
    exportResume(data);
    showToast('已保存到本地', 'success');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedData = await importResume(file);
      data.loadData(importedData);
      showToast('导入成功', 'success');
    } catch (err: any) {
      showToast(err.message || '导入失败', 'error');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in"
          style={{
            backgroundColor: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: toast.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold text-gray-800">简历生成器</h1>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'edit' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            编辑
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            预览
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleImportClick}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Upload size={16} />
            <span className="hidden sm:inline">导入</span>
          </button>
          <button
            onClick={handleSaveJson}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Save size={16} />
            <span className="hidden sm:inline">保存</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">打印</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">Word</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        <div
          className={`w-full md:w-[450px] lg:w-[500px] bg-gray-50 overflow-y-auto p-4 ${
            activeTab === 'edit' ? 'block' : 'hidden md:block'
          }`}
        >
          <ResumeForm />
        </div>

        {/* Preview Panel */}
        <div
          className={`flex-1 bg-gray-200 overflow-y-auto ${
            activeTab === 'preview' ? 'block' : 'hidden md:block'
          }`}
        >
          <ResumePreview />
        </div>
      </div>
    </div>
  );
}

export default App;
