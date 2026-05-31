'use client'

import { useState } from 'react'
import { Loader2, FileText, Building2, ChevronRight, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { useReceipts, useBankStatements, useUploadDocument } from '@/lib/hooks/useDocuments'

// ── Types ──────────────────────────────────────────────────────────────────────

type DocumentType = 'RECEIPT' | 'INVOICE' | 'BANK_STATEMENT' | 'TAX_DOCUMENT' | 'OTHER'

interface LineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

interface Receipt {
  id: string
  status: string
  original_filename: string
  document_date: string | null
  vendor_name: string | null
  vendor_tin: string | null
  vendor_address: string | null
  vendor_phone: string | null
  total_amount: string | number
  subtotal: string | number
  vat_amount: string | number
  vat_rate: string | number
  category: string | null
  payment_method: string | null
  payment_reference: string | null
  line_items: LineItem[] | null
  confidence_score: string | number | null
  requires_review: boolean
  created_at: string
}

interface BankStatement {
  id: string
  status: string
  original_filename: string
  bank_name: string | null
  account_name: string | null
  account_number: string | null
  period_from: string | null
  period_to: string | null
  opening_balance: string | number | null
  closing_balance: string | number | null
  total_inflow: string | number | null
  total_outflow: string | number | null
  inflow_transactions: Array<{ date: string; description: string; amount: number; balance?: number }> | null
  outflow_transactions: Array<{ date: string; description: string; amount: number; balance?: number }> | null
  confidence_score: string | number | null
  requires_review: boolean
  created_at: string
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const toNum = (v: string | number | null | undefined): number => {
  if (v === null || v === undefined) return 0
  return typeof v === 'string' ? parseFloat(v) : v
}

const formatCurrency = (v: string | number | null | undefined): string => {
  const num = toNum(v)
  if (isNaN(num)) return '—'
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

const formatDate = (d: string | null | undefined): string => {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return d
  }
}

const formatDateRange = (from: string | null, to: string | null): string => {
  if (!from && !to) return '—'
  return `${formatDate(from)} – ${formatDate(to)}`
}

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; Icon: React.ComponentType<{ size: number }> }> = {
  COMPLETED:     { label: 'Processed',  bg: '#d4eddf', color: '#1a6b4a', Icon: CheckCircle2 },
  PROCESSING:    { label: 'Processing', bg: '#fff3cd', color: '#856404', Icon: Clock },
  PENDING:       { label: 'Pending',    bg: '#dce8f8', color: '#1e4d8c', Icon: Clock },
  FAILED:        { label: 'Failed',     bg: '#fde8e8', color: '#b83232', Icon: XCircle },
  REVIEW_NEEDED: { label: 'Review',     bg: '#fff0d4', color: '#92550a', Icon: AlertCircle },
}

function StatusBadge({ status, requiresReview }: { status: string; requiresReview: boolean }) {
  const key = requiresReview && status === 'COMPLETED' ? 'REVIEW_NEEDED' : status
  const cfg = STATUS_CONFIG[key] ?? { label: status, bg: '#ede9de', color: '#6b6560', Icon: Clock }
  const { label, bg, color, Icon } = cfg
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: bg, color, padding: '3px 10px',
      borderRadius: 20, fontSize: 11, fontWeight: 500,
    }}>
      <Icon size={11} />
      {label}
    </span>
  )
}

// ── Upload zone ────────────────────────────────────────────────────────────────

function UploadZone({
  onUpload,
  isPending,
}: {
  onUpload: (file: File, type: DocumentType) => void
  isPending: boolean
}) {
  const [docType, setDocType] = useState<DocumentType>('RECEIPT')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file, docType)
    e.target.value = ''
  }

  return (
    <div style={{ padding: '20px 20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
          Document type
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['RECEIPT', 'BANK_STATEMENT'] as DocumentType[]).map((t) => (
            <button
              key={t}
              onClick={() => setDocType(t)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: docType === t ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                background: docType === t ? 'var(--gold-pale)' : '#fff',
                color: docType === t ? 'var(--ink)' : 'var(--text-dim)',
                fontSize: 12,
                fontWeight: docType === t ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {t === 'RECEIPT' ? '🧾 Receipt / Invoice' : '🏦 Bank Statement'}
            </button>
          ))}
        </div>
      </div>

      <label style={{
        display: 'block',
        border: '2px dashed var(--border)',
        borderRadius: 12,
        padding: '40px 32px',
        textAlign: 'center',
        cursor: isPending ? 'not-allowed' : 'pointer',
        background: isPending ? 'var(--cream)' : '#fff',
        transition: 'all 0.2s',
      }}>
        <input
          type="file"
          accept="application/pdf,image/png,image/jpeg"
          onChange={handleChange}
          disabled={isPending}
          style={{ display: 'none' }}
        />
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.5, display: 'flex', justifyContent: 'center' }}>
          {isPending ? <Loader2 size={36} className="animate-spin" /> : <FileText size={36} />}
        </div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
          {isPending ? 'Processing…' : 'Drop your file here'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
          PDF, PNG, JPG up to 10MB · AI extracts data automatically
        </div>
      </label>
    </div>
  )
}

// ── Receipts table ─────────────────────────────────────────────────────────────

function ReceiptsTable({ items }: { items: Receipt[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
        No receipts yet. Upload a receipt or invoice above.
      </div>
    )
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Vendor', 'Date', 'Category', 'Total', 'VAT', 'Status', ''].map((h) => (
              <th key={h} style={{
                textAlign: 'left', fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--text-dim)', padding: '10px 16px',
                background: 'var(--cream)', fontWeight: 500,
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <>
              <tr
                key={r.id}
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                style={{ cursor: 'pointer' }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{r.vendor_name || '—'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>{r.original_filename}</div>
                </td>
                <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 13 }}>{formatDate(r.document_date)}</td>
                <td style={tdStyle}>
                  {r.category ? (
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
                      background: 'var(--gold-pale)', color: 'var(--ink)',
                      fontSize: 11, fontWeight: 500,
                    }}>{r.category}</span>
                  ) : '—'}
                </td>
                <td style={{ ...tdStyle, fontWeight: 600, fontSize: 13 }}>{formatCurrency(r.total_amount)}</td>
                <td style={{ ...tdStyle, color: 'var(--text-dim)', fontSize: 13 }}>{formatCurrency(r.vat_amount)}</td>
                <td style={tdStyle}>
                  <StatusBadge status={r.status} requiresReview={r.requires_review} />
                </td>
                <td style={tdStyle}>
                  <ChevronRight
                    size={14}
                    style={{
                      color: 'var(--text-dim)',
                      transition: 'transform 0.2s',
                      transform: expanded === r.id ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                  />
                </td>
              </tr>

              {expanded === r.id && (
                <tr key={`${r.id}-detail`}>
                  <td colSpan={7} style={{ padding: 0, background: '#fafaf8', borderBottom: '1px solid var(--border)' }}>
                    <ReceiptDetail receipt={r} />
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ReceiptDetail({ receipt: r }: { receipt: Receipt }) {
  return (
    <div style={{ padding: '16px 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div>
        <div style={sectionLabel}>Vendor details</div>
        <div style={detailGrid}>
          <DetailRow label="Name" value={r.vendor_name} />
          <DetailRow label="TIN" value={r.vendor_tin} />
          <DetailRow label="Phone" value={r.vendor_phone ?? undefined} />
          <DetailRow label="Address" value={r.vendor_address} />
          <DetailRow label="Payment" value={r.payment_method} />
          <DetailRow label="Reference" value={r.payment_reference} />
        </div>
      </div>

      <div>
        <div style={sectionLabel}>Financials</div>
        <div style={detailGrid}>
          <DetailRow label="Subtotal" value={formatCurrency(r.subtotal)} />
          <DetailRow label={`VAT (${r.vat_rate}%)`}  value={formatCurrency(r.vat_amount)} />
          <DetailRow label="Total" value={formatCurrency(r.total_amount)} bold />
        </div>

        {r.line_items && r.line_items.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={sectionLabel}>Line items</div>
            {r.line_items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: '1px solid var(--border)',
                fontSize: 12,
              }}>
                <span style={{ color: 'var(--ink)', flex: 1 }}>{item.description}</span>
                <span style={{ color: 'var(--text-dim)', marginRight: 12 }}>×{item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Bank statements table ──────────────────────────────────────────────────────

function BankStatementsTable({ items }: { items: BankStatement[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
        No bank statements yet. Upload a bank statement above.
      </div>
    )
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['Bank / Account', 'Period', 'Inflow', 'Outflow', 'Net', 'Status', ''].map((h) => (
              <th key={h} style={{
                textAlign: 'left', fontSize: 11, textTransform: 'uppercase',
                letterSpacing: '0.5px', color: 'var(--text-dim)', padding: '10px 16px',
                background: 'var(--cream)', fontWeight: 500,
                borderBottom: '1px solid var(--border)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((s) => {
            const net = toNum(s.total_inflow) - toNum(s.total_outflow)
            return (
              <>
                <tr
                  key={s.id}
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{s.bank_name || '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                      {s.account_name || s.account_number || s.original_filename}
                    </div>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 13, color: 'var(--text-dim)' }}>
                    {formatDateRange(s.period_from, s.period_to)}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 13, color: '#1a6b4a' }}>
                    {formatCurrency(s.total_inflow)}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600, fontSize: 13, color: '#b83232' }}>
                    {formatCurrency(s.total_outflow)}
                  </td>
                  <td style={{
                    ...tdStyle, fontWeight: 600, fontSize: 13,
                    color: net >= 0 ? '#1a6b4a' : '#b83232',
                  }}>
                    {net >= 0 ? '+' : ''}{formatCurrency(net)}
                  </td>
                  <td style={tdStyle}>
                    <StatusBadge status={s.status} requiresReview={s.requires_review} />
                  </td>
                  <td style={tdStyle}>
                    <ChevronRight
                      size={14}
                      style={{
                        color: 'var(--text-dim)',
                        transition: 'transform 0.2s',
                        transform: expanded === s.id ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}
                    />
                  </td>
                </tr>

                {expanded === s.id && (
                  <tr key={`${s.id}-detail`}>
                    <td colSpan={7} style={{ padding: 0, background: '#fafaf8', borderBottom: '1px solid var(--border)' }}>
                      <BankStatementDetail statement={s} />
                    </td>
                  </tr>
                )}
              </>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function BankStatementDetail({ statement: s }: { statement: BankStatement }) {
  const [txnTab, setTxnTab] = useState<'inflow' | 'outflow'>('inflow')
  const txns = txnTab === 'inflow' ? s.inflow_transactions : s.outflow_transactions

  return (
    <div style={{ padding: '16px 20px 20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div>
          <div style={sectionLabel}>Account details</div>
          <div style={detailGrid}>
            <DetailRow label="Account name" value={s.account_name} />
            <DetailRow label="Account number" value={s.account_number} />
            <DetailRow label="Bank" value={s.bank_name} />
          </div>
        </div>
        <div>
          <div style={sectionLabel}>Balances</div>
          <div style={detailGrid}>
            <DetailRow label="Opening" value={formatCurrency(s.opening_balance)} />
            <DetailRow label="Closing" value={formatCurrency(s.closing_balance)} />
            <DetailRow label="Total inflow" value={formatCurrency(s.total_inflow)} />
            <DetailRow label="Total outflow" value={formatCurrency(s.total_outflow)} />
          </div>
        </div>
      </div>

      {(s.inflow_transactions?.length || s.outflow_transactions?.length) ? (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['inflow', 'outflow'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTxnTab(t)}
                style={{
                  padding: '5px 14px', borderRadius: 20,
                  border: txnTab === t ? '1.5px solid var(--gold)' : '1px solid var(--border)',
                  background: txnTab === t ? 'var(--gold-pale)' : 'transparent',
                  fontSize: 12, fontWeight: txnTab === t ? 600 : 400,
                  color: 'var(--ink)', cursor: 'pointer',
                }}
              >
                {t === 'inflow' ? '↑ Credits' : '↓ Debits'}
                <span style={{ marginLeft: 6, opacity: 0.6 }}>
                  ({(t === 'inflow' ? s.inflow_transactions : s.outflow_transactions)?.length ?? 0})
                </span>
              </button>
            ))}
          </div>

          {txns && txns.length > 0 ? (
            <div style={{ maxHeight: 240, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--cream)' }}>
                    {['Date', 'Description', 'Amount', 'Balance'].map((h) => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 12px', fontWeight: 500,
                        color: 'var(--text-dim)', fontSize: 11,
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0,
                        background: 'var(--cream)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txns.map((txn, i) => (
                    <tr key={i}>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #f0ede6', color: 'var(--text-dim)' }}>
                        {formatDate(txn.date)}
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #f0ede6' }}>
                        {txn.description}
                      </td>
                      <td style={{
                        padding: '7px 12px', borderBottom: '1px solid #f0ede6',
                        fontWeight: 600,
                        color: txnTab === 'inflow' ? '#1a6b4a' : '#b83232',
                      }}>
                        {formatCurrency(txn.amount)}
                      </td>
                      <td style={{ padding: '7px 12px', borderBottom: '1px solid #f0ede6', color: 'var(--text-dim)' }}>
                        {txn.balance != null ? formatCurrency(txn.balance) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No transactions recorded.</div>
          )}
        </div>
      ) : null}
    </div>
  )
}

// ── Small components ───────────────────────────────────────────────────────────

function DetailRow({ label, value, bold }: { label: string; value?: string | null; bold?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ color: 'var(--ink)', fontWeight: bold ? 600 : 400, textAlign: 'right', maxWidth: '60%' }}>
        {value || '—'}
      </span>
    </div>
  )
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #f0ede6',
  verticalAlign: 'top',
}

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  color: 'var(--text-dim)',
  fontWeight: 500,
  marginBottom: 8,
}

const detailGrid: React.CSSProperties = {
  borderTop: '1px solid var(--border)',
  paddingTop: 8,
}

// ── Tab bar ────────────────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
  receiptCount,
  statementCount,
}: {
  active: 'receipts' | 'statements'
  onChange: (t: 'receipts' | 'statements') => void
  receiptCount: number
  statementCount: number
}) {
  return (
    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' }}>
      {([
        { key: 'receipts', label: 'Receipts & Invoices', Icon: FileText, count: receiptCount },
        { key: 'statements', label: 'Bank Statements', Icon: Building2, count: statementCount },
      ] as const).map(({ key, label, Icon, count }) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '12px 16px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: active === key ? 600 : 400,
            color: active === key ? 'var(--ink)' : 'var(--text-dim)',
            borderBottom: active === key ? '2px solid var(--gold)' : '2px solid transparent',
            marginBottom: -1, transition: 'color 0.15s',
          }}
        >
          <Icon size={14} />
          {label}
          <span style={{
            background: active === key ? 'var(--gold)' : 'var(--border)',
            color: 'var(--ink)',
            fontSize: 10, fontWeight: 600,
            padding: '1px 7px', borderRadius: 10,
          }}>{count}</span>
        </button>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'receipts' | 'statements'>('receipts')
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const { data: receiptsData, isLoading: receiptsLoading } = useReceipts({ limit: 50 })
  const { data: statementsData, isLoading: statementsLoading } = useBankStatements({ limit: 50 })
  const uploadMutation = useUploadDocument()

  const receipts: Receipt[] = (receiptsData as any)?.receipts ?? []
  const statements: BankStatement[] = (statementsData as any)?.statements ?? []
  const isLoading = receiptsLoading || statementsLoading

  const handleUpload = async (file: File, documentType: DocumentType) => {
    try {
      await uploadMutation.mutateAsync({ file, documentType })
      setUploadSuccess(documentType === 'BANK_STATEMENT' ? 'Bank statement uploaded — AI is extracting transactions.' : 'Receipt uploaded — AI is extracting data.')
      setActiveTab(documentType === 'BANK_STATEMENT' ? 'statements' : 'receipts')
      setTimeout(() => setUploadSuccess(null), 6000)
    } catch {
      // error state handled by mutation
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Documents</div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Documents</div>
          <div className="page-sub">AI-powered receipt and bank statement extraction</div>
        </div>

        {uploadSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#d4eddf', border: '1px solid #b2d8c4',
            borderRadius: 10, padding: '12px 16px',
            marginBottom: 20, fontSize: 13, color: '#1a6b4a',
          }}>
            <CheckCircle2 size={16} />
            {uploadSuccess}
          </div>
        )}

        {uploadMutation.isError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fde8e8', border: '1px solid #f5c4c4',
            borderRadius: 10, padding: '12px 16px',
            marginBottom: 20, fontSize: 13, color: '#b83232',
          }}>
            <AlertCircle size={16} />
            Upload failed. Please check the file and try again.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
          {/* Upload card */}
          <div className="card" style={{ position: 'sticky', top: 20 }}>
            <div className="card-header">
              <span className="card-title">Upload Document</span>
            </div>
            <UploadZone onUpload={handleUpload} isPending={uploadMutation.isPending} />
          </div>

          {/* Records card */}
          <div className="card">
            <TabBar
              active={activeTab}
              onChange={setActiveTab}
              receiptCount={receipts.length}
              statementCount={statements.length}
            />

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : activeTab === 'receipts' ? (
              <ReceiptsTable items={receipts} />
            ) : (
              <BankStatementsTable items={statements} />
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
          flex-shrink: 0;
        }
        .topbar-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
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
        }
        .card-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }
        @media (max-width: 900px) {
          .content > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}