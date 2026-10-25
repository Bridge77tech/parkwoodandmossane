import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { International } from './components/International'
import { Practice } from './components/Practice'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <Services />
        <International />
        <Practice />
      </main>
      <Footer />
    </>
  )
}
