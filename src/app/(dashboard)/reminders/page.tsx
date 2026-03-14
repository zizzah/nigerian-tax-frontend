'use client'

import { useState, useMemo } from 'react'
import { Bell, Plus, Trash2, Edit2, Play, CheckCircle, XCircle,
         Clock, ChevronDown, ChevronUp, AlertCircle, Mail,
         ToggleLeft, ToggleRight, Loader2, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReminderRule {
  id:                    string
  name:                  string
  days_overdue:          number
  cooldown_days:         number
  is_active:             boolean
  custom_message:        string | null
  send_copy_to_business: boolean
  created_at:            string
}

interface ReminderLog {
  id:              string
  invoice_number:  string
  customer_name:   string
  recipient_email: string
  sent_at:         string
  days_overdue:    number
  rule_name:       string
  success:         boolean
  error_message:   string | null
}

interface TriggerResult {
  sent:    number
  skipped: number
  errors:  number
  details: Record<string, string>[]
}

interface ReminderRuleFormData {
  name:                  string
  days_overdue:          number
  is_active:             boolean
  custom_message:        string | null
  cooldown_days:         number
  send_copy_to_business: boolean
}

interface PreviewInvoice {
  invoice_number: string
  customer_name:  string
  customer_email: string | null
  days_overdue:   number
  outstanding:    string
  rule:           string
  has_email:      boolean
}

// ─── API calls ────────────────────────────────────────────────────────────────

const api = {
  getRules:   () => apiClient.get<ReminderRule[]>('/reminders/rules').then(r => r.data),
  createRule: (d: Omit<ReminderRule, 'id'|'created_at'>) =>
    apiClient.post<ReminderRule>('/reminders/rules', d).then(r => r.data),
  updateRule: (id: string, d: Partial<ReminderRule>) =>
    apiClient.put<ReminderRule>(`/reminders/rules/${id}`, d).then(r => r.data),
  deleteRule: (id: string) => apiClient.delete(`/reminders/rules/${id}`),
  trigger:    () => apiClient.post('/reminders/trigger').then(r => r.data),
  preview:    () => apiClient.get('/reminders/preview').then(r => r.data),
  getLogs:    (page = 1) =>
    apiClient.get('/reminders/logs', { params: { page, page_size: 20 } }).then(r => r.data),
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number | string) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0 }).format(Number(n) || 0)

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })

const fmtTime = (s: string) =>
  new Date(s).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })

const SUGGESTED_RULES = [
  { name: '3-day reminder',  days_overdue: 3,  custom_message: '' },
  { name: '7-day chase',     days_overdue: 7,  custom_message: '' },
  { name: '14-day warning',  days_overdue: 14, custom_message: 'This invoice is now 14 days overdue. Please arrange payment urgently to avoid further action.' },
  { name: '30-day final',    days_overdue: 30, custom_message: 'This is a final reminder. If payment is not received within 7 days, we may refer this matter to our collections team.' },
]

// ─── Rule Form ────────────────────────────────────────────────────────────────

function RuleForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: Partial<ReminderRule>
  onSave: (d: ReminderRuleFormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<ReminderRuleFormData>({
    name:                  initial?.name                  ?? '',
    days_overdue:          initial?.days_overdue          ?? 7,
    is_active:             initial?.is_active             ?? true,
    custom_message:        initial?.custom_message        ?? '',
    cooldown_days:          initial?.cooldown_days          ?? 7,
    send_copy_to_business: initial?.send_copy_to_business ?? false,
  })

  const S = {
    label: { fontSize:12, fontWeight:500, color:'#6b6560',
             textTransform:'uppercase' as const, letterSpacing:'0.4px', marginBottom:6, display:'block' },
    input: { width:'100%', padding:'9px 12px', border:'1px solid #ddd9cf', borderRadius:8,
             fontSize:13, color:'#0f0e0b', background:'#fff', boxSizing:'border-box' as const },
    row:   { display:'flex', gap:12, alignItems:'flex-start' },
  }

  return (
    <div style={{ background:'#faf9f6', border:'1px solid #ddd9cf', borderRadius:12, padding:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 160px', gap:12, marginBottom:12 }}>
        <div>
          <label style={S.label}>Rule Name</label>
          <input style={S.input} value={form.name} placeholder="e.g. 7-day chase"
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label style={S.label}>Days Overdue</label>
          <input style={S.input} type="number" min={1} max={365} value={form.days_overdue}
            onChange={e => setForm(f => ({ ...f, days_overdue: parseInt(e.target.value) || 1 }))} />
        </div>
        <div>
          <label style={S.label}>Cooldown (days)</label>
          <input style={S.input} type="number" min={1} max={365} value={form.cooldown_days}
            onChange={e => setForm(f => ({ ...f, cooldown_days: parseInt(e.target.value) || 7 }))} />
          <span style={{ fontSize:11, color:'#9e9990', marginTop:3, display:'block' }}>
            Don&apos;t re-send for this many days
          </span>
        </div>
      </div>

      <div style={{ marginBottom:12 }}>
        <label style={S.label}>Custom Message <span style={{ color:'#9e9990', fontWeight:400 }}>(optional)</span></label>
        <textarea style={{ ...S.input, resize:'vertical', minHeight:72, fontFamily:'inherit' }}
          value={form.custom_message ?? ''}
          placeholder="Add a personal note to the reminder email…"
          onChange={e => setForm(f => ({ ...f, custom_message: e.target.value }))} />
      </div>

      <div style={{ display:'flex', gap:20, marginBottom:16 }}>
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#2c2a24', cursor:'pointer' }}>
          <input type="checkbox" checked={form.send_copy_to_business}
            onChange={e => setForm(f => ({ ...f, send_copy_to_business: e.target.checked }))}
            style={{ width:15, height:15 }} />
          CC my business email on reminders
        </label>
        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#2c2a24', cursor:'pointer' }}>
          <input type="checkbox" checked={form.is_active}
            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
            style={{ width:15, height:15 }} />
          Active
        </label>
      </div>

      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
        <button onClick={onCancel}
          style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #ddd9cf',
                   background:'#fff', fontSize:13, cursor:'pointer', color:'#6b6560' }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.days_overdue}
          style={{ padding:'8px 16px', borderRadius:8, border:'none',
                   background: saving ? '#e0d5c0' : '#0f0e0b',
                   color:'#fff', fontSize:13, cursor:'pointer', fontWeight:500 }}>
          {saving ? 'Saving…' : 'Save Rule'}
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'rules' | 'preview' | 'logs'

export default function RemindersPage() {
  const qc = useQueryClient()
  const [tab, setTab]           = useState<Tab>('rules')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [triggerResult, setTriggerResult] = useState<TriggerResult | null>(null)
  const [logsPage, setLogsPage] = useState(1)

  const { data: rules = [], isLoading: rulesLoading } = useQuery({
    queryKey: ['reminder-rules'],
    queryFn:  api.getRules,
  })

  const { data: preview, isLoading: previewLoading, refetch: refetchPreview } = useQuery({
    queryKey: ['reminder-preview'],
    queryFn:  api.preview,
    enabled:  tab === 'preview',
  })

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['reminder-logs', logsPage],
    queryFn:  () => api.getLogs(logsPage),
    enabled:  tab === 'logs',
  })

  const createRule = useMutation({
    mutationFn: api.createRule,
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['reminder-rules'] }); setShowForm(false) },
  })
  const updateRule = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReminderRule> }) => api.updateRule(id, data),
    onSuccess:  () => { qc.invalidateQueries({ queryKey: ['reminder-rules'] }); setEditId(null) },
  })
  const deleteRule = useMutation({
    mutationFn: api.deleteRule,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['reminder-rules'] }),
  })
  const triggerMutation = useMutation({
    mutationFn: api.trigger,
    onSuccess:  (data) => {
      setTriggerResult(data)
      qc.invalidateQueries({ queryKey: ['reminder-logs'] })
      qc.invalidateQueries({ queryKey: ['reminder-preview'] })
    },
  })

  const activeRules  = rules.filter(r => r.is_active).length
  const inactiveRules = rules.filter(r => !r.is_active).length

  const tabStyle = (t: Tab) => ({
    padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500,
    cursor:'pointer', border:'none',
    background: tab === t ? '#0f0e0b' : 'transparent',
    color:      tab === t ? '#fff'    : '#6b6560',
  })

  const S = {
    card:   { background:'#fff', border:'1px solid #ddd9cf', borderRadius:12,
               overflow:'hidden', marginBottom:16 },
    th:     { padding:'10px 14px', fontSize:11, fontWeight:500, color:'#9e9990',
               textTransform:'uppercase' as const, letterSpacing:'0.5px',
               background:'#faf9f6', borderBottom:'1px solid #ddd9cf', whiteSpace:'nowrap' as const },
    td:     { padding:'12px 14px', fontSize:13, color:'#2c2a24', borderBottom:'1px solid #f0ede6' },
    badge:  (ok: boolean) => ({
      display:'inline-flex', alignItems:'center', gap:4, padding:'2px 10px',
      borderRadius:20, fontSize:11, fontWeight:500,
      background: ok ? '#d4eddf' : '#fde8e8',
      color:      ok ? '#1a6b4a' : '#b83232',
    }),
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Payment Reminders</div>
        <div className="topbar-actions">
          {tab === 'rules' && (
            <button onClick={() => { setShowForm(true); setEditId(null) }}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                       borderRadius:8, background:'#0f0e0b', border:'none',
                       color:'#fff', fontSize:13, fontWeight:500, cursor:'pointer' }}>
              <Plus size={14} /> Add Rule
            </button>
          )}
          <button
            onClick={() => triggerMutation.mutate()}
            disabled={triggerMutation.isPending || rules.filter(r => r.is_active).length === 0}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                     borderRadius:8, background:'#c8952a', border:'none',
                     color:'#0f0e0b', fontSize:13, fontWeight:500,
                     cursor: triggerMutation.isPending ? 'wait' : 'pointer',
                     opacity: rules.filter(r => r.is_active).length === 0 ? 0.5 : 1 }}>
            {triggerMutation.isPending
              ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Sending…</>
              : <><Play size={14} /> Run Reminders Now</>}
          </button>
        </div>
      </div>

      <div className="content">

        {/* Trigger result banner */}
        {triggerResult && (
          <div style={{ background: triggerResult.sent > 0 ? '#d4eddf' : '#faf9f6',
            border: `1px solid ${triggerResult.sent > 0 ? '#a8d5bc' : '#ddd9cf'}`,
            borderRadius:10, padding:'14px 18px', marginBottom:20,
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:14, fontWeight:600,
                color: triggerResult.sent > 0 ? '#1a6b4a' : '#2c2a24', marginBottom:4 }}>
                {triggerResult.sent > 0
                  ? `✓ ${triggerResult.sent} reminder${triggerResult.sent !== 1 ? 's' : ''} sent successfully`
                  : 'No reminders were due'}
              </div>
              <div style={{ fontSize:12, color:'#6b6560' }}>
                {triggerResult.skipped > 0 && `${triggerResult.skipped} skipped · `}
                {triggerResult.errors  > 0 && `${triggerResult.errors} failed · `}
                {new Date().toLocaleTimeString('en-NG')}
              </div>
            </div>
            <button onClick={() => setTriggerResult(null)}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#9e9990', fontSize:18 }}>
              ✕
            </button>
          </div>
        )}

        {/* Stats strip */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
          {[
            { label:'Total Rules',    val: rules.length,   icon: Bell },
            { label:'Active',         val: activeRules,    icon: CheckCircle, green: true },
            { label:'Inactive',       val: inactiveRules,  icon: XCircle },
            { label:'Sent This Month',val: logsData?.total ?? '—', icon: Mail },
          ].map(({ label, val, icon: Icon, green }) => (
            <div key={label} style={{ background:'#fff', border:'1px solid #ddd9cf',
              borderRadius:12, padding:'16px 18px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontSize:11, fontWeight:500, color:'#9e9990',
                  textTransform:'uppercase', letterSpacing:'0.5px' }}>{label}</div>
                <Icon size={15} color={green ? '#1a6b4a' : '#9e9990'} />
              </div>
              <div style={{ fontSize:24, fontWeight:700, color: green && val > 0 ? '#1a6b4a' : '#0f0e0b',
                fontFamily:"'Fraunces',serif" }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{ display:'flex', gap:4, background:'#faf9f6', padding:4,
          borderRadius:10, marginBottom:24, width:'fit-content', border:'1px solid #ddd9cf' }}>
          {([['rules','Rules'], ['preview','Preview'], ['logs','Send History']] as [Tab, string][])
            .map(([t, l]) => (
              <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>{l}</button>
            ))}
        </div>

        {/* ═══ RULES TAB ═══════════════════════════════════════════════════ */}
        {tab === 'rules' && (
          <>
            {/* Add form */}
            {showForm && !editId && (
              <div style={{ marginBottom:16 }}>
                <RuleForm
                  onSave={d => createRule.mutate(d)}
                  onCancel={() => setShowForm(false)}
                  saving={createRule.isPending}
                />
              </div>
            )}

            {/* Suggested quick-adds */}
            {rules.length === 0 && !showForm && (
              <div style={{ ...S.card, padding:24, textAlign:'center', marginBottom:20 }}>
                <Bell size={36} color="#ddd9cf" style={{ marginBottom:12 }} />
                <div style={{ fontSize:15, fontWeight:600, color:'#0f0e0b', marginBottom:6 }}>
                  No reminder rules yet
                </div>
                <div style={{ fontSize:13, color:'#9e9990', marginBottom:20 }}>
                  Add rules to automatically chase overdue invoices by email.
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' }}>
                  {SUGGESTED_RULES.map(s => (
                    <button key={s.days_overdue}
                      onClick={() => createRule.mutate({ ...s, is_active: true,
                        cooldown_days: 7, send_copy_to_business: false })}
                      style={{ padding:'8px 14px', borderRadius:8, border:'1px solid #ddd9cf',
                               background:'#fff', fontSize:12.5, cursor:'pointer', color:'#2c2a24' }}>
                      + {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rules list */}
            {rulesLoading
              ? <div style={{ textAlign:'center', padding:40, color:'#9e9990' }}>
                  <Loader2 size={24} style={{ animation:'spin 1s linear infinite' }} />
                </div>
              : rules.length > 0 && (
                <div style={S.card}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr>
                        {['Rule Name','Days Overdue','Cooldown','Status','CC Business','Message',''].map(h => (
                          <th key={h} style={S.th}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rules
                        .sort((a, b) => a.days_overdue - b.days_overdue)
                        .map(rule => (
                          editId === rule.id
                            ? (
                              <tr key={rule.id}>
                                <td colSpan={7} style={{ padding:12, borderBottom:'1px solid #f0ede6' }}>
                                  <RuleForm
                                    initial={rule}
                                    onSave={d => updateRule.mutate({ id: rule.id, data: d })}
                                    onCancel={() => setEditId(null)}
                                    saving={updateRule.isPending}
                                  />
                                </td>
                              </tr>
                            ) : (
                              <tr key={rule.id} style={{ opacity: rule.is_active ? 1 : 0.6 }}>
                                <td style={S.td}>
                                  <div style={{ fontWeight:500, color:'#0f0e0b' }}>{rule.name}</div>
                                </td>
                                <td style={S.td}>
                                  <span style={{ background:'#f0ede6', borderRadius:20,
                                    padding:'3px 10px', fontSize:12, fontWeight:600, color:'#2c2a24' }}>
                                    {rule.days_overdue}d
                                  </span>
                                </td>
                                <td style={S.td}>
                                  <span style={{ background:'#e8f4fd', borderRadius:20,
                                    padding:'3px 10px', fontSize:12, fontWeight:600, color:'#1a5276' }}>
                                    every {rule.cooldown_days ?? 7}d
                                  </span>
                                </td>
                                <td style={S.td}>
                                  <button
                                    onClick={() => updateRule.mutate({ id: rule.id,
                                      data: { is_active: !rule.is_active } })}
                                    style={{ display:'flex', alignItems:'center', gap:6,
                                      background:'none', border:'none', cursor:'pointer',
                                      fontSize:12, color: rule.is_active ? '#1a6b4a' : '#9e9990',
                                      fontWeight:500, padding:0 }}>
                                    {rule.is_active
                                      ? <><ToggleRight size={18} color="#1a6b4a" /> Active</>
                                      : <><ToggleLeft  size={18} color="#9e9990" /> Inactive</>}
                                  </button>
                                </td>
                                <td style={S.td}>
                                  {rule.send_copy_to_business
                                    ? <CheckCircle size={15} color="#1a6b4a" />
                                    : <span style={{ color:'#ddd9cf' }}>—</span>}
                                </td>
                                <td style={{ ...S.td, maxWidth:240 }}>
                                  {rule.custom_message
                                    ? <span style={{ fontSize:12, color:'#6b6560',
                                        overflow:'hidden', display:'-webkit-box',
                                        WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const }}>
                                        {rule.custom_message}
                                      </span>
                                    : <span style={{ color:'#ddd9cf', fontSize:12 }}>Default message</span>}
                                </td>
                                <td style={{ ...S.td, whiteSpace:'nowrap' }}>
                                  <div style={{ display:'flex', gap:6 }}>
                                    <button onClick={() => { setEditId(rule.id); setShowForm(false) }}
                                      style={{ padding:'5px 10px', borderRadius:6,
                                               border:'1px solid #ddd9cf', background:'#fff',
                                               cursor:'pointer', fontSize:12, color:'#2c2a24' }}>
                                      <Edit2 size={12} />
                                    </button>
                                    <button onClick={() => {
                                        if (confirm(`Delete rule "${rule.name}"?`))
                                          deleteRule.mutate(rule.id)
                                      }}
                                      style={{ padding:'5px 10px', borderRadius:6,
                                               border:'1px solid #fde8e8', background:'#fde8e8',
                                               cursor:'pointer', fontSize:12, color:'#b83232' }}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            )
                        ))}
                    </tbody>
                  </table>
                </div>
              )
            }

            {/* How it works */}
            <div style={{ background:'#fff', border:'1px solid #ddd9cf', borderRadius:12,
              padding:'18px 20px', marginTop:8 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'#0f0e0b', marginBottom:10,
                textTransform:'uppercase', letterSpacing:'0.4px' }}>How it works</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',
                gap:12 }}>
                {[
                  { icon:'①', text:'Create rules specifying how many days after the due date to send a reminder' },
                  { icon:'②', text:'Click "Run Reminders Now" manually, or schedule it to run automatically every day' },
                  { icon:'③', text:'Each invoice only gets one reminder per rule per day — no spam' },
                  { icon:'④', text:'All emails are logged in Send History so you can see exactly what was sent' },
                ].map(({ icon, text }) => (
                  <div key={icon} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                    <div style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>{icon}</div>
                    <div style={{ fontSize:12.5, color:'#6b6560', lineHeight:1.5 }}>{text}</div>
                  </div>
                ))}
              </div>


            </div>
          </>
        )}

        {/* ═══ PREVIEW TAB ══════════════════════════════════════════════════ */}
        {tab === 'preview' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between',
              alignItems:'center', marginBottom:16 }}>
              <div style={{ fontSize:13, color:'#6b6560' }}>
                Invoices that would receive a reminder if you ran it right now
              </div>
              <button onClick={() => refetchPreview()}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 12px',
                  borderRadius:8, border:'1px solid #ddd9cf', background:'#fff',
                  fontSize:12.5, cursor:'pointer', color:'#2c2a24' }}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>

            {previewLoading
              ? <div style={{ textAlign:'center', padding:60, color:'#9e9990' }}>
                  <Loader2 size={24} style={{ animation:'spin 1s linear infinite' }} />
                </div>
              : !preview?.invoices?.length
                ? (
                  <div style={{ ...S.card, padding:48, textAlign:'center' }}>
                    <CheckCircle size={40} color="#1a6b4a" style={{ marginBottom:12 }} />
                    <div style={{ fontSize:15, fontWeight:600, color:'#0f0e0b', marginBottom:6 }}>
                      No reminders due right now
                    </div>
                    <div style={{ fontSize:13, color:'#9e9990' }}>
                      {rules.filter(r => r.is_active).length === 0
                        ? 'Add active reminder rules first'
                        : 'No invoices match your current reminder rules today'}
                    </div>
                  </div>
                ) : (
                  <div style={S.card}>
                    <div style={{ padding:'12px 16px', background:'#fff3cd',
                      borderBottom:'1px solid #f5d76e', fontSize:12.5, color:'#856404' }}>
                      <AlertCircle size={13} style={{ marginRight:6, verticalAlign:'middle' }} />
                      {preview.count} invoice{preview.count !== 1 ? 's' : ''} would receive a reminder
                    </div>
                    <table style={{ width:'100%', borderCollapse:'collapse' }}>
                      <thead>
                        <tr>
                          {['Invoice','Customer','Email','Days Overdue','Outstanding','Rule'].map(h => (
                            <th key={h} style={S.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(preview.invoices as PreviewInvoice[]).map(inv => (
                          <tr key={inv.invoice_number}>
                            <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>
                              {inv.invoice_number}
                            </td>
                            <td style={S.td}>{inv.customer_name}</td>
                            <td style={S.td}>
                              {inv.has_email
                                ? <span style={{ fontSize:12, color:'#2c2a24' }}>{inv.customer_email}</span>
                                : <span style={{ fontSize:12, color:'#b83232' }}>⚠ No email</span>}
                            </td>
                            <td style={S.td}>
                              <span style={{ background:'#fde8e8', color:'#b83232',
                                borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:600 }}>
                                {inv.days_overdue}d
                              </span>
                            </td>
                            <td style={{ ...S.td, fontWeight:600, color:'#b83232' }}>
                              {fmt(inv.outstanding)}
                            </td>
                            <td style={{ ...S.td, fontSize:12, color:'#6b6560' }}>{inv.rule}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
            }
          </>
        )}

        {/* ═══ LOGS TAB ════════════════════════════════════════════════════ */}
        {tab === 'logs' && (
          <>
            {logsLoading
              ? <div style={{ textAlign:'center', padding:60, color:'#9e9990' }}>
                  <Loader2 size={24} style={{ animation:'spin 1s linear infinite' }} />
                </div>
              : !logsData?.logs?.length
                ? (
                  <div style={{ ...S.card, padding:48, textAlign:'center' }}>
                    <Clock size={40} color="#ddd9cf" style={{ marginBottom:12 }} />
                    <div style={{ fontSize:15, fontWeight:600, color:'#0f0e0b', marginBottom:6 }}>
                      No reminders sent yet
                    </div>
                    <div style={{ fontSize:13, color:'#9e9990' }}>
                      Reminder history will appear here after your first run
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={S.card}>
                      <table style={{ width:'100%', borderCollapse:'collapse' }}>
                        <thead>
                          <tr>
                            {['Invoice','Customer','Email','Rule','Days Overdue','Sent At','Status'].map(h => (
                              <th key={h} style={S.th}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(logsData.logs as ReminderLog[]).map(log => (
                            <tr key={log.id}>
                              <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>
                                {log.invoice_number}
                              </td>
                              <td style={S.td}>{log.customer_name}</td>
                              <td style={{ ...S.td, fontSize:12, color:'#6b6560' }}>
                                {log.recipient_email}
                              </td>
                              <td style={{ ...S.td, fontSize:12 }}>{log.rule_name}</td>
                              <td style={S.td}>
                                <span style={{ background:'#fde8e8', color:'#b83232',
                                  borderRadius:20, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
                                  {log.days_overdue}d
                                </span>
                              </td>
                              <td style={{ ...S.td, fontSize:12, color:'#6b6560' }}>
                                {fmtDate(log.sent_at)} {fmtTime(log.sent_at)}
                              </td>
                              <td style={S.td}>
                                {log.success
                                  ? <span style={S.badge(true)}><CheckCircle size={11}/> Sent</span>
                                  : <span style={S.badge(false)} title={log.error_message ?? ''}>
                                      <XCircle size={11}/> Failed
                                    </span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {logsData.total_pages > 1 && (
                      <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:16 }}>
                        <button onClick={() => setLogsPage(p => Math.max(1, p-1))}
                          disabled={logsPage === 1}
                          style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #ddd9cf',
                            background:'#fff', cursor: logsPage === 1 ? 'default' : 'pointer',
                            opacity: logsPage === 1 ? 0.4 : 1, fontSize:13 }}>
                          ← Prev
                        </button>
                        <span style={{ fontSize:13, color:'#6b6560', padding:'6px 4px' }}>
                          Page {logsPage} of {logsData.total_pages}
                        </span>
                        <button onClick={() => setLogsPage(p => Math.min(logsData.total_pages, p+1))}
                          disabled={logsPage === logsData.total_pages}
                          style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #ddd9cf',
                            background:'#fff',
                            cursor: logsPage === logsData.total_pages ? 'default' : 'pointer',
                            opacity: logsPage === logsData.total_pages ? 0.4 : 1, fontSize:13 }}>
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )
            }
          </>
        )}
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);
          display:flex;align-items:center;padding:0 28px;gap:8px;flex-shrink:0;flex-wrap:wrap}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;
          color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .content{flex:1;overflow-y:auto;padding:28px;background:#f5f5f0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.content{padding:16px}}
      `}</style>
    </>
  )
}