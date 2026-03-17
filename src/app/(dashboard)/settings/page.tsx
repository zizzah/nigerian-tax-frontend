'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Upload, Building2, User, FileText, Camera, Check, AlertCircle, Eye, EyeOff, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { useBusiness, useCreateBusiness, useUpdateBusiness, useUploadLogo } from '@/lib/hooks/useBusiness'
import apiClient from '@/lib/api/client'
import { useAuth } from '@/lib/hooks/useAuth'
import type { BusinessCreate, BusinessUpdate } from '@/lib/types'

// ─── constants ────────────────────────────────────────────────────────────────
const nigerianStates = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
]

const businessTypes = [
  'Sole Proprietorship','Limited Liability Company (LLC)','Partnership',
  'Public Limited Company (PLC)','NGO / Non-Profit','Government Agency',
]

const industries = [
  'Technology','Finance & Banking','Healthcare','Retail','Manufacturing',
  'Agriculture','Construction','Education','Transportation & Logistics',
  'Food & Beverage','Media & Entertainment','Real Estate','Legal Services',
  'Consulting','Other',
]

// ─── helpers ──────────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: {
  icon: React.ElementType; title: string; subtitle: string
}) {
  return (
    <div className="card-header">
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:'#fff3d4',
          display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Icon size={18} color="#c8952a" />
        </div>
        <div>
          <div className="card-title">{title}</div>
          <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:1 }}>{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children, hint }: {
  label: string; children: React.ReactNode; hint?: string
}) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
      {hint && <span style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>{hint}</span>}
    </div>
  )
}

// Expand shorthand hex (#fff → #ffffff, #abc → #aabbcc)
// and validate — returns undefined if invalid so backend ignores it
function normalizeColor(color: string | undefined | null): string | undefined {
  if (!color) return undefined
  const c = color.trim()
  // Already valid 6-char hex
  if (/^#[0-9A-Fa-f]{6}$/.test(c)) return c
  // Expand 3-char shorthand: #rgb → #rrggbb
  if (/^#[0-9A-Fa-f]{3}$/.test(c)) {
    return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]
  }
  // Try adding # prefix if missing
  if (/^[0-9A-Fa-f]{6}$/.test(c)) return '#' + c
  if (/^[0-9A-Fa-f]{3}$/.test(c)) {
    return '#' + c[0] + c[0] + c[1] + c[1] + c[2] + c[2]
  }
  return undefined  // invalid — don't send
}

function buildFormDefaults(business?: import('@/lib/types').Business | null) {
  return {
    business_name:   business?.business_name   ?? '',
    business_type:   business?.business_type   ?? '',
    industry:        business?.industry        ?? '',
    tin:             business?.tin             ?? '',
    vat_registered:  business?.vat_registered  ?? false,
    vat_number:      business?.vat_number      ?? '',
    rc_number:       business?.rc_number       ?? '',
    phone:           business?.phone           ?? '',
    email:           business?.email           ?? '',
    website:         business?.website         ?? '',
    address:         business?.address         ?? '',
    city:            business?.city            ?? '',
    state:           business?.state           ?? '',
    invoice_prefix:  business?.invoice_prefix  ?? 'INV',
    primary_color:   business?.primary_color   ?? '#c8952a',
    secondary_color: business?.secondary_color ?? '#1a6b4a',
  }
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { data: business, isLoading } = useBusiness()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'business' | 'invoice' | 'payments' | 'profile'>('business')

  if (isLoading) {
    return (
      <>
        <div className="topbar"><div className="topbar-title">Settings</div></div>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          flexDirection:'column', gap:12, color:'var(--text-dim)' }}>
          <Loader2 className="animate-spin" size={32} color="#c8952a" />
          <p>Loading settings...</p>
        </div>
        <style jsx>{`.topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}.topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}`}</style>
      </>
    )
  }

  return (
    <SettingsInner
      business={business ?? null}
      user={user}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  )
}

// ─── inner component ──────────────────────────────────────────────────────────
function SettingsInner({
  business, user, activeTab, setActiveTab,
}: {
  business: import('@/lib/types').Business | null
  user: import('@/lib/types').User | null
  activeTab: 'business' | 'invoice' | 'payments' | 'profile'
  setActiveTab: (t: 'business' | 'invoice' | 'payments' | 'profile') => void
}) {
  const createBiz  = useCreateBusiness()
  const updateBiz  = useUpdateBusiness()
  const uploadLogo = useUploadLogo()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [bizForm, setBizForm]       = useState(() => buildFormDefaults(business))
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo_url ?? null)

  // Password change state
  const [pwdForm, setPwdForm]       = useState({ current: '', next: '', confirm: '' })
  const [showPwd, setShowPwd]       = useState({ current: false, next: false, confirm: false })
  const [pwdError, setPwdError]     = useState<string | null>(null)
  const [pwdSaving, setPwdSaving]   = useState(false)

  // Paystack keys state
  const [paystackForm, setPaystackForm]   = useState({ public_key: '', secret_key: '' })
  const [paystackSaving, setPaystackSaving] = useState(false)
  const [paystackStatus, setPaystackStatus] = useState<{ has_public_key: boolean; has_secret_key: boolean } | null>(null)

  // Load existing paystack key status on mount
  useEffect(() => {
    apiClient.get('/businesses/me/paystack/status')
      .then(r => setPaystackStatus(r.data as { has_public_key: boolean; has_secret_key: boolean }))
      .catch(() => {/* not configured yet */})
  }, [])

  const hasExisting = !!business
  const isSaving    = createBiz.isPending || updateBiz.isPending

  // ── Logo ────────────────────────────────────────────────────────────────────
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('Logo must be smaller than 5 MB'); return }
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
    try {
      await uploadLogo.mutateAsync(file)
      toast.success('Logo uploaded!')
    } catch {
      toast.error('Logo upload failed.')
      setLogoPreview(business?.logo_url ?? null)
    }
  }

  // ── Business save ───────────────────────────────────────────────────────────
  const handleSaveBusiness = async () => {
    // Warn about invalid colors before saving
    const pc = bizForm.primary_color?.trim()
    const sc = bizForm.secondary_color?.trim()
    if (pc && !normalizeColor(pc)) {
      toast.error(`Invalid primary color "${pc}" — use hex format like #c8952a or #fff`)
      return
    }
    if (sc && !normalizeColor(sc)) {
      toast.error(`Invalid secondary color "${sc}" — use hex format like #1a6b4a or #fff`)
      return
    }
    try {
      if (hasExisting) {
        const payload: BusinessUpdate = {
          business_name: bizForm.business_name || undefined,
          business_type: bizForm.business_type || undefined,
          industry:      bizForm.industry      || undefined,
          tin:           bizForm.tin           || undefined,
          vat_registered: bizForm.vat_registered,
          vat_number:    bizForm.vat_number    || undefined,
          rc_number:     bizForm.rc_number     || undefined,
          phone:         bizForm.phone         || undefined,
          email:         bizForm.email         || undefined,
          website:       bizForm.website       || undefined,
          address:       bizForm.address       || undefined,
          city:          bizForm.city          || undefined,
          state:         bizForm.state         || undefined,
          invoice_prefix: bizForm.invoice_prefix || undefined,
          primary_color:  normalizeColor(bizForm.primary_color),
          secondary_color: normalizeColor(bizForm.secondary_color),
        }
        await updateBiz.mutateAsync(payload)
        toast.success('Business profile updated!')
      } else {
        if (!bizForm.business_name) { toast.error('Business name is required'); return }
        const payload: BusinessCreate = {
          business_name: bizForm.business_name,
          business_type: bizForm.business_type || undefined,
          industry:      bizForm.industry      || undefined,
          tin:           bizForm.tin           || undefined,
          vat_registered: bizForm.vat_registered,
          vat_number:    bizForm.vat_number    || undefined,
          rc_number:     bizForm.rc_number     || undefined,
          phone:         bizForm.phone         || undefined,
          email:         bizForm.email         || undefined,
          website:       bizForm.website       || undefined,
          address:       bizForm.address       || undefined,
          city:          bizForm.city          || undefined,
          state:         bizForm.state         || undefined,
          country: 'Nigeria',
        }
        await createBiz.mutateAsync(payload)
        toast.success('Business profile created!')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? 'Something went wrong. Please try again.'
      toast.error(msg)
    }
  }

  // ── Password change ─────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPwdError(null)
    if (!pwdForm.current)                           { setPwdError('Enter your current password'); return }
    if (pwdForm.next.length < 8)                    { setPwdError('New password must be at least 8 characters'); return }
    if (pwdForm.next !== pwdForm.confirm)           { setPwdError('Passwords do not match'); return }
    setPwdSaving(true)
    try {
      // Replace with your actual auth API call, e.g. authApi.changePassword(...)
      await new Promise(res => setTimeout(res, 800)) // placeholder
      toast.success('Password updated successfully!')
      setPwdForm({ current: '', next: '', confirm: '' })
    } catch {
      setPwdError('Password change failed. Check your current password and try again.')
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Settings</div>
        {!hasExisting && (
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px',
            borderRadius:8, background:'#fff3d4', border:'1px solid #f0c96b', fontSize:12, color:'#8b6000' }}>
            <AlertCircle size={14} />
            No business profile yet — fill in the form below to create one
          </div>
        )}
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Business Settings</div>
          <div className="page-sub">Manage your business profile, invoicing preferences &amp; account</div>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {([
            { key: 'business', label: 'Business Profile', icon: Building2 },
            { key: 'invoice',  label: 'Invoice Defaults', icon: FileText  },
            { key: 'payments', label: 'Payments',          icon: CreditCard },
            { key: 'profile',  label: 'Account',          icon: User      },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`tab-btn${activeTab === key ? ' active' : ''}`}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* ══ BUSINESS PROFILE ══ */}
        {activeTab === 'business' && (
          <div className="settings-grid">

            {/* Logo + colours */}
            <div className="card logo-card">
              <SectionHeader icon={Camera} title="Company Logo" subtitle="Appears on invoices & PDFs" />
              <div style={{ padding:20 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
                  <div onClick={() => hasExisting && logoInputRef.current?.click()}
                    style={{ width:120, height:120, borderRadius:16,
                      border:'2px dashed #ddd9cf', background: logoPreview ? 'transparent' : '#faf9f6',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      cursor: hasExisting ? 'pointer' : 'default', overflow:'hidden', position:'relative' }}>
                    {logoPreview
                      ? <img src={logoPreview} alt="logo" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                      : <div style={{ textAlign:'center', color:'var(--text-dim)' }}>
                          {uploadLogo.isPending ? <Loader2 size={28} className="animate-spin" /> : <Upload size={28} />}
                        </div>}
                  </div>

                  <input ref={logoInputRef} type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoChange} style={{ display:'none' }}
                    disabled={uploadLogo.isPending || !hasExisting} />

                  <button className="btn btn-outline" style={{ width:'100%' }}
                    onClick={() => {
                      if (!hasExisting) { toast.error('Save your business profile first.'); return }
                      logoInputRef.current?.click()
                    }} disabled={uploadLogo.isPending}>
                    {uploadLogo.isPending
                      ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                      : <><Upload size={14} /> {logoPreview ? 'Replace Logo' : 'Upload Logo'}</>}
                  </button>
                  <p style={{ fontSize:11, color:'var(--text-dim)', textAlign:'center', margin:0 }}>
                    PNG, JPG, WebP or SVG · Max 5 MB
                    {!hasExisting && <><br /><span style={{ color:'#c8952a' }}>Save profile first</span></>}
                  </p>
                </div>

                {/* Brand colours */}
                <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:12, fontWeight:500, color:'var(--text-mid)', marginBottom:12,
                    textTransform:'uppercase', letterSpacing:'0.4px' }}>Brand Colours</div>
                  <div style={{ display:'flex', gap:12 }}>
                    {(['primary_color', 'secondary_color'] as const).map((key, i) => (
                      <div key={key} className="form-group" style={{ flex:1 }}>
                        <label className="form-label">{i === 0 ? 'Primary' : 'Secondary'}</label>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <input type="color" value={bizForm[key]}
                            onChange={e => setBizForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ width:40, height:36, border:'1px solid var(--border)', borderRadius:8, cursor:'pointer', padding:2 }} />
                          <input className="form-input" value={bizForm[key]}
                            onChange={e => setBizForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ fontSize:12, flex:1 }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live invoice preview */}
                  <div style={{ marginTop:20 }}>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--text-dim)',
                      textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:10 }}>
                      Invoice Preview
                    </div>
                    <div style={{ border:'1px solid var(--border)', borderRadius:10, overflow:'hidden',
                      fontSize:11, background:'#fff', boxShadow:'0 2px 8px rgba(0,0,0,0.06)' }}>
                      {/* Preview header bar */}
                      <div style={{ background: bizForm.primary_color, padding:'14px 18px',
                        display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ color:'#fff', fontWeight:700, fontSize:13 }}>
                          {bizForm.business_name || 'Your Business'}
                        </div>
                        <div style={{ color:'#fff', opacity:0.9, fontSize:11, letterSpacing:'1px' }}>
                          INVOICE
                        </div>
                      </div>
                      {/* Preview meta strip */}
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)',
                        background: bizForm.secondary_color }}>
                        {['Issue Date', 'Due Date', 'Status'].map(l => (
                          <div key={l} style={{ padding:'8px 12px' }}>
                            <div style={{ fontSize:7.5, color:'rgba(255,255,255,0.7)',
                              textTransform:'uppercase', letterSpacing:'0.5px' }}>{l}</div>
                            <div style={{ fontSize:10, color:'#fff', fontWeight:600, marginTop:2 }}>
                              {l === 'Status' ? 'SENT' : l === 'Issue Date' ? '01 Mar 2026' : '31 Mar 2026'}
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Preview table header */}
                      <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto',
                        background: bizForm.primary_color, padding:'6px 12px', gap:16 }}>
                        {['Description', 'Qty', 'Amount'].map(h => (
                          <div key={h} style={{ fontSize:8, color:'#fff',
                            fontWeight:600, textTransform:'uppercase' }}>{h}</div>
                        ))}
                      </div>
                      {/* Preview rows */}
                      {[
                        ['Consulting Services', '2', '₦50,000'],
                        ['VAT (7.5%)', '', '₦3,750'],
                      ].map(([d, q, a], i) => (
                        <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr auto auto',
                          padding:'6px 12px', gap:16,
                          background: i % 2 === 0 ? '#fff' : bizForm.primary_color + '12' }}>
                          <div style={{ fontSize:9, color:'#2c2a24' }}>{d}</div>
                          <div style={{ fontSize:9, color:'#6b6560', minWidth:24, textAlign:'right' }}>{q}</div>
                          <div style={{ fontSize:9, color:'#2c2a24', minWidth:60, textAlign:'right' }}>{a}</div>
                        </div>
                      ))}
                      {/* Preview total */}
                      <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center',
                        gap:16, padding:'8px 12px', borderTop:`2px solid ${bizForm.primary_color}` }}>
                        <div style={{ fontSize:10, fontWeight:600, color:'#6b6560' }}>TOTAL DUE</div>
                        <div style={{ fontSize:13, fontWeight:700, color: bizForm.primary_color }}>
                          ₦53,750
                        </div>
                      </div>
                      <div style={{ padding:'8px 12px', textAlign:'center', fontSize:8,
                        color:'#9e9990', borderTop:'1px solid #f0ede6' }}>
                        Thank you for your business!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main info */}
            <div className="card main-card">
              <SectionHeader icon={Building2} title="Business Information"
                subtitle={hasExisting ? 'Update your registered business details' : 'Create your business profile'} />
              <div style={{ padding:20 }}>
                <div className="form-grid">
                  {/* Business name */}
                  <Field label="Business Name *">
                    <input className="form-input" value={bizForm.business_name}
                      onChange={e => setBizForm(f => ({ ...f, business_name: e.target.value }))}
                      placeholder="e.g. Adebayo & Associates Ltd" />
                  </Field>
                  <Field label="Business Type">
                    <select className="form-input" value={bizForm.business_type}
                      onChange={e => setBizForm(f => ({ ...f, business_type: e.target.value }))}>
                      <option value="">Select type...</option>
                      {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Industry">
                    <select className="form-input" value={bizForm.industry}
                      onChange={e => setBizForm(f => ({ ...f, industry: e.target.value }))}>
                      <option value="">Select industry...</option>
                      {industries.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </Field>
                  <Field label="TIN" hint="Issued by FIRS">
                    <input className="form-input" value={bizForm.tin}
                      onChange={e => setBizForm(f => ({ ...f, tin: e.target.value }))}
                      placeholder="e.g. 0012345678" />
                  </Field>
                  <Field label="RC Number" hint="CAC Registration Number">
                    <input className="form-input" value={bizForm.rc_number}
                      onChange={e => setBizForm(f => ({ ...f, rc_number: e.target.value }))}
                      placeholder="e.g. RC1234567" />
                  </Field>
                  <Field label="Business Phone">
                    <input className="form-input" value={bizForm.phone}
                      onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+234 801 234 5678" />
                  </Field>
                  <Field label="Business Email">
                    <input type="email" className="form-input" value={bizForm.email}
                      onChange={e => setBizForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="info@yourbusiness.ng" />
                  </Field>
                  <Field label="Website">
                    <input className="form-input" value={bizForm.website}
                      onChange={e => setBizForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://yourbusiness.ng" />
                  </Field>
                  <Field label="Street Address">
                    <input className="form-input" value={bizForm.address}
                      onChange={e => setBizForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="14 Awolowo Road, Ikoyi" />
                  </Field>
                  <Field label="City">
                    <input className="form-input" value={bizForm.city}
                      onChange={e => setBizForm(f => ({ ...f, city: e.target.value }))}
                      placeholder="Lagos" />
                  </Field>
                  <Field label="State">
                    <select className="form-input" value={bizForm.state}
                      onChange={e => setBizForm(f => ({ ...f, state: e.target.value }))}>
                      <option value="">Select state...</option>
                      {nigerianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>

                  {/* VAT toggle */}
                  <div style={{ gridColumn:'1 / -1' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'14px 16px', background:'var(--cream)', borderRadius:10, border:'1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:500, color:'var(--ink)' }}>VAT Registered</div>
                        <div style={{ fontSize:11, color:'var(--text-dim)', marginTop:2 }}>
                          Enables 7.5% VAT on invoices &amp; FIRS reporting
                        </div>
                      </div>
                      <button onClick={() => setBizForm(f => ({ ...f, vat_registered: !f.vat_registered }))}
                        style={{ width:44, height:24, borderRadius:12, border:'none',
                          background: bizForm.vat_registered ? '#c8952a' : '#ddd9cf',
                          cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
                        <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff',
                          position:'absolute', top:3, left: bizForm.vat_registered ? 23 : 3,
                          transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }} />
                      </button>
                    </div>
                    {bizForm.vat_registered && (
                      <div style={{ marginTop:10 }}>
                        <Field label="VAT Number">
                          <input className="form-input" value={bizForm.vat_number}
                            onChange={e => setBizForm(f => ({ ...f, vat_number: e.target.value }))}
                            placeholder="VAT-XXXXXXXX" />
                        </Field>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop:24, display:'flex', gap:10, justifyContent:'flex-end', alignItems:'center' }}>
                  {hasExisting && (
                    <span style={{ fontSize:12, color:'var(--green)', display:'flex', alignItems:'center', gap:4 }}>
                      <Check size={14} /> Profile active
                    </span>
                  )}
                  <button onClick={handleSaveBusiness} disabled={isSaving} className="btn btn-gold">
                    {isSaving
                      ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                      : hasExisting ? 'Save Changes' : 'Create Business Profile'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ INVOICE DEFAULTS ══ */}
        {activeTab === 'invoice' && (
          <div className="single-col">
            <div className="card">
              <SectionHeader icon={FileText} title="Invoice Defaults"
                subtitle="Pre-filled when creating new invoices" />
              <div style={{ padding:20 }}>
                <div className="form-grid">
                  <Field label="Invoice Prefix" hint='e.g. "INV" → INV-0001'>
                    <input className="form-input" value={bizForm.invoice_prefix}
                      onChange={e => setBizForm(f => ({ ...f, invoice_prefix: e.target.value.toUpperCase() }))}
                      placeholder="INV" maxLength={6} />
                  </Field>
                  <Field label="Default VAT Rate">
                    <select className="form-input" defaultValue="7.5">
                      <option value="7.5">7.5% (Standard)</option>
                      <option value="0">0% (Zero-rated)</option>
                      <option value="exempt">Exempt</option>
                    </select>
                  </Field>
                  <Field label="Default WHT Rate">
                    <select className="form-input" defaultValue="5">
                      <option value="5">5% (Services)</option>
                      <option value="10">10% (Consultancy)</option>
                      <option value="2.5">2.5% (Construction)</option>
                      <option value="0">None</option>
                    </select>
                  </Field>
                  <Field label="Payment Terms (days)">
                    <input type="number" className="form-input" defaultValue={30} min={0} max={365} />
                  </Field>

                  {/* Low stock alert default */}
                  <Field label="Default Low Stock Alert Threshold"
                    hint="Products below this quantity will show a low-stock warning">
                    <input type="number" className="form-input" defaultValue={10} min={1} />
                  </Field>

                  <div style={{ gridColumn:'1 / -1' }}>
                    <Field label="Default Invoice Note">
                      <textarea className="form-input" rows={3} style={{ resize:'vertical' }}
                        defaultValue="Payment due within 30 days. Please reference invoice number when making payment." />
                    </Field>
                  </div>
                  <div style={{ gridColumn:'1 / -1' }}>
                    <Field label="Terms &amp; Conditions">
                      <textarea className="form-input" rows={3} style={{ resize:'vertical' }}
                        defaultValue="All prices are in Nigerian Naira (NGN). VAT and WHT are applicable as per FIRS guidelines." />
                    </Field>
                  </div>
                </div>

                <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={handleSaveBusiness} disabled={isSaving} className="btn btn-gold">
                    {isSaving
                      ? <><Loader2 size={14} className="animate-spin" /> Saving...</>
                      : 'Save Invoice Defaults'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* ══ PAYMENTS / PAYSTACK ══ */}
        {activeTab === 'payments' && (
          <div className="single-col">
            <div className="card">
              <SectionHeader icon={CreditCard} title="Paystack Integration"
                subtitle="Accept online payments directly into your Paystack account" />
              <div style={{ padding:20 }}>

                {/* Current status */}
                {paystackStatus && (
                  <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13,
                      color: paystackStatus.has_public_key ? '#1a6b4a' : '#9e9990' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%',
                        background: paystackStatus.has_public_key ? '#1a6b4a' : '#ddd' }} />
                      Public key {paystackStatus.has_public_key ? 'saved' : 'not set'}
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13,
                      color: paystackStatus.has_secret_key ? '#1a6b4a' : '#9e9990' }}>
                      <div style={{ width:8, height:8, borderRadius:'50%',
                        background: paystackStatus.has_secret_key ? '#1a6b4a' : '#ddd' }} />
                      Secret key {paystackStatus.has_secret_key ? 'saved' : 'not set'}
                    </div>
                  </div>
                )}

                {/* How it works */}
                <div style={{ background:'#faf9f6', borderRadius:8, padding:'14px 16px',
                  marginBottom:24, borderLeft:'3px solid #c8952a' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'#2c2a24',
                    textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:8 }}>
                    How it works
                  </div>
                  <ol style={{ fontSize:13, color:'#6b6560', paddingLeft:16, lineHeight:'1.8' }}>
                    <li>Add your Paystack API keys below and click Save</li>
                    <li>Open any sent invoice and click <strong>Payment Link</strong></li>
                    <li>Share the link with your customer — also included in reminder emails</li>
                    <li>Customer pays online — invoice is automatically marked <strong>PAID</strong></li>
                  </ol>
                </div>

                <div className="form-grid">
                  <Field label="Paystack Public Key"
                    hint="Starts with pk_test_ or pk_live_ — safe to use in the browser">
                    <input className="field-input" type="text"
                      placeholder="pk_..."
                      value={paystackForm.public_key}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPaystackForm(f => ({ ...f, public_key: e.target.value }))} />
                  </Field>
                  <Field label="Paystack Secret Key"
                    hint="Starts with sk_test_ or sk_live_ — never share this">
                    <input className="field-input" type="password"
                      placeholder="sk_..."
                      value={paystackForm.secret_key}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPaystackForm(f => ({ ...f, secret_key: e.target.value }))} />
                  </Field>
                </div>

                {/* Where to find keys */}
                <div style={{ background:'#fff8e8', border:'1px solid #f5d87a', borderRadius:8,
                  padding:'12px 16px', fontSize:13, color:'#7a5c00', marginTop:8, marginBottom:20 }}>
                  <strong>Where to find your keys:</strong> Log in to{' '}
                  <a href="https://dashboard.paystack.com/#/settings/developer"
                    target="_blank" rel="noopener noreferrer"
                    style={{ color:'#c8952a', textDecoration:'underline' }}>
                    dashboard.paystack.com
                  </a>
                  {' '}→ Settings → API Keys &amp; Webhooks.
                  Use <strong>Test keys</strong> while testing, switch to <strong>Live keys</strong> before going live.
                </div>

                {/* Webhook URL - dynamic, no hardcoded domains */}
                <div style={{ background:'#faf9f6', borderRadius:8, padding:'12px 16px',
                  fontSize:13, color:'#6b6560', marginBottom:20 }}>
                  <strong style={{ color:'#0f0e0b' }}>Webhook URL</strong> — paste this into your Paystack
                  dashboard under Settings → Webhooks so payments are recorded automatically:
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8, flexWrap:'wrap' }}>
                    <code style={{ fontFamily:'monospace', fontSize:12, background:'#fff',
                      padding:'4px 10px', borderRadius:4, color:'#2c2a24',
                      border:'1px solid #e8e4da', wordBreak:'break-all' as const }}>
                      {typeof window !== 'undefined'
                        ? `${window.location.origin.replace(':3000', ':8000')}/api/v1/paystack/webhook`
                        : '/api/v1/paystack/webhook'}
                    </code>
                    <button
                      onClick={() => {
                        const url = `${window.location.origin.replace(':3000', ':8000')}/api/v1/paystack/webhook`
                        navigator.clipboard.writeText(url)
                        toast.success('Webhook URL copied!')
                      }}
                      style={{ padding:'4px 10px', fontSize:12, background:'#0f0e0b',
                        color:'#fff', border:'none', borderRadius:6, cursor:'pointer',
                        whiteSpace:'nowrap' as const }}>
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  disabled={paystackSaving}
                  onClick={async () => {
                    if (!paystackForm.public_key && !paystackForm.secret_key) {
                      toast.error('Enter at least one key to save')
                      return
                    }
                    setPaystackSaving(true)
                    try {
                      await apiClient.post('/businesses/me/paystack', paystackForm)
                      toast.success('Paystack keys saved')
                      // Refresh status indicators
                      const res = await apiClient.get('/businesses/me/paystack/status')
                      setPaystackStatus(res.data as { has_public_key: boolean; has_secret_key: boolean })
                      setPaystackForm({ public_key: '', secret_key: '' })
                    } catch {
                      toast.error('Failed to save keys — check your connection')
                    } finally {
                      setPaystackSaving(false)
                    }
                  }}
                  style={{ padding:'10px 24px', background:'var(--gold)', color:'#fff',
                    border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                    cursor: paystackSaving ? 'not-allowed' : 'pointer',
                    opacity: paystackSaving ? 0.7 : 1 }}>
                  {paystackSaving ? 'Saving…' : 'Save Paystack Keys'}
                </button>

              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="single-col">
            <div className="card">
              <SectionHeader icon={User} title="Account Details" subtitle="Your login and personal information" />
              <div style={{ padding:20 }}>
                <div className="form-grid">
                  <Field label="Email Address" hint="Cannot be changed here — contact support">
                    <input className="form-input" value={user?.email ?? ''} readOnly
                      style={{ opacity:0.6, cursor:'not-allowed' }} />
                  </Field>
                  <Field label="Account Status">
                    <div style={{ padding:'10px 14px', borderRadius:8,
                      background: user?.is_verified ? '#d4eddf' : '#fde8e8',
                      border: `1px solid ${user?.is_verified ? '#b2d8c4' : '#f5c6c6'}`,
                      color: user?.is_verified ? '#1a6b4a' : '#b83232',
                      fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                      <Check size={14} />
                      {user?.is_verified ? 'Email Verified' : 'Email Not Verified'}
                    </div>
                  </Field>
                  <Field label="Member Since">
                    <input className="form-input" readOnly style={{ opacity:0.6, cursor:'not-allowed' }}
                      value={user?.created_at
                        ? new Date(user.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'long', year:'numeric' })
                        : '—'} />
                  </Field>
                  <Field label="Subscription Tier">
                    <div style={{ padding:'10px 14px', borderRadius:8, background:'#fff3d4',
                      border:'1px solid #f0c96b', color:'#8b6000', fontSize:13, fontWeight:600 }}>
                      {(business as { subscription_tier?: string } | null)?.subscription_tier ?? 'FREE'} Plan
                    </div>
                  </Field>
                </div>

                {/* Change password */}
                <div style={{ marginTop:24, paddingTop:20, borderTop:'1px solid var(--border)' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', marginBottom:12 }}>
                    Change Password
                  </div>
                  {pwdError && (
                    <div style={{ background:'#fde8e8', color:'#b83232', borderRadius:8,
                      padding:'10px 14px', fontSize:13, marginBottom:12 }}>
                      {pwdError}
                    </div>
                  )}
                  <div className="form-grid">
                    {([
                      { key:'current', label:'Current Password' },
                      { key:'next',    label:'New Password'     },
                      { key:'confirm', label:'Confirm New Password' },
                    ] as const).map(({ key, label }) => (
                      <Field key={key} label={label}>
                        <div style={{ position:'relative' }}>
                          <input
                            type={showPwd[key] ? 'text' : 'password'}
                            className="form-input"
                            value={pwdForm[key]}
                            placeholder={key === 'next' ? 'Min. 8 characters' : ''}
                            onChange={e => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ paddingRight:40 }}
                          />
                          <button type="button"
                            onClick={() => setShowPwd(s => ({ ...s, [key]: !s[key] }))}
                            style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                              background:'none', border:'none', cursor:'pointer', color:'var(--text-dim)', display:'flex' }}>
                            {showPwd[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                      </Field>
                    ))}
                  </div>
                  <div style={{ marginTop:16, display:'flex', justifyContent:'flex-end' }}>
                    <button className="btn btn-outline" onClick={handleChangePassword} disabled={pwdSaving}>
                      {pwdSaving ? <><Loader2 size={14} className="animate-spin" /> Updating...</> : 'Update Password'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .content{flex:1;overflow-y:auto;padding:28px}
        .page-header{margin-bottom:20px}
        .page-title{font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--ink)}
        .page-sub{font-size:13px;color:var(--text-dim);margin-top:4px}
        .tab-bar{display:flex;gap:4px;margin-bottom:20px;border-bottom:1px solid var(--border)}
        .tab-btn{display:inline-flex;align-items:center;gap:6px;padding:10px 16px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--text-mid);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all 0.15s;margin-bottom:-1px}
        .tab-btn:hover{color:var(--ink)}
        .tab-btn.active{color:var(--gold);border-bottom-color:var(--gold)}
        .settings-grid{display:grid;grid-template-columns:280px 1fr;gap:16px;align-items:start}
        .single-col{max-width:760px}
        .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .card-header{padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center}
        .card-title{font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--ink)}
        .form-group{display:flex;flex-direction:column;gap:5px}
        .form-label{font-size:11px;font-weight:500;color:var(--text-mid);text-transform:uppercase;letter-spacing:0.4px}
        .form-input{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13.5px;color:var(--text);background:#fff;outline:none;transition:border-color 0.15s,box-shadow 0.15s;box-sizing:border-box}
        .form-input:focus{border-color:var(--gold);box-shadow:0 0 0 3px rgba(200,149,42,0.12)}
        select.form-input{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239e9990' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px;cursor:pointer}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s}
        .btn:disabled{opacity:0.65;cursor:not-allowed}
        .btn-gold{background:var(--gold);color:var(--ink)}
        .btn-gold:hover:not(:disabled){background:#d4a030}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover:not(:disabled){background:var(--cream)}
        @media(max-width:900px){
          .settings-grid{grid-template-columns:1fr}
          .logo-card{order:-1}
        }
        @media(max-width:600px){
          .content{padding:12px}
          .form-grid{grid-template-columns:1fr}
          .tab-btn{padding:8px 8px;font-size:11px}
          .topbar{flex-wrap:wrap;height:auto;min-height:52px;padding:10px 14px}
          .single-col{max-width:100%}
          .card{border-radius:10px}
        }
        @media(max-width:400px){
          .tab-btn{padding:6px 6px;font-size:10px}
          .content{padding:8px}
        }
      `}</style>
    </>
  )
}