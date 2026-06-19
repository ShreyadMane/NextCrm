import { useState, useEffect } from 'react';
import api from '../app/axios';
import { useToast } from './Toast';

export default function FileAttachments({ entityType, entityId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const query = entityType === 'contact' ? `contactId=${entityId}` : `dealId=${entityId}`;
      const { data } = await api.get(`/files/list?${query}`);
      setFiles(data.data);
    } catch (err) {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entityId) fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, entityType]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const query = entityType === 'contact' ? `contactId=${entityId}` : `dealId=${entityId}`;
      await api.post(`/files?${query}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded successfully');
      fetchFiles();
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const getDownloadUrl = (fileId) => {
    // using VITE_API_URL and standard auth token might be tricky with standard anchor tag. 
    // Usually downloading requires a token. We can fetch it as blob or add token to query.
    // For simplicity, we assume cookie auth or a custom download function.
    // In our app, we use Bearer tokens via axios, so standard href won't work natively without exposing token.
    return `/api/v1/files/${fileId}`; 
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const response = await api.get(`/files/${fileId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Download failed');
    }
  };

  return (
    <div className="glass-card" style={{ padding: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Attachments</h2>
      
      <div style={{ marginBottom: 20 }}>
        <label className={`btn-ghost ${uploading ? 'disabled' : ''}`} style={{ width: '100%', justifyContent: 'center', border: '1px dashed var(--border-default)', padding: 20, cursor: uploading ? 'wait' : 'pointer' }}>
          <input type="file" style={{ display: 'none' }} onChange={handleFileChange} disabled={uploading} />
          {uploading ? (
            <><span className="spinner" style={{ width: 16, height: 16 }}></span> Uploading...</>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Click or drag file to upload</span>
            </div>
          )}
        </label>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}><div className="spinner"></div></div>
      ) : files.length === 0 ? (
        <div className="empty-state" style={{ padding: '20px 10px' }}>
          <div className="empty-state-icon" style={{ fontSize: 24, marginBottom: 8 }}>📎</div>
          <p className="empty-state-desc" style={{ fontSize: 12 }}>No attachments yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map(f => (
            <div key={f._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 32, height: 32, background: 'var(--bg-elevated)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                  📄
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{f.filename}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{(f.length / 1024).toFixed(1)} KB • {new Date(f.uploadDate).toLocaleDateString()}</div>
                </div>
              </div>
              <button className="btn-icon" onClick={() => handleDownload(f._id, f.filename)} title="Download">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
