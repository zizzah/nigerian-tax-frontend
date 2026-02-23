'use client'

import { useState } from 'react'
import { Loader2, Upload, FileText, Download, Trash2 } from 'lucide-react'
import { useDocuments, useUploadDocument } from '@/lib/hooks/useDocuments'
import type { Document } from '@/lib/types'

// Helper to format currency
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Helper to format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PROCESSED: { bg: '#d4eddf', text: '#1a6b4a' },
  PROCESSING: { bg: '#fff3cd', text: '#856404' },
  PENDING: { bg: '#dce8f8', text: '#1e4d8c' },
  FAILED: { bg: '#fde8e8', text: '#b83232' },
}

const statusLabels: Record<string, string> = {
  PROCESSED: 'Processed',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  FAILED: 'Failed',
}

export default function DocumentsPage() {
  const [uploaded, setUploaded] = useState(false)
  const [uploadedDoc, setUploadedDoc] = useState<Document | null>(null)

  // Fetch data from API
  const { data: documentsData, isLoading } = useDocuments({ limit: 50 })
  const uploadMutation = useUploadDocument()

  const documents: Document[] = documentsData?.documents || []
  const totalDocuments = documentsData?.total || 0

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        documentType: 'RECEIPT',
      })
      setUploadedDoc(result || null)
      setUploaded(true)
      setTimeout(() => {
        setUploaded(false)
        setUploadedDoc(null)
      }, 5000)
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Documents</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading documents...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            gap: 12px;
            color: var(--text-dim);
          }
        `}</style>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Documents</div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Documents</div>
          <div className="page-sub">AI-powered receipt extraction</div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Upload Document</span>
            </div>
            <div style={{ padding: '20px' }}>
              <label className="upload-zone">
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploadMutation.isPending}
                />
                <div className="upload-icon">
                  {uploadMutation.isPending ? (
                    <Loader2 className="animate-spin" size={48} />
                  ) : uploaded ? (
                    '✅'
                  ) : (
                    '📄'
                  )}
                </div>
                <div className="upload-title">
                  {uploaded
                    ? 'Receipt processed!'
                    : uploadMutation.isPending
                    ? 'Processing...'
                    : 'Drop your receipt here'}
                </div>
                <div className="upload-sub">
                  PDF, PNG, JPG up to 10MB · AI will extract data automatically
                </div>
              </label>

              {uploaded && uploadedDoc && (
                <div className="extracted-panel">
                  <div className="extracted-title">✅ AI Extracted Data</div>
                  <div className="extracted-grid">
                    <div className="ext-item">
                      <div className="ext-key">Vendor</div>
                      <div className="ext-val">{uploadedDoc.vendor_name || '-'}</div>
                    </div>
                    <div className="ext-item">
                      <div className="ext-key">Date</div>
                      <div className="ext-val">{formatDate(uploadedDoc.document_date)}</div>
                    </div>
                    <div className="ext-item">
                      <div className="ext-key">Amount</div>
                      <div className="ext-val">{formatCurrency(uploadedDoc.total_amount)}</div>
                    </div>
                    <div className="ext-item">
                      <div className="ext-key">Category</div>
                      <div className="ext-val">{uploadedDoc.category || 'Uncategorized'}</div>
                    </div>
                    <div className="ext-item">
                      <div className="ext-key">VAT</div>
                      <div className="ext-val">{formatCurrency(uploadedDoc.vat_amount)}</div>
                    </div>
                    <div className="ext-item">
                      <div className="ext-key">Status</div>
                      <div className="ext-val">{uploadedDoc.processing_status ? statusLabels[uploadedDoc.processing_status] : 'Unknown'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Documents</span>
              <span className="text-dim">{totalDocuments} files</span>
            </div>
            {documents.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.slice(0, 10).map((doc) => (
                    <tr key={doc.id}>
                      <td className="font-bold">
                        <div className="file-name">
                          <FileText size={16} />
                          {doc.file_name}
                        </div>
                      </td>
                      <td className="text-dim">{formatDate(doc.document_date)}</td>
                      <td>{formatCurrency(doc.total_amount)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: doc.processing_status ? statusColors[doc.processing_status]?.bg || '#ede9de' : '#ede9de',
                          color: doc.processing_status ? statusColors[doc.processing_status]?.text || '#6b6560' : '#6b6560',
                        }}
                      >
                        {doc.processing_status ? statusLabels[doc.processing_status] || doc.processing_status : 'Unknown'}
                      </span>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No documents found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .topbar {
          height: 60px;
          background: var(--paper);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 16px;
          flex-shrink: 0;
        }

        .topbar-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
          flex: 1;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--ink);
        }

        .page-sub {
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dim);
          padding: 10px 20px;
          background: var(--cream);
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .table td {
          padding: 13px 20px;
          border-bottom: 1px solid #f0ede6;
          font-size: 13.5px;
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .table tr:hover td {
          background: var(--gold-pale);
        }

        .font-bold {
          font-weight: 600;
        }

        .file-name {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
        }

        .btn-gold {
          background: var(--gold);
          color: var(--ink);
        }

        .upload-zone {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 48px 32px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fff;
          display: block;
        }

        .upload-zone:hover {
          border-color: var(--gold);
          background: var(--gold-pale);
        }

        .upload-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
          display: flex;
          justify-content: center;
        }

        .upload-title {
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .upload-sub {
          font-size: 13px;
          color: var(--text-dim);
        }

        .extracted-panel {
          background: var(--green-light);
          border: 1px solid #b2d8c4;
          border-radius: 10px;
          padding: 18px;
          margin-top: 20px;
        }

        .extracted-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--green);
          margin-bottom: 12px;
        }

        .extracted-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .ext-item {
          background: #fff;
          border-radius: 8px;
          padding: 12px;
        }

        .ext-key {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          color: var(--text-dim);
          margin-bottom: 4px;
        }

        .ext-val {
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }

        .text-dim {
          color: var(--text-dim);
          font-size: 12px;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
