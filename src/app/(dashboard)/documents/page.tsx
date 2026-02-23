'use client'

import { useState, useRef } from 'react'
import { useDocuments, useUploadDocument } from '@/lib/hooks/useDocuments'
import { toast } from 'sonner'
import { 
  Upload, 
  FileText,
  Loader2,
  Check,
  AlertCircle
} from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string }> = {
  PROCESSED: { bg: '#d4eddf', text: '#1a6b4a' },
  PENDING: { bg: '#fff3cd', text: '#856404' },
  FAILED: { bg: '#fde8e8', text: '#b83232' },
}

export default function DocumentsPage() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: documentsData, isLoading, error } = useDocuments({ 
    limit: 50 
  })
  
  const uploadDocument = useUploadDocument()

  const documents = documentsData?.documents || []

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    
    // Simulate processing delay
    setTimeout(async () => {
      try {
        await uploadDocument.mutateAsync({
          file,
          documentType: 'RECEIPT'
        })
        
        setUploadedFile({
          name: file.name,
          vendor: 'Lagos Supplies Co.',
          date: 'Nov 24, 2024',
          amount: 45200,
          category: 'Office Supplies',
          vat: 3390,
          receiptNumber: 'RCP-20241124'
        })
        toast.success('Document processed successfully!')
      } catch (err) {
        toast.error('Failed to process document')
      } finally {
        setIsProcessing(false)
      }
    }, 2000)
  }

  const handleZoneClick = () => {
    fileInputRef.current?.click()
  }

  const resetUpload = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      {/* Topbar */}
      <div style={{ 
        height: '60px', 
        background: '#faf9f6', 
        borderBottom: '1px solid #ddd9cf', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 28px', 
        gap: '16px',
        flexShrink: 0 
      }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#0f0e0b', flex: 1 }}>
          Documents
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Upload Section */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
                Upload Document
              </span>
            </div>
            <div style={{ padding: '20px' }}>
              <div 
                onClick={handleZoneClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? '#c8952a' : '#ddd9cf'}`,
                  borderRadius: '12px',
                  padding: '48px 32px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isDragging ? '#fdf6e3' : '#fff'
                }}
              >
                <input 
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                
                {isProcessing ? (
                  <>
                    <Loader2 size={48} style={{ color: '#c8952a', marginBottom: '16px', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                      Processing document...
                    </div>
                    <div style={{ fontSize: '13px', color: '#9e9990' }}>
                      AI is extracting data from your document
                    </div>
                  </>
                ) : uploadedFile ? (
                  <>
                    <Check size={48} style={{ color: '#1a6b4a', marginBottom: '16px' }} />
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                      Document processed!
                    </div>
                    <div style={{ fontSize: '13px', color: '#9e9990' }}>
                      Drop another document to upload
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📄</div>
                    <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                      Drop your receipt here
                    </div>
                    <div style={{ fontSize: '13px', color: '#9e9990' }}>
                      PDF, PNG, JPG up to 10MB · AI will extract data automatically
                    </div>
                  </>
                )}
              </div>

              {/* Extracted Data Panel */}
              {uploadedFile && (
                <div style={{ 
                  background: '#d4eddf', 
                  border: '1px solid #b2d8c4', 
                  borderRadius: '10px', 
                  padding: '18px', 
                  marginTop: '20px' 
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a6b4a', marginBottom: '12px' }}>
                    ✅ AI Extracted Data — {uploadedFile.name}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>Vendor</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>{uploadedFile.vendor}</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>Date</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>{uploadedFile.date}</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>Amount</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>₦{uploadedFile.amount.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>Category</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>{uploadedFile.category}</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>VAT</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>₦{uploadedFile.vat.toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', marginBottom: '4px' }}>Receipt #</div>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>{uploadedFile.receiptNumber}</div>
                    </div>
                  </div>
                  <button 
                    onClick={resetUpload}
                    style={{ 
                      width: '100%', 
                      marginTop: '14px', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: 'none', 
                      background: '#c8952a', 
                      color: '#0f0e0b',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    Save to Records
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Documents */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
                Recent Documents
              </span>
              <span style={{ fontSize: '12px', color: '#9e9990' }}>{documents.length} files</span>
            </div>

            {isLoading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <Loader2 size={32} style={{ color: '#c8952a', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : error ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#b83232' }}>
                Failed to load documents
              </div>
            ) : documents.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>📄</div>
                <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#0f0e0b', marginBottom: '8px' }}>
                  No documents yet
                </div>
                <div style={{ fontSize: '13px', color: '#9e9990' }}>
                  Upload your first document to get started
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>File</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Date</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Amount</th>
                    <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc: any) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                      <td style={{ padding: '13px 20px', fontSize: '13.5px', fontWeight: 600, color: '#0f0e0b' }}>{doc.file_name || 'Document'}</td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', color: '#9e9990' }}>
                        {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '13px 20px', fontSize: '13px', fontWeight: 500, color: '#0f0e0b' }}>
                        {doc.total_amount ? `₦${parseFloat(doc.total_amount).toLocaleString()}` : '-'}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{ 
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 500,
                          background: statusColors[doc.processing_status]?.bg || '#ede9de',
                          color: statusColors[doc.processing_status]?.text || '#6b6560',
                        }}>
                          {doc.processing_status || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
