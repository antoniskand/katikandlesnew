export interface CartItemType {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  slug?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  price: number
  description?: string
  images?: Array<{
    file?: {
      url: string
    }
  }>
  stock_level?: number
  active?: boolean
}

export interface CartItem {
  id: string
  product_id: string
  quantity: number
  price: number
  product?: Product
}

export interface Cart {
  id: string
  items: CartItem[]
  item_quantity: number
  sub_total: number
  grand_total: number
}
