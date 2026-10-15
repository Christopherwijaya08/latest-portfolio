import { Contact } from './components/Contact'
import { Experience } from './components/Experience'
import { Hero } from './components/Hero'
import { Nav } from './components/Nav'
import { Projects } from './components/Projects'
import { Skills } from './components/Skills'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Projects />
        <Experience />
        <Skills />
      </main>
      <Contact />
    </>
  )
}
