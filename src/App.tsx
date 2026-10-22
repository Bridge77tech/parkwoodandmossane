import { Navigation } from './components/Navigation'
import { Screens } from './components/Screens'
import { Hero } from './components/Hero'
import { Services } from './components/Services'
import { International } from './components/International'
import { Practice } from './components/Practice'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <>
      <Navigation />
      <Screens>
        <Hero>
          <Services />
        </Hero>
        <International />
        <Practice />
        <Footer />
      </Screens>
    </>
  )
}
