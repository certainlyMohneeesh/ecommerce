import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'


export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await api.get(`/products/${id}`)
      setProduct(response.data)
    }
    fetchProduct()
  }, [id])

  if (!product) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img src={product.image} alt={product.name} className="w-full rounded-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold mt-4">${product.price}</p>
          <p className="mt-4">{product.description}</p>
          <Button className="mt-6">Add to Cart</Button>
        </div>
      </div>
    </div>
  )
}
