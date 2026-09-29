import React, { useState, useMemo } from 'react'
import {
  Plus, Upload, Download, Edit2, Trash2,
  Check, Clock, Flame, Leaf, Sparkles,
  ShoppingBag, X, CheckCircle2, AlertCircle,
  FileSpreadsheet, SlidersHorizontal
} from 'lucide-react'
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetMenuItemsQuery,
  useCreateMenuItemMutation,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useToggleItemAvailabilityMutation,
  useImportMenuFileMutation,
  MenuItem,
  ItemVariant,
  Category
} from '@/api/menuApi'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'

export const MenuPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [kitchenNotes, setKitchenNotes] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [cartSuccessMessage, setCartSuccessMessage] = useState('')

  // Item Create/Edit Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemName, setItemName] = useState('')
  const [itemCategory, setItemCategory] = useState('')
  const [itemDesc, setItemDesc] = useState('')
  const [itemBasePrice, setItemBasePrice] = useState('')
  const [itemPrepTime, setItemPrepTime] = useState('15')
  const [isVeg, setIsVeg] = useState(false)
  const [isSpicy, setIsSpicy] = useState(false)
  const [isGf, setIsGf] = useState(false)
  const [variantsList, setVariantsList] = useState<{ name: string; price: string }[]>([])
  const [itemFormError, setItemFormError] = useState('')

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDesc, setNewCategoryDesc] = useState('')

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importStatus, setImportStatus] = useState<string>('')

  // Queries & Mutations
  const { data: categories = [], refetch: refetchCats } = useGetCategoriesQuery()
  const { data: menuItems = [], isLoading, refetch: refetchItems } = useGetMenuItemsQuery()

  const [createCategory, { isLoading: isCreatingCat }] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [createMenuItem, { isLoading: isSavingItem }] = useCreateMenuItemMutation()
  const [updateMenuItem] = useUpdateMenuItemMutation()
  const [deleteMenuItem] = useDeleteMenuItemMutation()
  const [toggleAvailability] = useToggleItemAvailabilityMutation()
  const [importMenuFile, { isLoading: isImporting }] = useImportMenuFileMutation()

  // Filter items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const matchesSearch = !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Open item customization modal
  const handleOpenCustomize = (item: MenuItem) => {
    setSelectedItem(item)
    setSelectedVariant(item.variants && item.variants.length > 0 ? item.variants[0] : null)
    setSelectedModifiers([])
    setKitchenNotes('')
    setItemQuantity(1)
    setCartSuccessMessage('')
    setIsCustomizeOpen(true)
  }

  // Calculate dynamic price for modal
  const calculatedTotal = useMemo(() => {
    if (!selectedItem) return 0
    let unitPrice = selectedVariant
      ? parseFloat(selectedVariant.price)
      : parseFloat(selectedItem.base_price)

    // Add selected modifier prices
    if (selectedItem.modifier_groups) {
      for (const group of selectedItem.modifier_groups) {
        for (const opt of group.options) {
          if (selectedModifiers.includes(opt.id)) {
            unitPrice += parseFloat(opt.price)
          }
        }
      }
    }

    return (unitPrice * itemQuantity).toFixed(2)
  }, [selectedItem, selectedVariant, selectedModifiers, itemQuantity])

  const handleAddCustomizedOrder = () => {
    const summary = `${itemQuantity}x ${selectedItem?.name} (${selectedVariant ? selectedVariant.name : 'Standard'})`
    setCartSuccessMessage(`Added to POS Ticket: ${summary} — $${calculatedTotal}`)
    setTimeout(() => {
      setIsCustomizeOpen(false)
      setCartSuccessMessage('')
    }, 1500)
  }

  // Open item create modal
  const handleOpenCreateItem = () => {
    setEditingItem(null)
    setItemName('')
    setItemCategory(categories[0]?.id || '')
    setItemDesc('')
    setItemBasePrice('')
    setItemPrepTime('15')
    setIsVeg(false)
    setIsSpicy(false)
    setIsGf(false)
    setVariantsList([
      { name: 'Small', price: '' },
      { name: 'Medium', price: '' },
      { name: 'Large', price: '' },
    ])
    setItemFormError('')
    setIsItemModalOpen(true)
  }

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setItemFormError('')

    if (!itemName || !itemBasePrice || !itemCategory) {
      setItemFormError('Please fill in Name, Category, and Base Price.')
      return
    }

    const validVariants = variantsList
      .filter((v) => v.name.trim() && v.price.trim())
      .map((v) => ({ name: v.name.trim(), price: v.price.trim() }))

    try {
      if (editingItem) {
        await updateMenuItem({
          id: editingItem.id,
          data: {
            name: itemName,
            category: itemCategory,
            description: itemDesc,
            base_price: itemBasePrice,
            prep_time_minutes: parseInt(itemPrepTime) || 15,
            is_vegetarian: isVeg,
            is_spicy: isSpicy,
            is_gluten_free: isGf,
            variants: validVariants,
          },
        }).unwrap()
      } else {
        await createMenuItem({
          name: itemName,
          category: itemCategory,
          description: itemDesc,
          base_price: itemBasePrice,
          prep_time_minutes: parseInt(itemPrepTime) || 15,
          is_vegetarian: isVeg,
          is_spicy: isSpicy,
          is_gluten_free: isGf,
          variants: validVariants,
        }).unwrap()
      }
      setIsItemModalOpen(false)
      refetchItems()
    } catch (err: any) {
      setItemFormError(err?.data?.message || 'Failed to save menu item')
    }
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
        sort_order: categories.length + 1,
      }).unwrap()
      setIsCategoryModalOpen(false)
      setNewCategoryName('')
      setNewCategoryDesc('')
      refetchCats()
    } catch (err: any) {
      alert(err?.data?.message || 'Failed to create category')
    }
  }

  const handleUploadImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!importFile) return

    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const res = await importMenuFile(formData).unwrap()
      setImportStatus(res.message || 'Import successful!')
      refetchCats()
      refetchItems()
      setTimeout(() => {
        setIsImportModalOpen(false)
        setImportFile(null)
        setImportStatus('')
      }, 2000)
    } catch (err: any) {
      setImportStatus(`Error: ${err?.data?.message || 'Failed to parse file'}`)
    }
  }

  return (
    <div className="space-y-8 animate-entrance">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Menu Catalog & Recipes
            </h1>
            <Badge variant="accent" size="sm">
              {menuItems.length} Total Items
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Browse big square cards, configure portion sizes, kitchen prep notes, and manage categories or bulk upload with CSV / Excel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import CSV / Excel
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4 text-white" />}
            onClick={handleOpenCreateItem}
          >
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Horizontal Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border
              ${selectedCategory === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
              }
            `}
          >
            All Items ({menuItems.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id
            const count = menuItems.filter((i) => i.category === cat.id).length
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 border
                  ${isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }
                `}
              >
                {cat.name} ({count})
              </button>
            )
          })}

          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-dashed border-slate-300 text-slate-500 hover:border-indigo-500 hover:text-indigo-600 bg-white/60 transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Category</span>
          </button>
        </div>

        {/* Search Field (Clean, No Overlapping Icons) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <input
            type="text"
            placeholder="Type item name or ingredient to filter menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Big Square Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-20 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="font-bold text-slate-700">Loading delicious menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-8">
            <p className="text-base font-extrabold text-slate-800">No menu items found</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting another category, changing your search, or adding an item.</p>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4 text-white" />}
              className="mt-4"
              onClick={handleOpenCreateItem}
            >
              Add First Item
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasVariants = item.variants && item.variants.length > 0
            const startingPrice = hasVariants ? item.variants[0].price : item.base_price

            return (
              <div
                key={item.id}
                onClick={() => handleOpenCustomize(item)}
                className={`
                  group relative flex flex-col justify-between p-6 rounded-3xl border bg-white shadow-xs
                  hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 cursor-pointer
                  aspect-square min-h-[260px] select-none
                  ${!item.is_available ? 'opacity-60 bg-slate-50' : ''}
                `}
              >
                {/* Top Section: Category & Dietary Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.is_vegetarian && (
                      <span className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200" title="Vegetarian">
                        <Leaf className="w-3 h-3" />
                      </span>
                    )}
                    {item.is_spicy && (
                      <span className="p-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200" title="Spicy">
                        <Flame className="w-3 h-3" />
                      </span>
                    )}
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-0.5 rounded-full bg-slate-100">
                      {item.category_name || 'Item'}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.prep_time_minutes}m
                  </span>
                </div>

                {/* Center Section: Big Bold Title & Description */}
                <div className="my-auto py-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {item.description || 'Delicious freshly prepared culinary recipe.'}
                  </p>
                </div>

                {/* Bottom Section: Price & Size Options Count */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">
                      {hasVariants ? 'From' : 'Price'}
                    </span>
                    <span className="text-xl font-extrabold text-slate-900 font-mono-numbers tracking-tight">
                      ${startingPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasVariants && (
                      <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.variants.length} Sizes
                      </span>
                    )}
                    <span className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-colors">
                      <ShoppingBag className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ─── MODAL 1: Item Customization (Sizes, Modifiers & Notes) ──────────────── */}
      <Modal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        title={selectedItem?.name || 'Customize Item'}
        description={selectedItem?.description || 'Select portion size, extra add-ons, and add kitchen notes.'}
        maxWidth="xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                <button
                  type="button"
                  onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 py-1.5 text-xs font-mono font-bold text-slate-900">
                  {itemQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantity(itemQuantity + 1)}
                  className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
              </div>

              <div className="text-left">
                <span className="text-[10px] font-bold uppercase text-slate-400 block leading-none">Total</span>
                <span className="text-lg font-extrabold text-indigo-600 font-mono-numbers">
                  ${calculatedTotal}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              icon={<ShoppingBag className="w-4 h-4 text-white" />}
              onClick={handleAddCustomizedOrder}
            >
              Add to Ticket (${calculatedTotal})
            </Button>
          </div>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {cartSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-entrance">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {cartSuccessMessage}
              </div>
            )}

            {/* Size Variants Selection */}
            {selectedItem.variants && selectedItem.variants.length > 0 && (
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-2.5">
                  1. Select Portion Size *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedItem.variants.map((v) => {
                    const isPicked = selectedVariant?.id === v.id
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`
                          p-3.5 rounded-2xl border text-left transition-all cursor-pointer select-none
                          ${isPicked
                            ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                          }
                        `}
                      >
                        <span className="block text-xs font-extrabold text-slate-900">
                          {v.name}
                        </span>
                        <span className="block text-sm font-extrabold text-indigo-600 font-mono-numbers mt-1">
                          ${v.price}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Modifiers & Extra Toppings */}
            {selectedItem.modifier_groups && selectedItem.modifier_groups.length > 0 && (
              <div className="space-y-4">
                {selectedItem.modifier_groups.map((group) => (
                  <div key={group.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                    <span className="block text-xs font-extrabold text-slate-900 mb-2">
                      {group.name}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {group.options.map((opt) => {
                        const isChecked = selectedModifiers.includes(opt.id)
                        return (
                          <label
                            key={opt.id}
                            className={`
                              flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-all
                              ${isChecked
                                ? 'bg-white border-indigo-600 text-indigo-900 font-bold shadow-2xs'
                                : 'bg-white/70 border-slate-200 text-slate-700 hover:bg-white'
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setSelectedModifiers(selectedModifiers.filter((id) => id !== opt.id))
                                  } else {
                                    setSelectedModifiers([...selectedModifiers, opt.id])
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                              />
                              <span>{opt.name}</span>
                            </div>
                            <span className="font-mono text-slate-500 font-bold">
                              +${opt.price}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Special Kitchen Preparation Notes */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 mb-1.5">
                Kitchen Prep Notes & Allergy Instructions
              </label>
              <textarea
                rows={3}
                value={kitchenNotes}
                onChange={(e) => setKitchenNotes(e.target.value)}
                placeholder="e.g. Extra crispy crust, dressing on the side, allergic to peanuts..."
                className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900 transition-all"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ─── MODAL 2: Create / Edit Menu Item ─────────────────────────────────── */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? `Edit: ${editingItem.name}` : 'Add New Culinary Menu Item'}
        description="Fill in dish details, base pricing, and optional portion sizes."
        maxWidth="xl"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSavingItem}
              onClick={handleSaveItem}
            >
              {editingItem ? 'Save Changes' : 'Create Item'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {itemFormError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
              {itemFormError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Dish / Item Name *"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. Truffle Mushroom Pizza"
              required
            />

            <Select
              label="Menu Category *"
              value={itemCategory}
              onChange={(e) => setItemCategory(e.target.value)}
              options={categories.map((c) => ({ label: c.name, value: c.id }))}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Ingredients & Culinary Description
            </label>
            <textarea
              rows={2}
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="List fresh ingredients, sauce base, and key flavors..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Price ($) *"
              type="number"
              step="0.01"
              value={itemBasePrice}
              onChange={(e) => setItemBasePrice(e.target.value)}
              placeholder="14.50"
              required
            />

            <Input
              label="Kitchen Prep Time (Minutes)"
              type="number"
              value={itemPrepTime}
              onChange={(e) => setItemPrepTime(e.target.value)}
              placeholder="12"
            />
          </div>

          {/* Size Variants Builder */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Portion Size Variants (Optional)
              </span>
              <button
                type="button"
                onClick={() => setVariantsList([...variantsList, { name: '', price: '' }])}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size
              </button>
            </div>

            <div className="space-y-2">
              {variantsList.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Size name (e.g. 10 inch, Large)"
                    value={variant.name}
                    onChange={(e) => {
                      const updated = [...variantsList]
                      updated[idx].name = e.target.value
                      setVariantsList(updated)
                    }}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-600 font-semibold"
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price ($)"
                    value={variant.price}
                    onChange={(e) => {
                      const updated = [...variantsList]
                      updated[idx].price = e.target.value
                      setVariantsList(updated)
                    }}
                    className="w-28 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-indigo-600 font-mono font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setVariantsList(variantsList.filter((_, i) => i !== idx))}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Checkboxes */}
          <div className="flex flex-wrap gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isVeg}
                onChange={(e) => setIsVeg(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300"
              />
              Vegetarian
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isSpicy}
                onChange={(e) => setIsSpicy(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded border-slate-300"
              />
              Spicy
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={isGf}
                onChange={(e) => setIsGf(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300"
              />
              Gluten-Free
            </label>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: New Category Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Create Menu Category"
        description="Add a food or beverage group to organize items."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isCreatingCat}
              onClick={handleSaveCategory}
            >
              Create Category
            </Button>
          </>
        }
      >
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <Input
            label="Category Name *"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="e.g. Specialty Mocktails"
            required
          />

          <Input
            label="Short Description"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
            placeholder="e.g. Freshly shaken fruit beverages"
          />
        </form>
      </Modal>

      {/* ─── MODAL 4: CSV / Excel Bulk Upload ─────────────────────────────────── */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Menu via CSV or Excel"
        description="Upload your entire restaurant menu spreadsheet in seconds."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isImporting}
              disabled={!importFile}
              onClick={handleUploadImport}
            >
              Upload & Import Menu
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {importStatus && (
            <div className={`p-3.5 rounded-xl text-xs font-bold border ${
              importStatus.startsWith('Error')
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}>
              {importStatus}
            </div>
          )}

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/60 transition-colors">
            <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-extrabold text-slate-800">
              {importFile ? importFile.name : 'Select CSV or Excel (.xlsx) file'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports columns: Category, Name, Description, BasePrice, Sizes, PrepTime, Dietary
            </p>

            <input
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImportFile(e.target.files[0])
                }
              }}
              className="mt-3 text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
          </div>

          {/* Sample Download CTA */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs">
            <div>
              <span className="font-extrabold text-indigo-950 block">Need the spreadsheet template?</span>
              <span className="text-[11px] text-indigo-700">Download formatted CSV sample with columns & size examples.</span>
            </div>
            <a
              href="http://127.0.0.1:8000/api/menu/items/download-template/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold hover:bg-indigo-50 transition-colors no-underline flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" /> Template
            </a>
          </div>
        </div>
      </Modal>
    </div>
  )
}
