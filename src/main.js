import { layoutWithLines, prepareWithSegments } from '@chenglou/pretext'
import './styles.css'

const quotes = [
  'You make the ordinary feel worth remembering.',
  'I love how easy the world feels beside you.',
  'Thank you for being my favorite part of every plan.',
  'I notice all the little ways you care. I love every one.',
  'With you, even doing nothing feels like something.'
]

const flowerSpecs = [
  { x: -1, size: 84, height: 270, delay: 0.05, tilt: -5, depth: 'back' },
  { x: 7, size: 122, height: 350, delay: 0.32, tilt: 4, depth: 'front' },
  { x: 20, size: 73, height: 235, delay: 0.18, tilt: -4, depth: 'back' },
  { x: 31, size: 104, height: 296, delay: 0.48, tilt: 3, depth: 'front' },
  { x: 46, size: 66, height: 220, delay: 0.65, tilt: -6, depth: 'back' },
  { x: 57, size: 138, height: 372, delay: 0.22, tilt: 4, depth: 'front' },
  { x: 73, size: 78, height: 258, delay: 0.7, tilt: -3, depth: 'back' },
  { x: 82, size: 111, height: 320, delay: 0.4, tilt: 5, depth: 'front' },
  { x: 95, size: 92, height: 286, delay: 0.58, tilt: -5, depth: 'back' }
]

const scene = document.querySelector('#scene')
const flowerField = document.querySelector('#flower-field')
const canvas = document.querySelector('#quote-canvas')
const quoteLive = document.querySelector('#quote-live')
const quoteCount = document.querySelector('#quote-count')
const quoteTotal = document.querySelector('#quote-total')
const quoteDots = document.querySelector('#quote-dots')
const bloomButton = document.querySelector('#bloom-button')
const petalLayer = document.querySelector('#petal-layer')
const ctx = canvas.getContext('2d')
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

let canvasWidth = 0
let canvasHeight = 0
let layouts = []
let currentQuote = 0
let quoteStartedAt = performance.now()
let animationFrame = null

quoteTotal.textContent = String(quotes.length).padStart(2, '0')

function createFlower(spec, flowerIndex) {
  const flower = document.createElement('div')
  flower.className = `flower flower-${spec.depth}`
  flower.style.setProperty('--x', `${spec.x}%`)
  flower.style.setProperty('--size', `${spec.size}px`)
  flower.style.setProperty('--height', `${spec.height}px`)
  flower.style.setProperty('--delay', `${spec.delay}s`)
  flower.style.setProperty('--tilt', `${spec.tilt}deg`)
  flower.style.setProperty('--sway-speed', `${4.8 + (flowerIndex % 4) * 0.65}s`)

  const stem = document.createElement('div')
  stem.className = 'stem'

  const leftLeaf = document.createElement('span')
  leftLeaf.className = 'leaf leaf-left'
  leftLeaf.style.setProperty('--leaf-top', `${46 + (flowerIndex % 3) * 8}%`)

  const rightLeaf = document.createElement('span')
  rightLeaf.className = 'leaf leaf-right'
  rightLeaf.style.setProperty('--leaf-top', `${63 + (flowerIndex % 2) * 7}%`)

  stem.append(leftLeaf, rightLeaf)

  const head = document.createElement('div')
  head.className = 'flower-head'

  for (let i = 0; i < 20; i += 1) {
    const petal = document.createElement('span')
    petal.className = 'petal petal-outer'
    petal.style.setProperty('--i', i)
    petal.style.setProperty('--petal-delay', `${spec.delay + i * 0.022}s`)
    head.append(petal)
  }

  for (let i = 0; i < 16; i += 1) {
    const petal = document.createElement('span')
    petal.className = 'petal petal-inner'
    petal.style.setProperty('--i', i)
    petal.style.setProperty('--petal-delay', `${spec.delay + 0.16 + i * 0.018}s`)
    head.append(petal)
  }

  const center = document.createElement('span')
  center.className = 'flower-center'
  head.append(center)
  flower.append(stem, head)
  flowerField.append(flower)
}

flowerSpecs.forEach(createFlower)

quotes.forEach((quote, index) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'quote-dot'
  button.setAttribute('aria-label', `Show note ${index + 1}: ${quote}`)
  button.addEventListener('click', () => setQuote(index, true))
  quoteDots.append(button)
})

function rebuildTextLayouts() {
  const rect = canvas.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvasWidth = Math.max(1, rect.width)
  canvasHeight = Math.max(1, rect.height)
  canvas.width = Math.round(canvasWidth * dpr)
  canvas.height = Math.round(canvasHeight * dpr)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const fontSize = canvasWidth < 330 ? 28 : canvasWidth < 420 ? 34 : 40
  const lineHeight = Math.round(fontSize * 1.08)
  const font = `italic 700 ${fontSize}px Georgia`
  const maxWidth = Math.max(140, canvasWidth - 54)

  layouts = quotes.map((quote) => {
    const prepared = prepareWithSegments(quote, font)
    const measured = layoutWithLines(prepared, maxWidth, lineHeight)
    return {
      ...measured,
      font,
      fontSize,
      lineHeight
    }
  })

  drawFrame(performance.now())
}

function drawQuote(index, alpha, now, phase, verticalOffset = 0) {
  const layout = layouts[index]
  if (!layout || alpha <= 0) return

  const time = now * 0.001
  const totalHeight = layout.lines.length * layout.lineHeight
  const startY = (canvasHeight - totalHeight) / 2 + layout.lineHeight * 0.76 + verticalOffset

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#dca817'
  ctx.font = '700 84px Georgia'
  ctx.fillText('“', 8 + Math.sin(time * 0.45 + phase) * 2, 72)

  ctx.fillStyle = '#1c2a1d'
  ctx.font = layout.font
  ctx.textBaseline = 'alphabetic'

  layout.lines.forEach((line, lineIndex) => {
    const driftX = reduceMotion ? 0 : Math.sin(time * 0.72 + lineIndex * 1.9 + phase) * (4 + lineIndex)
    const driftY = reduceMotion ? 0 : Math.cos(time * 0.54 + lineIndex * 1.37 + phase) * 2.5
    const angle = reduceMotion ? 0 : Math.sin(time * 0.36 + lineIndex + phase) * 0.006
    const x = 28 + driftX
    const y = startY + lineIndex * layout.lineHeight + driftY

    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.fillText(line.text, 0, 0)
    ctx.restore()
  })

  ctx.restore()
}

function drawFrame(now) {
  if (!layouts.length) return

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  if (reduceMotion) {
    drawQuote(currentQuote, 1, now, currentQuote)
    return
  }

  const duration = 6100
  const fadeDuration = 850
  const elapsed = now - quoteStartedAt

  if (elapsed >= duration) {
    currentQuote = (currentQuote + 1) % quotes.length
    quoteStartedAt = now
    syncQuoteUi()
  }

  const frameElapsed = now - quoteStartedAt
  const fade = Math.max(0, Math.min(1, (frameElapsed - (duration - fadeDuration)) / fadeDuration))
  const easedFade = fade * fade * (3 - 2 * fade)
  const nextQuote = (currentQuote + 1) % quotes.length

  drawQuote(currentQuote, 1 - easedFade, now, currentQuote, -easedFade * 14)
  drawQuote(nextQuote, easedFade, now, nextQuote, (1 - easedFade) * 18)
  animationFrame = requestAnimationFrame(drawFrame)
}

function syncQuoteUi() {
  quoteCount.textContent = String(currentQuote + 1).padStart(2, '0')
  quoteLive.textContent = quotes[currentQuote]
  quoteDots.querySelectorAll('.quote-dot').forEach((dot, index) => {
    dot.classList.toggle('is-active', index === currentQuote)
    dot.setAttribute('aria-pressed', String(index === currentQuote))
  })
}

function setQuote(index, fromInteraction = false) {
  currentQuote = index
  quoteStartedAt = performance.now()
  syncQuoteUi()
  drawFrame(performance.now())
  if (fromInteraction && !reduceMotion) burstPetals(12)
}

function replayBloom() {
  scene.classList.remove('is-reblooming')
  void scene.offsetWidth
  scene.classList.add('is-reblooming')
}

function burstPetals(amount = 30) {
  if (reduceMotion) return

  const origin = bloomButton.getBoundingClientRect()
  const originX = origin.left + origin.width / 2
  const originY = origin.top + origin.height / 2

  for (let i = 0; i < amount; i += 1) {
    const petal = document.createElement('span')
    const angle = (Math.PI * 2 * i) / amount + Math.random() * 0.35
    const distance = 80 + Math.random() * Math.min(window.innerWidth * 0.34, 330)
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance - Math.random() * 65

    petal.className = 'loose-petal'
    petal.style.left = `${originX}px`
    petal.style.top = `${originY}px`
    petal.style.setProperty('--burst-x', `${x}px`)
    petal.style.setProperty('--burst-y', `${y}px`)
    petal.style.setProperty('--burst-r', `${(Math.random() - 0.5) * 760}deg`)
    petal.style.setProperty('--burst-delay', `${Math.random() * 0.12}s`)
    petal.style.setProperty('--petal-color', i % 3 === 0 ? '#ffcf38' : '#e8a914')
    petal.addEventListener('animationend', () => petal.remove(), { once: true })
    petalLayer.append(petal)
  }
}

bloomButton.addEventListener('click', () => {
  replayBloom()
  burstPetals()
  setQuote((currentQuote + 1) % quotes.length)
})

if (!reduceMotion) {
  scene.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 2
    const y = (event.clientY / window.innerHeight - 0.5) * 2
    scene.style.setProperty('--mouse-x', x.toFixed(3))
    scene.style.setProperty('--mouse-y', y.toFixed(3))
  })
}

const resizeObserver = new ResizeObserver(rebuildTextLayouts)
resizeObserver.observe(canvas)

syncQuoteUi()
rebuildTextLayouts()

if (!reduceMotion) {
  cancelAnimationFrame(animationFrame)
  animationFrame = requestAnimationFrame(drawFrame)
}
