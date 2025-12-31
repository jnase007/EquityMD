import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Eye, Upload, Folder, 
  X, Loader2, File, Image, FileSpreadsheet
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  deal_id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  category: string;
  created_at: string;
}

interface DocumentRoomProps {
  dealId: string;
  dealTitle: string;
  isOwner: boolean;
  syndicatorId: string;
}

const DOCUMENT_CATEGORIES = [
  { value: 'overview', label: 'Investment Overview', icon: FileText },
  { value: 'financials', label: 'Financial Projections', icon: FileSpreadsheet },
  { value: 'property_info', label: 'Property Information', icon: Folder },
  { value: 'marketing', label: 'Marketing Materials', icon: Image },
  { value: 'other', label: 'Other Documents', icon: File },
];

export function DocumentRoom({ dealId, dealTitle, isOwner, syndicatorId }: DocumentRoomProps) {
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<string>('other');
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [dealId]);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('deal_documents')
        .select('*')
        .eq('deal_id', dealId)
        .order('category', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadDocument() {
    if (!uploadFile || !user) return;

    setUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${dealId}/${Date.now()}_${uploadFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('deal-documents')
        .upload(fileName, uploadFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('deal-documents')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase
        .from('deal_documents')
        .insert({
          deal_id: dealId,
          name: uploadFile.name,
          description: uploadDescription || null,
          file_url: publicUrl,
          file_type: uploadFile.type,
          file_size: uploadFile.size,
          category: uploadCategory,
        });

      if (insertError) throw insertError;

      toast.success('Document uploaded successfully!');
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadDescription('');
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  }

  async function deleteDocument(docId: string) {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('deal_documents')
        .delete()
        .eq('id', docId);

      if (error) throw error;

      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (fileType.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const groupedDocuments = DOCUMENT_CATEGORIES.map(cat => ({
    ...cat,
    docs: documents.filter(d => d.category === cat.value)
  })).filter(cat => cat.docs.length > 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Documents</h3>
              <p className="text-blue-100 text-sm">{documents.length} file{documents.length !== 1 ? 's' : ''} available</p>
            </div>
          </div>
          
          {isOwner && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload
            </button>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents have been uploaded yet.</p>
            {isOwner && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload First Document
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {groupedDocuments.map((category) => (
              <div key={category.value}>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  {category.label}
                </h4>
                <div className="space-y-2">
                  {category.docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        {getFileIcon(doc.file_type)}
                        <div>
                          <p className="font-medium text-gray-900">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(doc.file_size)}
                            {doc.description && ` • ${doc.description}`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                        <a
                          href={doc.file_url}
                          download
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="h-5 w-5" />
                        </a>
                        {isOwner && (
                          <button
                            onClick={() => deleteDocument(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            title="Delete"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Contact CTA for non-owners */}
        {!isOwner && documents.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Interested in this deal?</strong> Contact the syndicator directly for full investment documents including PPM, subscription agreement, and operating agreement.
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Upload Document</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">File</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                  {uploadFile ? (
                    <div className="flex items-center justify-center gap-3">
                      {getFileIcon(uploadFile.type)}
                      <span className="font-medium">{uploadFile.name}</span>
                      <button
                        onClick={() => setUploadFile(null)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to select a file</p>
                      <p className="text-sm text-gray-400">PDF, Excel, Word, or images</p>
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500"
                >
                  {DOCUMENT_CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  placeholder="Brief description of this document"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-0 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={uploadDocument}
                disabled={!uploadFile || uploading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Upload Document
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
