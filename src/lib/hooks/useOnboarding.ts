import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import { useBusiness } from './useBusiness'
import { useCustomers } from './useCustomers'
import { useInvoices } from './useInvoices'

export interface OnboardingStep {
  id: string
  label: string
  description: string
  completed: boolean
  href: string
  cta: string
  icon: string
}

export function useOnboarding() {
  const { data: business } = useBusiness()
  const { data: customers } = useCustomers({ limit: 1 })
  const { data: invoices } = useInvoices({ page_size: 1 })

  const steps: OnboardingStep[] = [
    {
      id: 'business_profile',
      label: 'Set up your business',
      description: 'Add your business name, TIN, and branding',
      completed: !!(business?.business_name && business?.tin),
      href: '/settings',
      cta: 'Set Up Business',
      icon: '🏢',
    },
    {
      id: 'first_customer',
      label: 'Add your first customer',
      description: 'Add a customer to start invoicing them',
      completed: (customers?.total ?? 0) > 0,
      href: '/customers',
      cta: 'Add Customer',
      icon: '👤',
    },
    {
      id: 'first_invoice',
      label: 'Create your first invoice',
      description: 'Send a professional invoice with automatic VAT',
      completed: (invoices?.total ?? 0) > 0,
      href: '/invoices/new',
      cta: 'Create Invoice',
      icon: '🧾',
    },
    {
      id: 'paystack_setup',
      label: 'Enable online payments',
      description: 'Connect Paystack so customers can pay online',
      completed: !!(business as {paystack_public_key?: string} | undefined)?.paystack_public_key,
      href: '/settings?tab=payments',
      cta: 'Connect Paystack',
      icon: '💳',
    },
    {
      id: 'upload_logo',
      label: 'Upload your logo',
      description: 'Make invoices look professional with your logo',
      completed: !!business?.logo_url,
      href: '/settings',
      cta: 'Upload Logo',
      icon: '🎨',
    },
  ]

  const completedCount = steps.filter(s => s.completed).length
  const isFullyComplete = completedCount === steps.length
  const progressPct = Math.round((completedCount / steps.length) * 100)

  return { steps, completedCount, isFullyComplete, progressPct, totalSteps: steps.length }
}