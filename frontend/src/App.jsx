import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Home from './pages/Home.jsx'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          key="app"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-full"
        >
          <Home />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
