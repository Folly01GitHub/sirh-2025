
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page non trouvée</p>
      <Button asChild>
        <Link to="/">Retour à l'accueil</Link>
      </Button>
    </div>
  )
}

export default NotFound
