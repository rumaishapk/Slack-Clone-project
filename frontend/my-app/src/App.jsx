import { SignedOut, SignInButton, UserButton, SignedIn } from "@clerk/clerk-react";
import React from 'react'

const App = () => {
  return (
    <div>
      <header>
       <SignedOut>
        <SignInButton mode="model" />
       </SignedOut>
       <SignedIn>
        <UserButton />
       </SignedIn>
      </header>
    </div>
  )
}

export default App
