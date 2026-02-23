'use client'

import { useState } from 'react'

export default function SettingsPage() {
  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Settings</div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Business Settings</div>
          <div className="page-sub">Manage your business profile and preferences</div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Business Profile</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Business Name</label>
                  <input className="form-input" defaultValue="Adebayo Okonkwo & Associates" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Email</label>
                  <input className="form-input" defaultValue="info@adebayo-assoc.ng" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" defaultValue="+234 801 234 5678" />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-input" defaultValue="14 Awolowo Road, Ikoyi, Lagos" />
                </div>
                <div className="form-group">
                  <label className="form-label">TIN (Tax ID Number)</label>
                  <input className="form-input" defaultValue="0012345678" placeholder="Enter your TIN" />
                </div>
                <div className="form-group">
                  <label className="form-label">RC Number</label>
                  <input className="form-input" defaultValue="RC1234567" />
                </div>
                <div className="form-group">
                  <label className="form-label">Business Type</label>
                  <select className="form-input">
                    <option>Sole Proprietorship</option>
                    <option>Limited Liability Company (LLC)</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <button className="btn btn-gold">Save Changes</button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Invoice Defaults</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Default VAT Rate</label>
                    <select className="form-input">
                      <option>7.5% (Standard)</option>
                      <option>0%</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default WHT Rate</label>
                    <select className="form-input">
                      <option>5% (Services)</option>
                      <option>10%</option>
                      <option>None</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Terms (days)</label>
                    <input className="form-input" defaultValue="30" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Invoice Note</label>
                    <textarea className="form-input" rows={2} defaultValue="Payment due within 30 days. Bank details on request." />
                  </div>
                  <button className="btn btn-outline">Save Defaults</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">User Profile</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" defaultValue="Adebayo Okonkwo" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" defaultValue="adebayo@taxflow.ng" />
                  </div>
                  <button className="btn btn-outline">Update Profile</button>
                  <button className="btn btn-outline" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
                    Change Password
                  </button>
                </div>
              </div>
            </div>
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

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-mid);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: var(--text);
          background: #fff;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(200,149,42,0.12);
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

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--cream);
        }

        @media (max-width: 1024px) {
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .content {
            padding: 16px;
          }
          .page-header {
            margin-bottom: 16px;
          }
          .page-title {
            font-size: 22px;
          }
          .grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .card-header {
            padding: 14px 16px 12px;
          }
          .card > div {
            padding: 16px !important;
          }
          .form-group {
            gap: 4px;
          }
          .form-label {
            font-size: 11px;
          }
          .form-input {
            padding: 10px 12px;
            font-size: 14px;
          }
          .btn {
            width: 100%;
            justify-content: center;
            margin-top: 8px;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 12px;
          }
          .page-title {
            font-size: 20px;
          }
        }
      `}</style>
    </>
  )
}
