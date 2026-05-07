import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { products } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

// GET all products
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt))
    return NextResponse.json(allProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST create new product
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, category, price, stock, status, description } = body

    // Validate input
    if (!name || !category || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const newProduct = await db.insert(products).values({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      stock: Number(stock),
      status: status || 'Active',
      description: description?.trim() || 'No description added.',
    }).returning()

    return NextResponse.json(newProduct[0], { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}