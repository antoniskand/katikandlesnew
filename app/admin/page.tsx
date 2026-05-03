// app/admin/page.tsx
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"

// ─── SUPABASE AUTH ─────────────────────────────────

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─── TYPES ─────────────────────────────────────────

interface ProductImage { url: string; alt?: string }
interface Product {
  id: string; name: string; slug: string; description?: string
  price: number; sale_price?: number | null; currency: string
  images: ProductImage[]; stock_status: string; stock_level: number
  active: boolean; attributes: Record<string, unknown>; sort_order: number
  product_categories?: { category_id: string; categories: Category }[]
  product_variants?: Variant[]
}
interface Category { id: string; name: string; slug: string; description?: string; sort_order: number }
interface Coupon {
  id: string; code: string; name?: string; discount_type: string
  discount_amount?: number; discount_percent?: number
  min_order_amount?: number; max_uses?: number; times_used: number
  active: boolean; expires_at?: string
}
interface Order {
  id: string; order_number: string; status: string; payment_status: string
  customer_email?: string; customer_first_name?: string; customer_last_name?: string
  grand_total: number; created_at: string; items?: OrderItem[]
}
interface OrderItem {
  id: string; product_name: string; product_image_url?: string
  price: number; quantity: number; line_total: number
}
interface PageData { id: string; name: string; slug: string; content?: string; meta_description?: string; active: boolean }
interface Variant { id?: string; name: string; price?: number | null; stock_level: number; active: boolean }

type Tab = "products" | "orders" | "carts" | "coupons" | "categories" | "pages"

// ─── MAIN COMPONENT ────────────────────────────────

export default function AdminPanel() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [tab, setTab] = useState<Tab>("products")

  // Check auth on mount
  useEffect(() => {
    const supabase = getSupabaseClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? { email: session.user.email || "" } : null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email || "" } : null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    const supabase = getSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword(loginForm)
    if (error) setLoginError(error.message)
  }

  const handleLogout = async () => {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin h-8 w-8 border-2 border-gray-900 border-t-transparent rounded-full" /></div>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" placeholder="Email" value={loginForm.email}
              onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" required />
            <input type="password" placeholder="Password" value={loginForm.password}
              onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-transparent" required />
            {loginError && <p className="text-red-600 text-sm">{loginError}</p>}
            <button type="submit" className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition">Login</button>
          </form>
        </div>
    </div>
  )
}

// ─── CARTS SECTION ─────────────────────────────────

function CartsSection() {
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("")

  useEffect(() => {
    const url = filter ? `/api/admin/carts?status=${filter}` : "/api/admin/carts"
    fetch(url).then(r => r.json()).then(data => {
      setCarts(data.results || [])
      setLoading(false)
    })
  }, [filter])

  const statusColors: Record<string, string> = {
    active: "bg-blue-100 text-blue-800",
    abandoned: "bg-yellow-100 text-yellow-800",
    converted: "bg-green-100 text-green-800",
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} λεπτά πριν`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} ώρες πριν`
    return date.toLocaleDateString("el-GR")
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Καλάθια ({carts.length})</h2>
        <div className="flex gap-2">
          {["", "active", "abandoned", "converted"].map(s => (
            <button key={s} onClick={() => { setFilter(s); setLoading(true) }}
              className={`px-3 py-1 rounded-full text-xs border ${filter === s ? "bg-black text-white border-black" : "border-gray-300"}`}>
              {s || "Όλα"}
            </button>
          ))}
        </div>
      </div>

      {loading ? <p>Loading...</p> : carts.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Δεν υπάρχουν καλάθια</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Πελάτης</th>
                <th className="text-left px-4 py-3">Προϊόντα</th>
                <th className="text-left px-4 py-3">Σύνολο</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Τελευταία Δραστηριότητα</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {carts.map(cart => (
                <tr key={cart.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {cart.customer_email || cart.customer_name || <span className="text-gray-400">Ανώνυμος</span>}
                  </td>
                  <td className="px-4 py-3">
                    {cart.item_quantity} αντικείμενα
                    <div className="text-xs text-gray-500 mt-1">
                      {(cart.items || []).slice(0, 3).map((item: any, i: number) => (
                        <span key={i}>{item.product_name || "Product"}{i < Math.min(cart.items.length, 3) - 1 ? ", " : ""}</span>
                      ))}
                      {cart.items?.length > 3 && <span> +{cart.items.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">€{Number(cart.subtotal || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[cart.status] || "bg-gray-100"}`}>
                      {cart.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(cart.last_activity || cart.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

  const tabs: { key: Tab; label: string }[] = [
    { key: "products", label: "Προϊόντα" },
    { key: "orders", label: "Παραγγελίες" },
    { key: "carts", label: "Καλάθια" },
    { key: "coupons", label: "Κουπόνια" },
    { key: "categories", label: "Κατηγορίες" },
    { key: "pages", label: "Σελίδες" },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r min-h-screen p-4 flex flex-col">
        <h1 className="text-lg font-bold mb-6 px-2">Kati Kandles Admin</h1>
        <nav className="space-y-1 flex-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${tab === t.key ? "bg-black text-white" : "hover:bg-gray-100"}`}>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="border-t pt-4 mt-4">
          <p className="text-xs text-gray-500 mb-2 truncate px-2">{user.email}</p>
          <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition">Logout</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {tab === "products" && <ProductsSection />}
        {tab === "orders" && <OrdersSection />}
        {tab === "carts" && <CartsSection />}
        {tab === "coupons" && <CouponsSection />}
        {tab === "categories" && <CategoriesSection />}
        {tab === "pages" && <PagesSection />}
      </main>
    </div>
  )
}

// ─── IMAGE UPLOAD COMPONENT ────────────────────────

function ImageUpload({ images, onChange }: { images: ProductImage[]; onChange: (imgs: ProductImage[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)

    try {
      const newImages = [...images]
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
        const data = await res.json()
        if (data.success) {
          newImages.push({ url: data.url, alt: file.name })
        }
      }
      onChange(newImages)
    } catch (err) {
      console.error("Upload error:", err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= images.length) return
    const arr = [...images]
    ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
    onChange(arr)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Εικόνες</label>
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map((img, i) => (
          <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border bg-gray-100">
            <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
              {i > 0 && <button onClick={() => moveImage(i, -1)} className="text-white text-xs bg-black/50 rounded px-1">←</button>}
              <button onClick={() => removeImage(i)} className="text-white text-xs bg-red-600 rounded px-1">✕</button>
              {i < images.length - 1 && <button onClick={() => moveImage(i, 1)} className="text-white text-xs bg-black/50 rounded px-1">→</button>}
            </div>
          </div>
        ))}
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition">
          {uploading ? <span className="animate-spin">⏳</span> : "+"}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
    </div>
  )
}

// ─── PRODUCTS SECTION ──────────────────────────────

function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Product | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [pRes, cRes] = await Promise.all([
      fetch("/api/admin/products").then(r => r.json()),
      fetch("/api/admin/categories").then(r => r.json()),
    ])
    setProducts(pRes.results || [])
    setCategories(Array.isArray(cRes) ? cRes : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleNew = () => {
    setIsNew(true)
    setEditing({
      id: "", name: "", slug: "", description: "", price: 0, sale_price: null,
      currency: "EUR", images: [], stock_status: "in_stock", stock_level: 0,
      active: true, attributes: {}, sort_order: 0, product_categories: [], product_variants: [],
    })
  }

  const handleSave = async (product: Product, selectedCategoryIds: string[]) => {
    const isCreate = !product.id || isNew
    const url = isCreate ? "/api/admin/products" : `/api/admin/products/${product.id}`
    const method = isCreate ? "POST" : "PUT"

    const body = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      currency: product.currency,
      images: product.images,
      stock_status: product.stock_status,
      stock_level: product.stock_level,
      active: product.active,
      attributes: product.attributes,
      sort_order: product.sort_order,
      categories: selectedCategoryIds,
      variants: product.product_variants || [],
    }

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) {
      setEditing(null)
      setIsNew(false)
      fetchData()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Σίγουρα θέλεις να διαγράψεις αυτό το προϊόν;")) return
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
    fetchData()
  }

  if (editing) {
    return <ProductForm product={editing} categories={categories} onSave={handleSave}
      onCancel={() => { setEditing(null); setIsNew(false) }} isNew={isNew} />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Προϊόντα ({products.length})</h2>
        <button onClick={handleNew} className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">+ Νέο Προϊόν</button>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Εικόνα</th>
                <th className="text-left px-4 py-3">Όνομα</th>
                <th className="text-left px-4 py-3">Τιμή</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt="" className="w-12 h-12 rounded object-cover" />
                    ) : <div className="w-12 h-12 rounded bg-gray-200" />}
                  </td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">€{Number(p.price).toFixed(2)}{p.sale_price ? <span className="text-green-600 ml-1">€{Number(p.sale_price).toFixed(2)}</span> : ""}</td>
                  <td className="px-4 py-3">{p.stock_level}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${p.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => { setEditing(p); setIsNew(false) }} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── PRODUCT FORM ──────────────────────────────────

function ProductForm({ product, categories, onSave, onCancel, isNew }: {
  product: Product; categories: Category[]
  onSave: (p: Product, cats: string[]) => void; onCancel: () => void; isNew: boolean
}) {
  const [form, setForm] = useState(product)
  const [selectedCats, setSelectedCats] = useState<string[]>(
    product.product_categories?.map(pc => pc.category_id || pc.categories?.id) || []
  )
  const [saving, setSaving] = useState(false)

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    await onSave(form, selectedCats)
    setSaving(false)
  }

  const toggleCat = (catId: string) => {
    setSelectedCats(prev => prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId])
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{isNew ? "Νέο Προϊόν" : `Edit: ${product.name}`}</h2>
        <button type="button" onClick={onCancel} className="text-gray-500 hover:text-black">✕ Cancel</button>
      </div>

      <div className="space-y-6 bg-white p-6 rounded-xl border">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Όνομα *</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} required
            className="w-full px-3 py-2 border rounded-lg" />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input value={form.slug} onChange={e => set("slug", e.target.value)}
            placeholder="auto-generated if empty"
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Περιγραφή (HTML)</label>
          <textarea value={form.description || ""} onChange={e => set("description", e.target.value)}
            rows={5} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Τιμή (€) *</label>
            <input type="number" step="0.01" value={form.price} onChange={e => set("price", parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Τιμή Προσφοράς (€)</label>
            <input type="number" step="0.01" value={form.sale_price || ""} onChange={e => set("sale_price", e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stock Level</label>
            <input type="number" value={form.stock_level} onChange={e => set("stock_level", parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock Status</label>
            <select value={form.stock_status} onChange={e => set("stock_status", e.target.value)}
              className="w-full px-3 py-2 border rounded-lg">
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="low_stock">Low Stock</option>
            </select>
          </div>
        </div>

        {/* Images */}
        <ImageUpload images={form.images || []} onChange={(imgs) => set("images", imgs)} />

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2">Κατηγορίες</label>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button key={cat.id} type="button" onClick={() => toggleCat(cat.id)}
                className={`px-3 py-1 rounded-full text-sm border transition ${selectedCats.includes(cat.id) ? "bg-black text-white border-black" : "border-gray-300 hover:border-gray-500"}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Active */}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" checked={form.active} onChange={e => set("active", e.target.checked)} />
          <label htmlFor="active" className="text-sm">Ενεργό (εμφανίζεται στο eshop)</label>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium mb-1">Sort Order</label>
          <input type="number" value={form.sort_order} onChange={e => set("sort_order", parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg" />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50">
            {saving ? "Saving..." : isNew ? "Δημιουργία" : "Αποθήκευση"}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Ακύρωση</button>
        </div>
      </div>
    </form>
  )
}

// ─── ORDERS SECTION ────────────────────────────────

function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    fetch("/api/admin/orders").then(r => r.json()).then(data => {
      setOrders(data.results || [])
      setLoading(false)
    })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    payment_pending: "bg-orange-100 text-orange-800",
    paid: "bg-green-100 text-green-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-200 text-green-900",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Παραγγελίες ({orders.length})</h2>
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">#</th>
                <th className="text-left px-4 py-3">Πελάτης</th>
                <th className="text-left px-4 py-3">Σύνολο</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Πληρωμή</th>
                <th className="text-left px-4 py-3">Ημ/νία</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{o.order_number}</td>
                  <td className="px-4 py-3">{o.customer_first_name} {o.customer_last_name}<br /><span className="text-gray-500 text-xs">{o.customer_email}</span></td>
                  <td className="px-4 py-3 font-medium">€{Number(o.grand_total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium ${statusColors[o.status] || "bg-gray-100"}`}>
                      {["pending","payment_pending","paid","processing","shipped","delivered","cancelled","refunded"].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${o.payment_status === "completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{o.payment_status}</span></td>
                  <td className="px-4 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString("el-GR")}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedOrder(selectedOrder?.id === o.id ? null : o)} className="text-blue-600 hover:underline text-xs">
                      {selectedOrder?.id === o.id ? "Close" : "Details"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="mt-4 bg-white rounded-xl border p-6">
          <h3 className="font-bold mb-4">Παραγγελία {selectedOrder.order_number}</h3>
          {selectedOrder.items?.map(item => (
            <div key={item.id} className="flex items-center gap-3 py-2 border-b last:border-0">
              {item.product_image_url && <img src={item.product_image_url} alt="" className="w-10 h-10 rounded object-cover" />}
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product_name}</p>
                <p className="text-xs text-gray-500">{item.quantity} × €{Number(item.price).toFixed(2)}</p>
              </div>
              <p className="font-medium text-sm">€{Number(item.line_total).toFixed(2)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── COUPONS SECTION ───────────────────────────────

function CouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Coupon> | null>(null)

  const fetchCoupons = useCallback(async () => {
    const data = await fetch("/api/admin/coupons").then(r => r.json())
    setCoupons(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCoupons() }, [fetchCoupons])

  const handleSave = async () => {
    if (!editing) return
    const isCreate = !editing.id
    const method = isCreate ? "POST" : "PUT"
    await fetch("/api/admin/coupons", {
      method, headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    fetchCoupons()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Διαγραφή κουπονιού;")) return
    await fetch("/api/admin/coupons", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchCoupons()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Κουπόνια ({coupons.length})</h2>
        <button onClick={() => setEditing({ code: "", name: "", discount_type: "percent", discount_percent: 10, active: true })}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">+ Νέο Κουπόνι</button>
      </div>

      {editing && (
        <div className="bg-white p-6 rounded-xl border mb-6 max-w-lg space-y-4">
          <input placeholder="Κωδικός (π.χ. SUMMER20)" value={editing.code || ""}
            onChange={e => setEditing(p => ({ ...p, code: e.target.value.toUpperCase() }))}
            className="w-full px-3 py-2 border rounded-lg font-mono" />
          <input placeholder="Όνομα" value={editing.name || ""}
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <select value={editing.discount_type || "percent"}
            onChange={e => setEditing(p => ({ ...p, discount_type: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg">
            <option value="percent">Ποσοστό (%)</option>
            <option value="fixed">Σταθερό ποσό (€)</option>
            <option value="shipping">Δωρεάν μεταφορικά</option>
          </select>
          {editing.discount_type === "percent" && (
            <input type="number" placeholder="Ποσοστό (%)" value={editing.discount_percent || ""}
              onChange={e => setEditing(p => ({ ...p, discount_percent: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border rounded-lg" />
          )}
          {editing.discount_type === "fixed" && (
            <input type="number" step="0.01" placeholder="Ποσό (€)" value={editing.discount_amount || ""}
              onChange={e => setEditing(p => ({ ...p, discount_amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border rounded-lg" />
          )}
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.active !== false}
              onChange={e => setEditing(p => ({ ...p, active: e.target.checked }))} />
            <label className="text-sm">Ενεργό</label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Αποθήκευση</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Ακύρωση</button>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Κωδικός</th>
                <th className="text-left px-4 py-3">Τύπος</th>
                <th className="text-left px-4 py-3">Έκπτωση</th>
                <th className="text-left px-4 py-3">Χρήσεις</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type}</td>
                  <td className="px-4 py-3">{c.discount_type === "percent" ? `${c.discount_percent}%` : c.discount_type === "fixed" ? `€${c.discount_amount}` : "Free shipping"}</td>
                  <td className="px-4 py-3">{c.times_used}{c.max_uses ? `/${c.max_uses}` : ""}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{c.active ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(c)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── CATEGORIES SECTION ────────────────────────────

function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Category> | null>(null)

  const fetchCategories = useCallback(async () => {
    const data = await fetch("/api/admin/categories").then(r => r.json())
    setCategories(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const handleSave = async () => {
    if (!editing) return
    const isCreate = !editing.id
    await fetch("/api/admin/categories", {
      method: isCreate ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Διαγραφή κατηγορίας;")) return
    await fetch("/api/admin/categories", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchCategories()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Κατηγορίες ({categories.length})</h2>
        <button onClick={() => setEditing({ name: "", slug: "", description: "", sort_order: 0 })}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">+ Νέα Κατηγορία</button>
      </div>

      {editing && (
        <div className="bg-white p-6 rounded-xl border mb-6 max-w-lg space-y-4">
          <input placeholder="Όνομα" value={editing.name || ""}
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <input placeholder="Slug" value={editing.slug || ""}
            onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          <input placeholder="Περιγραφή" value={editing.description || ""}
            onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <input type="number" placeholder="Sort Order" value={editing.sort_order || 0}
            onChange={e => setEditing(p => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Αποθήκευση</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Ακύρωση</button>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Όνομα</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Sort</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{c.slug}</td>
                  <td className="px-4 py-3">{c.sort_order}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(c)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── PAGES SECTION ─────────────────────────────────

function PagesSection() {
  const [pages, setPages] = useState<PageData[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<PageData> | null>(null)

  const fetchPages = useCallback(async () => {
    const data = await fetch("/api/admin/pages").then(r => r.json())
    setPages(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  const handleSave = async () => {
    if (!editing) return
    const isCreate = !editing.id
    await fetch("/api/admin/pages", {
      method: isCreate ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    fetchPages()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Διαγραφή σελίδας;")) return
    await fetch("/api/admin/pages", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchPages()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Σελίδες ({pages.length})</h2>
        <button onClick={() => setEditing({ name: "", slug: "", content: "", active: true })}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800">+ Νέα Σελίδα</button>
      </div>

      {editing && (
        <div className="bg-white p-6 rounded-xl border mb-6 max-w-2xl space-y-4">
          <input placeholder="Τίτλος" value={editing.name || ""}
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg" />
          <input placeholder="Slug (π.χ. about-us)" value={editing.slug || ""}
            onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          <textarea placeholder="Περιεχόμενο (HTML)" value={editing.content || ""}
            onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
            rows={12} className="w-full px-3 py-2 border rounded-lg font-mono text-sm" />
          <input placeholder="Meta Description" value={editing.meta_description || ""}
            onChange={e => setEditing(p => ({ ...p, meta_description: e.target.value }))}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={editing.active !== false}
              onChange={e => setEditing(p => ({ ...p, active: e.target.checked }))} />
            <label className="text-sm">Ενεργή</label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-black text-white px-4 py-2 rounded-lg text-sm">Αποθήκευση</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 border rounded-lg text-sm">Ακύρωση</button>
          </div>
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3">Τίτλος</th>
                <th className="text-left px-4 py-3">Slug</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pages.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 font-mono text-gray-500">{p.slug}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${p.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{p.active ? "Active" : "Draft"}</span></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(p)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
