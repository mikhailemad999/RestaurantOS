import React, { useState, useEffect } from 'react'
import {
  Store, Save, Globe, DollarSign,
  Receipt, Clock, MapPin, Phone, Mail,
  CheckCircle2, Sparkles, Sliders
} from 'lucide-react'
import { useGetRestaurantQuery, useUpdateRestaurantMutation } from '@/api/restaurantApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

export const RestaurantSettingsPage: React.FC = () => {
  const { data: resData, isLoading } = useGetRestaurantQuery()
  const [updateRestaurant, { isLoading: isSaving }] = useUpdateRestaurantMutation()

  const restaurant = resData?.data

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [taxNumber, setTaxNumber] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [timezone, setTimezone] = useState('UTC')
  const [language, setLanguage] = useState('en')
  const [receiptFooter, setReceiptFooter] = useState('')
  const [savedMessage, setSavedMessage] = useState(false)

  useEffect(() => {
    if (restaurant) {
      setName(restaurant.name || '')
      setPhone(restaurant.phone || '')
      setEmail(restaurant.email || '')
      setAddress(restaurant.address || '')
      setTaxNumber(restaurant.tax_number || '')
      setCurrency(restaurant.currency || 'USD')
      setTimezone(restaurant.timezone || 'UTC')
      setLanguage(restaurant.language || 'en')
      setReceiptFooter(restaurant.receipt_footer || '')
    }
  }, [restaurant])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavedMessage(false)
    try {
      await updateRestaurant({
        name,
        phone,
        email,
        address,
        tax_number: taxNumber,
        currency,
        timezone,
        language,
        receipt_footer: receiptFooter,
      }).unwrap()
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    } catch {
      setSavedMessage(true)
      setTimeout(() => setSavedMessage(false), 3000)
    }
  }

  const currencies = [
    { label: 'USD ($) — United States Dollar', value: 'USD' },
    { label: 'EUR (€) — Eurozone Euro', value: 'EUR' },
    { label: 'GBP (£) — British Pound Sterling', value: 'GBP' },
    { label: 'EGP (E£) — Egyptian Pound', value: 'EGP' },
    { label: 'SAR (SR) — Saudi Riyal', value: 'SAR' },
    { label: 'AED (AED) — United Arab Emirates Dirham', value: 'AED' },
    { label: 'CAD ($) — Canadian Dollar', value: 'CAD' },
  ]

  const timezones = [
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { label: 'America/New_York (EST / EDT)', value: 'America/New_York' },
    { label: 'America/Los_Angeles (PST / PDT)', value: 'America/Los_Angeles' },
    { label: 'Europe/London (GMT / BST)', value: 'Europe/London' },
    { label: 'Europe/Paris (CET / CEST)', value: 'Europe/Paris' },
    { label: 'Africa/Cairo (EEST)', value: 'Africa/Cairo' },
    { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Asia/Riyadh (AST)', value: 'Asia/Riyadh' },
  ]

  return (
    <div className="space-y-6 animate-entrance max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Restaurant Brand & Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure restaurant identity, currency format, receipt footers, and billing settings.
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 animate-entrance">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            Profile Updated Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Brand Info */}
        <Card
          title="Brand & Business Details"
          subtitle="Displayed on printed customer bills, KOT tickets, and reports"
          icon={<Store className="w-4 h-4" />}
        >
          <div className="space-y-4">
            <Input
              label="Restaurant Legal / Display Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Bella Italia Ristorante"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Phone Contact"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                icon={<Phone className="w-4 h-4" />}
              />
              <Input
                label="Primary Business Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@restaurant.com"
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <Input
              label="HQ Business Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main Street, Suite 400"
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </Card>

        {/* Currency & Localization */}
        <Card
          title="Currency & Regional Preferences"
          subtitle="Monetary symbols, VAT numbers, and timestamps"
          icon={<Sliders className="w-4 h-4" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="POS System Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={currencies}
            />

            <Input
              label="Tax Registration (VAT / GST Number)"
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              placeholder="e.g. TAX-987654321"
            />

            <Select
              label="System Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={timezones}
            />

            <Select
              label="Default System Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              options={[
                { label: 'English (US)', value: 'en' },
                { label: 'Arabic (العربية)', value: 'ar' },
                { label: 'Spanish (Español)', value: 'es' },
                { label: 'French (Français)', value: 'fr' },
              ]}
            />
          </div>
        </Card>

        {/* Receipt Customization */}
        <Card
          title="Receipt Customization"
          subtitle="Footer message printed at the bottom of customer receipts"
          icon={<Receipt className="w-4 h-4" />}
        >
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Receipt Footer Greeting & Socials
            </label>
            <textarea
              rows={3}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              placeholder="Thank you for dining with us! Follow us on Instagram @restaurantos"
              className="w-full rounded-xl border border-slate-200 p-3.5 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 transition-all"
            />
          </div>
        </Card>

        {/* Save CTA */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4 text-white" />}
          >
            Save Restaurant Configuration
          </Button>
        </div>
      </form>
    </div>
  )
}
