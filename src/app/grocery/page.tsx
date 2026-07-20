import { GroceryList } from '@/components/grocery-list'
import { getDemoPlan } from '@/lib/demo-data'

export default function GroceryPage() {
  return <GroceryList meals={getDemoPlan()} />
}
