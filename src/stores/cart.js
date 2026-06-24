// stores/cart.js
import { defineStore } from 'pinia'

const STORAGE_KEY = 'plantable-cart'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadFromStorage(), // [{ plant: {...}, quantity: number }]
  }),

  getters: {
    totalItems(state) {
      return state.items.reduce((sum, item) => sum + item.quantity, 0)
    },
    totalPrice(state) {
      return state.items.reduce((sum, item) => sum + (item.plant.price ?? 0) * item.quantity, 0)
    },
    isEmpty(state) {
      return state.items.length === 0
    },
  },

  actions: {
    addItem(plant, quantity = 1) {
      const existing = this.items.find(i => i.plant.id === plant.id)
      if (existing) {
        existing.quantity += quantity
      } else {
        this.items.push({ plant, quantity })
      }
      this.persist()
    },

    removeItem(plantId) {
      this.items = this.items.filter(i => i.plant.id !== plantId)
      this.persist()
    },

    updateQuantity(plantId, quantity) {
      const item = this.items.find(i => i.plant.id === plantId)
      if (!item) return
      if (quantity <= 0) {
        this.removeItem(plantId)
        return
      }
      item.quantity = quantity
      this.persist()
    },

    clear() {
      this.items = []
      this.persist()
    },

    persist() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },
  },
})