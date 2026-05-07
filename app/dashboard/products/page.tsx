'use client'

import { FormEvent, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, Eye, LayoutDashboard, Loader2, PackagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"

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
  name: "",
  category: "",
  price: "",
  stock: "",
  status: "Active",
  description: "",
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const productToForm = (product: Product): ProductForm => ({
  name: product.name,
  category: product.category,
  price: String(product.price),
  stock: String(product.stock),
  status: product.status,
  description: product.description,
})

const panelClass = "border-white/10 bg-slate-900/50 shadow-xl shadow-blue-950/10"
const inputClass = "border-white/10 bg-slate-950/60 text-white placeholder:text-white/40 focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
const labelClass = "text-white"
const selectTriggerClass = "w-full border-white/10 bg-slate-950/60 text-white focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
const selectContentClass = "border border-white/10 bg-slate-900 text-white"
const selectItemClass = "focus:bg-blue-500/20 focus:text-white"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [form, setForm] = useState<ProductForm>(blankProduct)
  const [editForm, setEditForm] = useState<ProductForm>(blankProduct)
  const [query, setQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check authentication on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    checkAuthAndFetchProducts()
  }, [])

  const checkAuthAndFetchProducts = async () => {
    try {
      const { data: session } = await authClient.getSession()
      
      if (!session) {
        toast.error('Please log in to view products')
        router.push('/login')
        return
      }
      
      await fetchProducts()
    } catch (error) {
      console.error('Auth error:', error)
      toast.error('Authentication failed')
      router.push('/login')
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products', {
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
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return products

    return products.filter((product) =>
      [product.name, product.category, product.id, product.status]
        .join(" ")
        .toLowerCase()
        .includes(search)
    )
  }, [products, query])

  const addProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newProduct = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      status: form.status,
      description: form.description.trim() || "No description added.",
    }

    if (!newProduct.name || !newProduct.category || Number.isNaN(newProduct.price) || Number.isNaN(newProduct.stock)) {
      toast.error("Please fill product name, category, price, and stock.")
      return
    }

    setIsSubmitting(true)
    try {
      // Check session before adding
      const { data: session } = await authClient.getSession()
      if (!session) {
        toast.error('Please log in to add products')
        router.push('/login')
        return
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.')
          router.push('/login')
          return
        }
        const error = await response.json()
        throw new Error(error.error || 'Failed to add product')
      }

      const addedProduct = await response.json()
      setProducts([addedProduct, ...products])
      setForm(blankProduct)
      toast.success("Product added successfully")
    } catch (error) {
      console.error('Error adding product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add product')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product)
    setEditForm(productToForm(product))
  }

  const updateProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!editingProduct) return

    const nextProduct = {
      name: editForm.name.trim(),
      category: editForm.category.trim(),
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      status: editForm.status,
      description: editForm.description.trim() || "No description added.",
    }

    if (!nextProduct.name || !nextProduct.category || Number.isNaN(nextProduct.price) || Number.isNaN(nextProduct.stock)) {
      toast.error("Please fill product name, category, price, and stock.")
      return
    }

    setIsUpdating(true)
    try {
      const { data: session } = await authClient.getSession()
      if (!session) {
        toast.error('Please log in to edit products')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      )
      setSelectedProduct((currentProduct) =>
        currentProduct?.id === updatedProduct.id ? updatedProduct : currentProduct
      )
      setEditingProduct(null)
      toast.success("Product updated successfully")
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsUpdating(false)
    }
  }

  const deleteProduct = async (productId: string) => {
    setIsDeleting(true)
    try {
      // Check session before deleting
      const { data: session } = await authClient.getSession()
      if (!session) {
        toast.error('Please log in to delete products')
        router.push('/login')
        return
      }

      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
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
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      )
      setSelectedProduct((currentProduct) =>
        currentProduct?.id === productId ? null : currentProduct
      )
      setProductToDelete(null)
      toast.success("Product deleted successfully")
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const statusBadgeClass = (status: ProductStatus) => {
    if (status === "Low Stock") return "border-red-500/30 bg-red-500/10 text-red-300"
    if (status === "Draft") return "border-white/20 bg-white/5 text-white/70"
    return "border-blue-400/30 bg-blue-500/15 text-blue-200"
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-950">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-white/60">Loading products...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">Product Admin</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Products
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/60">
              Add products, view details, and manage your product catalog.
            </p>
          </div>
          <Button asChild variant="outline" className="border-white/10 bg-slate-900/60 text-white hover:bg-blue-600/20 hover:text-blue-100">
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(320px,380px)_1fr]">
          <Card className={panelClass}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <PackagePlus className="h-5 w-5 text-blue-300" />
                Add Product
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addProduct} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className={labelClass}>Product Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="Enter product name"
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className={labelClass}>Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                    placeholder="Electronics, Fashion..."
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="price" className={labelClass}>Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) => setForm({ ...form, price: event.target.value })}
                      placeholder="0.00"
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock" className={labelClass}>Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(event) => setForm({ ...form, stock: event.target.value })}
                      placeholder="0"
                      disabled={isSubmitting}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className={labelClass}>Status</Label>
                  <Select
                    value={form.status}
                    onValueChange={(value: ProductStatus) => setForm({ ...form, status: value })}
                    disabled={isSubmitting}
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
                  <Label htmlFor="description" className={labelClass}>Description</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    placeholder="Short product details"
                    rows={4}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
                <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="mr-2 h-4 w-4" />
                  )}
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className={panelClass}>
            <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-white">Product List</CardTitle>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search products..."
                  className={`${inputClass} pl-9`}
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              <Table className="min-w-[760px]">
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-white/60">Product</TableHead>
                    <TableHead className="text-white/60">Category</TableHead>
                    <TableHead className="text-white/60">Status</TableHead>
                    <TableHead className="text-white/60">Stock</TableHead>
                    <TableHead className="text-right text-white/60">Price</TableHead>
                    <TableHead className="w-36 text-right text-white/60">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-white/10 hover:bg-white/5">
                      <TableCell>
                        <div className="font-medium text-white">{product.name}</div>
                        <div className="max-w-72 truncate text-xs text-white/45">{product.id}</div>
                      </TableCell>
                      <TableCell className="text-white/80">{product.category}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusBadgeClass(product.status)}>{product.status}</Badge>
                      </TableCell>
                      <TableCell className="text-white/80">{product.stock}</TableCell>
                      <TableCell className="text-right font-medium text-white">
                        {currency.format(product.price)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-white/70 hover:bg-blue-500/10 hover:text-blue-200"
                              aria-label={`View ${product.name}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="text-white/70 hover:bg-blue-500/10 hover:text-blue-200"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setProductToDelete(product)}
                            className="text-red-300 hover:bg-red-500/10 hover:text-red-200"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableCell colSpan={6} className="h-32 text-center text-white/50">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </div>

      <Dialog open={Boolean(selectedProduct)} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="border-white/10 bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{selectedProduct?.name}</DialogTitle>
            <DialogDescription className="break-all text-white/55">{selectedProduct?.id}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-md border border-white/10 bg-slate-950/50 p-3">
                  <p className="text-white/50">Category</p>
                  <p className="mt-1 font-medium text-white">{selectedProduct.category}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-slate-950/50 p-3">
                  <p className="text-white/50">Status</p>
                  <Badge className={`mt-1 ${statusBadgeClass(selectedProduct.status)}`} variant="outline">
                    {selectedProduct.status}
                  </Badge>
                </div>
                <div className="rounded-md border border-white/10 bg-slate-950/50 p-3">
                  <p className="text-white/50">Price</p>
                  <p className="mt-1 font-medium text-white">{currency.format(selectedProduct.price)}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-slate-950/50 p-3">
                  <p className="text-white/50">Stock</p>
                  <p className="mt-1 font-medium text-white">{selectedProduct.stock} units</p>
                </div>
              </div>
              <div className="rounded-md border border-white/10 bg-slate-950/50 p-3 text-sm">
                <p className="text-white/50">Description</p>
                <p className="mt-1 leading-6 text-white/80">{selectedProduct.description}</p>
              </div>
            </div>
          )}
          <DialogFooter className="border-white/10 bg-slate-950/70">
            {selectedProduct && (
              <>
                <Button
                  variant="outline"
                  className="border-white/10 bg-slate-900 text-white hover:bg-blue-500/10 hover:text-blue-100"
                  onClick={() => {
                    openEditDialog(selectedProduct)
                    setSelectedProduct(null)
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Product
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
                  onClick={() => {
                    setProductToDelete(selectedProduct)
                    setSelectedProduct(null)
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Product
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open && !isUpdating) {
            setEditingProduct(null)
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
                <Label htmlFor="edit-name" className={labelClass}>Product Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                  placeholder="Enter product name"
                  disabled={isUpdating}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category" className={labelClass}>Category</Label>
                <Input
                  id="edit-category"
                  value={editForm.category}
                  onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                  placeholder="Electronics, Fashion..."
                  disabled={isUpdating}
                  className={inputClass}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="edit-price" className={labelClass}>Price</Label>
                  <Input
                    id="edit-price"
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
                  <Label htmlFor="edit-stock" className={labelClass}>Stock</Label>
                  <Input
                    id="edit-stock"
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
                <Label htmlFor="edit-description" className={labelClass}>Description</Label>
                <Textarea
                  id="edit-description"
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
                onClick={() => setEditingProduct(null)}
                disabled={isUpdating}
                className="border-white/10 bg-slate-900 text-white hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(productToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setProductToDelete(null)
          }
        }}
      >
        <AlertDialogContent className="border-white/10 bg-slate-900 text-white">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-white">Delete product?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to delete {productToDelete ? `"${productToDelete.name}"` : "this product"}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="border-white/10 bg-slate-950/70">
            <AlertDialogCancel
              disabled={isDeleting}
              className="border-white/10 bg-slate-900 text-white hover:bg-white/10 hover:text-white"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              className="bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:text-red-200"
              onClick={(event) => {
                event.preventDefault()
                if (productToDelete) {
                  void deleteProduct(productToDelete.id)
                }
              }}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {isDeleting ? "Deleting..." : "Delete Product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
