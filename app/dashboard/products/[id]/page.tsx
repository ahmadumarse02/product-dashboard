'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormEvent, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authClient } from '@/lib/auth-client' // Import authClient

type ProductStatus = 'Active' | 'Draft' | 'Low Stock'

type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: number
  status: ProductStatus
  description: string
  createdAt: string
  updatedAt: string
}

type ProductForm = {
  name: string
  category: string
  price: string
  stock: string
  status: ProductStatus
  description: string
}

const blankProduct: ProductForm = {
  name: '',
  category: '',
  price: '',
  stock: '',
  status: 'Active',
  description: '',
}

const productToForm = (product: Product): ProductForm => ({
  name: product.name,
  category: product.category,
  price: String(product.price),
  stock: String(product.stock),
  status: product.status,
  description: product.description,
})

const inputClass = 'border-white/10 bg-slate-950/60 text-white placeholder:text-white/40 focus-visible:border-blue-500 focus-visible:ring-blue-500/20'
const labelClass = 'text-white'
const selectTriggerClass = 'w-full border-white/10 bg-slate-950/60 text-white focus-visible:border-blue-500 focus-visible:ring-blue-500/20'
const selectContentClass = 'border border-white/10 bg-slate-900 text-white'
const selectItemClass = 'focus:bg-blue-500/20 focus:text-white'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [editForm, setEditForm] = useState<ProductForm>(blankProduct)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setIsLoading(true)
      
      // Get session using authClient
      const { data: session } = await authClient.getSession()
      
      if (!session) {
        toast.error('Please log in to view product details')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
          router.push('/login')
          return
        }
        if (response.status === 404) {
          setProduct(null)
          return
        }
        throw new Error('Failed to fetch product')
      }
      const data = await response.json()
      setProduct(data)
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  const openEditDialog = () => {
    if (!product) return

    setEditForm(productToForm(product))
    setIsEditDialogOpen(true)
  }

  const updateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!product) return

    const nextProduct = {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      status: editForm.status,
      description: editForm.description.trim() || 'No description added.',
    }

    if (!nextProduct.name || !nextProduct.category || Number.isNaN(nextProduct.price) || Number.isNaN(nextProduct.stock)) {
      toast.error('Please fill product name, category, price, and stock.')
      return
    }

    setIsUpdating(true)
    try {
      const { data: session } = await authClient.getSession()

      if (!session) {
        toast.error('Please log in to edit product details')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nextProduct),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to update product')
      }

      const updatedProduct = await response.json()
      setProduct(updatedProduct)
      setIsEditDialogOpen(false)
      toast.success('Product updated successfully')
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="text-center py-12">
          <p className="text-white/60">Product not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <Button
          onClick={openEditDialog}
          className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
        >
          <Edit2 className="w-4 h-4" />
          Edit Product
        </Button>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">{product.name}</CardTitle>
              <CardDescription className="text-white/60">{product.category}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-2">Description</h3>
                <p className="text-white/60">{product.description}</p>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Price</h3>
                  <p className="text-2xl font-bold text-white">${product.price.toFixed(2)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white/80 mb-2">Stock Level</h3>
                  <p className="text-2xl font-bold text-white">{product.stock} units</p>
                </div>
              </div>

              {/* Inventory Value */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-sm font-semibold text-white/80 mb-2">Inventory Value</h3>
                <p className="text-3xl font-bold text-white">
                  ${(product.price * product.stock).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-white">Product Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase">Product ID</p>
                <p className="mt-1 break-all font-mono text-sm text-white">{product.id}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase">Created</p>
                <p className="text-sm text-white mt-1">
                  {new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/60 uppercase">Category</p>
                <p className="text-sm text-white mt-1">{product.category}</p>
              </div>
            </CardContent>
          </Card>

          {/* Stock Status */}
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader>
              <CardTitle className="text-sm text-white">Stock Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">Available</span>
                  <span className={`text-sm font-semibold ${
                    product.stock > 10
                      ? 'text-green-400'
                      : product.stock > 0
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    {product.stock} units
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      product.stock > 10
                        ? 'bg-green-500'
                        : product.stock > 0
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min((product.stock / 50) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setIsEditDialogOpen(false)
          }
        }}
      >
        <DialogContent className="border-white/10 bg-slate-900 text-white sm:max-w-lg">
          <form onSubmit={updateProduct} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Product</DialogTitle>
              <DialogDescription className="text-white/60">
                Update product details and save your changes.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="detail-edit-name" className={labelClass}>Product Name</Label>
                <Input
                  id="detail-edit-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  placeholder="Enter product name"
                  disabled={isUpdating}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="detail-edit-category" className={labelClass}>Category</Label>
                <Input
                  id="detail-edit-category"
                  value={editForm.category}
                  onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                  placeholder="Electronics, Fashion..."
                  disabled={isUpdating}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="detail-edit-price" className={labelClass}>Price</Label>
                  <Input
                    id="detail-edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(event) => setEditForm({ ...editForm, price: event.target.value })}
                    placeholder="0.00"
                    disabled={isUpdating}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="detail-edit-stock" className={labelClass}>Stock</Label>
                  <Input
                    id="detail-edit-stock"
                    type="number"
                    min="0"
                    value={editForm.stock}
                    onChange={(event) => setEditForm({ ...editForm, stock: event.target.value })}
                    placeholder="0"
                    disabled={isUpdating}
                    className={inputClass}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className={labelClass}>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: ProductStatus) => setEditForm({ ...editForm, status: value })}
                  disabled={isUpdating}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={selectContentClass}>
                    <SelectItem className={selectItemClass} value="Active">Active</SelectItem>
                    <SelectItem className={selectItemClass} value="Draft">Draft</SelectItem>
                    <SelectItem className={selectItemClass} value="Low Stock">Low Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="detail-edit-description" className={labelClass}>Description</Label>
                <Textarea
                  id="detail-edit-description"
                  value={editForm.description}
                  onChange={(event) => setEditForm({ ...editForm, description: event.target.value })}
                  placeholder="Short product details"
                  rows={4}
                  disabled={isUpdating}
                  className={inputClass}
                />
              </div>
            </div>
            <DialogFooter className="border-white/10 bg-slate-950/70">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
                className="border-white/10 bg-slate-900 text-white hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
