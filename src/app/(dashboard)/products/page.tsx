'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct } from '@/lib/hooks/useProducts'
import type { Product, ProductCreate } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductsPage() {
  const [searchValue, setSearchValue] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  // Form state for add/edit product
  const [formData, setFormData] = useState<ProductCreate>({
    name: '',
    description: '',
    sku: '',
    category: '',
    unit_price: 0,
    cost_price: 0,
    unit_of_measure: 'piece',
    vat_rate: 7.5,
    track_inventory: false,
    current_stock: 0,
    reorder_level: 10,
  })

  // Fetch data from API
  const { data: productsData, isLoading } = useProducts({ 
    limit: 50,
    search: searchValue || undefined,
  })

  // Mutations
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const products: Product[] = productsData?.products || []
  const totalProducts = productsData?.total || 0

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  // Open add dialog and reset form
  const handleAddClick = () => {
    setFormData({
      name: '',
      description: '',
      sku: '',
      category: '',
      unit_price: 0,
      cost_price: 0,
      unit_of_measure: 'piece',
      vat_rate: 7.5,
      track_inventory: false,
      current_stock: 0,
      reorder_level: 10,
    })
    setIsAddDialogOpen(true)
  }

  // Open edit dialog with product data
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      sku: product.sku || '',
      category: product.category || '',
      unit_price: product.unit_price,
      cost_price: product.cost_price || 0,
      unit_of_measure: product.unit_of_measure,
      vat_rate: product.vat_rate,
      track_inventory: product.track_inventory,
      current_stock: product.current_stock || 0,
      reorder_level: product.reorder_level || 10,
    })
    setIsEditDialogOpen(true)
  }

  // Handle add product submit
  const handleAddSubmit = async () => {
    try {
      await createProduct.mutateAsync(formData)
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error creating product:', error)
    }
  }

  // Handle edit product submit
  const handleEditSubmit = async () => {
    if (!selectedProduct) return
    try {
      await updateProduct.mutateAsync({ id: selectedProduct.id, data: formData })
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
    } catch (error) {
      console.error('Error updating product:', error)
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Products</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading products...</p>
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
        <div className="topbar-title">Products</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-gold" onClick={handleAddClick}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Products & Services</div>
          <div className="page-sub">{totalProducts} items in catalogue</div>
        </div>

        {products.length > 0 ? (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>VAT</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-bold">{product.name}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          background: product.category === 'Services' ? '#dce8f8' : '#f3e8ff',
                          color: product.category === 'Services' ? '#1e4d8c' : '#7c3aed'
                        }}
                      >
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td>{formatCurrency(product.unit_price)}</td>
                    <td>{product.vat_rate}%</td>
                    <td>{product.current_stock ?? '-'}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(product)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <p>No products found</p>
              <button className="btn btn-gold" onClick={handleAddClick}>
                <Plus size={16} /> Add First Product
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Fill in the product details below to create a new product in your catalogue.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                  placeholder="e.g., PRD-001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Electronics"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                <Input
                  id="unit_of_measure"
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleInputChange}
                  placeholder="e.g., piece, kg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price (NGN) *</Label>
                <Input
                  id="unit_price"
                  name="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price (NGN)</Label>
                <Input
                  id="cost_price"
                  name="cost_price"
                  type="number"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vat_rate">VAT Rate (%)</Label>
                <Input
                  id="vat_rate"
                  name="vat_rate"
                  type="number"
                  value={formData.vat_rate}
                  onChange={handleInputChange}
                  placeholder="7.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_stock">Initial Stock</Label>
                <Input
                  id="current_stock"
                  name="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="track_inventory"
                name="track_inventory"
                checked={formData.track_inventory}
                onChange={handleCheckboxChange}
                className="w-4 h-4"
              />
              <Label htmlFor="track_inventory" className="cursor-pointer">
                Track Inventory
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={createProduct.isPending}>
              {createProduct.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  name="sku"
                  value={formData.sku}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit_of_measure">Unit of Measure</Label>
                <Input
                  id="edit-unit_of_measure"
                  name="unit_of_measure"
                  value={formData.unit_of_measure}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-unit_price">Unit Price (NGN) *</Label>
                <Input
                  id="edit-unit_price"
                  name="unit_price"
                  type="number"
                  value={formData.unit_price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cost_price">Cost Price (NGN)</Label>
                <Input
                  id="edit-cost_price"
                  name="cost_price"
                  type="number"
                  value={formData.cost_price}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vat_rate">VAT Rate (%)</Label>
                <Input
                  id="edit-vat_rate"
                  name="vat_rate"
                  type="number"
                  value={formData.vat_rate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-current_stock">Current Stock</Label>
                <Input
                  id="edit-current_stock"
                  name="current_stock"
                  type="number"
                  value={formData.current_stock}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-track_inventory"
                name="track_inventory"
                checked={formData.track_inventory}
                onChange={handleCheckboxChange}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-track_inventory" className="cursor-pointer">
                Track Inventory
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={updateProduct.isPending}>
              {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
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

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--cream);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .search-wrap {
          position: relative;
        }

        .search-input {
          padding: 9px 14px 9px 38px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text);
          background: var(--cream);
          outline: none;
          width: 220px;
          transition: all 0.15s;
        }

        .search-input:focus {
          border-color: var(--gold);
          background: #fff;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-dim);
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        .empty-state p {
          margin-bottom: 12px;
        }

        @media (max-width: 1024px) {
          .topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 12px 16px;
            gap: 10px;
          }
          .topbar-title {
            width: 100%;
            font-size: 18px;
          }
          .topbar-actions {
            width: 100%;
            justify-content: space-between;
          }
          .table {
            display: block;
            overflow-x: auto;
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
          .table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .table th, .table td {
            padding: 10px 12px;
            font-size: 12px;
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 12px;
          }
          .topbar-actions {
            flex-wrap: wrap;
          }
          .search-wrap {
            order: 3;
            width: 100%;
            margin-top: 8px;
          }
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
