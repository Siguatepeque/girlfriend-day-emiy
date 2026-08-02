import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import './styles.css'

const LETTER = `My dearest Emiy—Some people arrive like weather. You arrived like a season I did not know I had been waiting for: warm at the edges, full of small signs, making ordinary rooms feel newly lit.

I love the easy things first. Your laugh when you forget to be careful with it. The face you make when you are concentrating. The way a quiet moment beside you does not ask to be filled. I love how a day becomes more itself after I have told you about it.

There is a sunflower habit I think we share. They do not chase every light. They choose one, turn toward it, and keep turning as the hours change. Loving you feels less like being struck by lightning and more like learning that faithful motion: again, gently, toward you.

Thank you for the softness you protect in a loud world. Thank you for every kindness that nobody applauds, for your patience, for your mischief, for the thousand tiny ways you make care feel practical. You make affection feel less like a grand speech and more like water placed beside the bed.

If this were a proper old tale, I would promise kingdoms. I would cross the briar wood, bargain with the moon, and return with a sword that sings your name. But I like our smaller magic better: shared jokes, familiar silences, a hand finding another hand without looking.

You are not precious because you are perfect. You are precious because you are particular. There is only one exact way you notice things, one exact cadence to your joy, one exact person I mean when I say that the world is better with you in it.

So let this page grow unruly for you. Let the flowers interrupt the sentences. Let the moth misplace a word. Let every line make room for something alive. That is what love has done to my life: not emptied it into neatness, but filled it so completely that everything else learned how to move around you.

Happy Girlfriend Day, Emiy. I hope you always know that you are seen, chosen, appreciated, and loved—not just in the bright scenes, but in all the ordinary paragraphs between them. Yours, in every season.`

const FONT_STACK = 'Georgia, "Times New Roman", serif'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function ellipseInterval(shape, bandTop, bandBottom, padding = 8) {
  const rx = shape.rx + padding
  const ry = shape.ry + padding
  const bandCenter = (bandTop + bandBottom) / 2
  const bandHalf = (bandBottom - bandTop) / 2
  const nearestY = Math.max(0, Math.abs(shape.y - bandCenter) - bandHalf)
  if (nearestY >= ry) return null
  const extent = rx * Math.sqrt(1 - (nearestY * nearestY) / (ry * ry))
  return { left: shape.x - extent, right: shape.x + extent }
}

function carve(slots, block) {
  const result = []
  for (const slot of slots) {
    if (block.right <= slot.left || block.left >= slot.right) {
      result.push(slot)
      continue
    }
    if (block.left > slot.left) result.push({ left: slot.left, right: block.left })
    if (block.right < slot.right) result.push({ left: block.right, right: slot.right })
  }
  return result
}

function drawPaper(ctx, width, height, time) {
  ctx.fillStyle = '#eee3c5'
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(width * .48, height * .35, 20, width * .48, height * .35, width * .7)
  glow.addColorStop(0, 'rgba(255,252,226,.78)')
  glow.addColorStop(1, 'rgba(126,84,31,.08)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.globalAlpha = .055
  for (let y = 0; y < height; y += 7) {
    const wobble = Math.sin(y * .13 + time * .00005) * 2
    ctx.fillStyle = y % 21 === 0 ? '#6e4527' : '#b6915b'
    ctx.fillRect(wobble, y, width, .55)
  }
  ctx.restore()

  ctx.strokeStyle = '#8c3b2c'
  ctx.lineWidth = 1.35
  ctx.strokeRect(20, 20, width - 40, height - 40)
  ctx.strokeStyle = 'rgba(164,106,30,.8)'
  ctx.lineWidth = .8
  ctx.strokeRect(27, 27, width - 54, height - 54)

  ctx.fillStyle = '#9a3d2d'
  ctx.font = '26px Georgia'
  ctx.fillText('❦', 23, 43)
  ctx.save(); ctx.translate(width - 23, 43); ctx.scale(-1, 1); ctx.fillText('❦', 0, 0); ctx.restore()
  ctx.save(); ctx.translate(23, height - 25); ctx.scale(1, -1); ctx.fillText('❦', 0, 0); ctx.restore()
  ctx.save(); ctx.translate(width - 23, height - 25); ctx.scale(-1, -1); ctx.fillText('❦', 0, 0); ctx.restore()
}

function drawHeader(ctx, width, compact) {
  const top = compact ? 49 : 52
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#7f3a2c'
  ctx.font = `${compact ? 10 : 11}px Georgia`
  ctx.letterSpacing = compact ? '2px' : '3px'
  ctx.fillText('A FIELD GUIDE TO BRIGHT THINGS', 44, top)
  if (!compact) {
    ctx.textAlign = 'right'
    ctx.fillText('FOLIO · VIII', width - 44, top)
  }
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#263c2c'
  ctx.font = `italic ${compact ? 19 : 31}px Georgia`
  if (compact) {
    ctx.fillText('for Emiy, who makes', 44, top + 28)
    ctx.fillText('the ordinary luminous', 44, top + 51)
  } else {
    ctx.fillText('for Emiy, who makes the ordinary luminous', 44, top + 39)
  }

  ctx.strokeStyle = '#ad741e'
  ctx.beginPath()
  ctx.moveTo(44, top + (compact ? 64 : 53))
  ctx.lineTo(width - 44, top + (compact ? 64 : 53))
  ctx.stroke()
}

function drawFooter(ctx, width, height, compact) {
  ctx.fillStyle = '#815130'
  ctx.font = `${compact ? 8 : 10}px Georgia`
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2.2px'
  ctx.fillText(compact ? 'HAPPY GIRLFRIEND DAY  ·  EMIY  ·  FOLIO VIII' : 'HAPPY GIRLFRIEND DAY  ·  FIRST OF AUGUST  ·  ALWAYS TOWARD THE SUN', width / 2, height - 37)
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'
}

function drawSunflower(ctx, image, x, y, scale, rotation, flip = false) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip ? -scale : scale, scale)
  ctx.drawImage(image, -90, -132, 180, 264)
  ctx.restore()
}

function drawMoth(ctx, image, x, y, scale, angle, wing) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale * (.72 + wing * .28))
  ctx.drawImage(image, -70, -48, 140, 96)
  ctx.restore()
}

function drawCharm(ctx, image, x, y, scale, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)
  ctx.drawImage(image, -55, -72, 110, 144)
  ctx.restore()
}

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    let frame = 0
    let alive = true
    let down = false
    let last = performance.now()
    let currentFont = ''
    let prepared = null
    let petals = []
    const pointer = { x: innerWidth * .72, y: innerHeight * .42, tx: innerWidth * .72, ty: innerHeight * .42, active: false }

    const imagesPromise = Promise.all([
      loadImage(`${import.meta.env.BASE_URL}sunflower.svg`),
      loadImage(`${import.meta.env.BASE_URL}moth.svg`),
      loadImage(`${import.meta.env.BASE_URL}heart-charm.svg`)
    ])

    const resize = () => {
      const dpr = Math.min(2, devicePixelRatio || 1)
      canvas.width = Math.round(innerWidth * dpr)
      canvas.height = Math.round(innerHeight * dpr)
      canvas.style.width = `${innerWidth}px`
      canvas.style.height = `${innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      currentFont = ''
    }

    const setPointer = (x, y) => {
      pointer.tx = x
      pointer.ty = y
      pointer.active = true
    }
    const move = event => setPointer(event.clientX, event.clientY)
    const touchMove = event => {
      if (!event.touches[0]) return
      setPointer(event.touches[0].clientX, event.touches[0].clientY)
    }
    const press = () => { down = true }
    const release = () => { down = false }

    addEventListener('resize', resize)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', press)
    addEventListener('pointerup', release)
    canvas.addEventListener('touchmove', touchMove, { passive: true })
    resize()

    imagesPromise.then(([sunflower, moth, charm]) => {
      const render = now => {
        if (!alive) return
        const dt = Math.min(32, now - last)
        last = now
        const width = innerWidth
        const height = innerHeight
        const compact = width < 650
        const fontSize = compact ? Math.max(13, Math.min(16, width / 26)) : Math.max(16, Math.min(21, width / 70))
        const lineHeight = fontSize * (compact ? 1.48 : 1.56)
        const font = `${fontSize}px ${FONT_STACK}`
        const margin = compact ? 42 : Math.max(54, width * .055)
        const bodyTop = compact ? 151 : 150
        const bodyBottom = height - (compact ? 82 : 58)

        if (font !== currentFont) {
          prepared = prepareWithSegments(LETTER, font, { whiteSpace: 'pre-wrap' })
          currentFont = font
        }

        if (!pointer.active) {
          pointer.tx = width * .7 + Math.sin(now * .00027) * width * .13
          pointer.ty = height * .42 + Math.cos(now * .00021) * height * .14
        }
        pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * .008)
        pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * .008)

        const bouquetScale = compact ? .62 : .9
        const bouquet = {
          x: Math.max(margin + 70, Math.min(width - margin - 70, pointer.x)),
          y: Math.max(bodyTop + 80, Math.min(bodyBottom - 90, pointer.y)),
          rx: 118 * bouquetScale,
          ry: 145 * bouquetScale
        }
        const mothShape = {
          x: width * .5 + Math.cos(now * .00042) * width * .34,
          y: bodyTop + (height - bodyTop - 90) * (.48 + Math.sin(now * .00063) * .34),
          rx: compact ? 33 : 48,
          ry: compact ? 24 : 34
        }
        const charmShape = {
          x: margin + (width - margin * 2) * (.25 + Math.sin(now * .00019 + 2) * .16),
          y: bodyTop + (height - bodyTop - 90) * (.72 + Math.cos(now * .00031) * .12),
          rx: compact ? 31 : 43,
          ry: compact ? 42 : 58
        }
        const shapes = [bouquet, mothShape, charmShape]

        if (down && Math.random() < .34) {
          petals.push({
            x: bouquet.x + (Math.random() - .5) * bouquet.rx,
            y: bouquet.y - bouquet.ry * .5,
            vx: (Math.random() - .5) * 1.8,
            vy: -1 - Math.random() * 1.4,
            spin: (Math.random() - .5) * .15,
            angle: Math.random() * Math.PI,
            life: 1
          })
        }
        petals = petals.filter(petal => petal.life > 0)
        petals.forEach(petal => {
          petal.x += petal.vx * dt * .06
          petal.y += petal.vy * dt * .06
          petal.vy += .025 * dt * .06
          petal.angle += petal.spin
          petal.life -= .005 * dt
        })

        drawPaper(ctx, width, height, now)
        drawHeader(ctx, width, compact)

        ctx.save()
        ctx.font = font
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#302417'
        let cursor = { segmentIndex: 0, graphemeIndex: 0 }
        let y = bodyTop
        let firstVisibleCharacter = true

        while (y + lineHeight <= bodyBottom) {
          let slots = [{ left: margin, right: width - margin }]
          for (const shape of shapes) {
            const interval = ellipseInterval(shape, y, y + lineHeight, compact ? 7 : 11)
            if (interval) slots = carve(slots, interval)
          }
          slots = slots.filter(slot => slot.right - slot.left > fontSize * 3.3)
          if (!slots.length) { y += lineHeight; continue }

          let exhausted = false
          for (const slot of slots) {
            const line = layoutNextLine(prepared, cursor, slot.right - slot.left)
            if (!line) { exhausted = true; break }

            if (firstVisibleCharacter && line.text.trim()) {
              const first = line.text.trimStart()[0]
              ctx.save()
              ctx.fillStyle = '#9a3d2d'
              ctx.font = `${fontSize * 3.15}px Georgia`
              ctx.fillText(first, slot.left, y - fontSize * .2)
              ctx.restore()
              const remainder = line.text.replace(first, '')
              ctx.fillText(remainder, slot.left + fontSize * 2.6, y)
              firstVisibleCharacter = false
            } else {
              ctx.fillStyle = '#302417'
              ctx.fillText(line.text, slot.left, y)
            }
            cursor = line.end
          }
          if (exhausted) break
          y += lineHeight
        }
        ctx.restore()

        const sway = Math.sin(now * .0013) * .045
        drawSunflower(ctx, sunflower, bouquet.x - 52 * bouquetScale, bouquet.y + 7, bouquetScale * .8, sway - .14, true)
        drawSunflower(ctx, sunflower, bouquet.x + 45 * bouquetScale, bouquet.y + 10, bouquetScale * .74, -sway + .15)
        drawSunflower(ctx, sunflower, bouquet.x, bouquet.y - 22 * bouquetScale, bouquetScale, sway)
        drawMoth(ctx, moth, mothShape.x, mothShape.y, compact ? .55 : .76, Math.sin(now * .0009) * .25, .5 + Math.sin(now * .013) * .5)
        drawCharm(ctx, charm, charmShape.x, charmShape.y, compact ? .6 : .82, Math.sin(now * .0011) * .12)

        for (const petal of petals) {
          ctx.save()
          ctx.globalAlpha = petal.life
          ctx.translate(petal.x, petal.y)
          ctx.rotate(petal.angle)
          ctx.fillStyle = Math.random() > .5 ? '#e5ab25' : '#c96f1d'
          ctx.beginPath()
          ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }

        drawFooter(ctx, width, height, compact)
        frame = requestAnimationFrame(render)
      }
      frame = requestAnimationFrame(render)
    }).catch(error => console.error(error))

    return () => {
      alive = false
      cancelAnimationFrame(frame)
      removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerdown', press)
      removeEventListener('pointerup', release)
      canvas.removeEventListener('touchmove', touchMove)
    }
  }, [])

  return (
    <main className="experience">
      <canvas ref={canvasRef} aria-label="An animated illustrated love letter for Emiy" />
      <div className="instruction"><i /> move the flowers · hold to scatter petals</div>
      <div className="signature">written in sunlight <span>☼</span></div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
