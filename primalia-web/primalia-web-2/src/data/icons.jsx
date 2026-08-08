import {
  ShoppingCart, Coffee, Utensils, Ticket, Car, HeartPulse, Home as HomeIcon,
  Shirt, Repeat, Package, ArrowLeftRight, CreditCard, Wifi, Plane, FileText,
  MoreHorizontal
} from 'lucide-react'

const MAPA_ICONOS = {
  cart: ShoppingCart,
  cup: Coffee,
  fork: Utensils,
  ticket: Ticket,
  car: Car,
  health: HeartPulse,
  home: HomeIcon,
  shirt: Shirt,
  repeat: Repeat,
  grid: Package,
  transfer: ArrowLeftRight,
  card: CreditCard,
  wifi: Wifi,
  plane: Plane,
  file: FileText,
  more: MoreHorizontal
}

export function CategoriaIcon({ icono, size = 18, ...props }) {
  const Icono = MAPA_ICONOS[icono] || Package
  return <Icono size={size} {...props} />
}
