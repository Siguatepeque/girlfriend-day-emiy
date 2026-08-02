import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import './styles.css'

const LETTER = `Emiy, you are a sunflower in my life. You keep turning me back toward the light, even on days when I forget where it is. Thank you for guiding me there in your own way, with your smile, your chaos, your mischief, and the way you make ordinary moments feel alive.

I love your smile. I love how it changes the whole mood of a room for me. I love the way your mischievous side makes me laugh before I even mean to. You can turn a normal moment into a story I want to remember, usually with one look or one perfectly timed comment.

You are fun, chaotic, interesting, and so completely yourself. I love that about you. Life with you never feels flat. There is always a little surprise, a strange idea, a joke, or some tiny adventure waiting around the corner. Even when things are messy, you bring a kind of brightness that feels honest and real.

Thank you for sharing all of that with me. Thank you for letting me know your softer side, your silly side, your stubborn side, and all the little details that make you Emiy. I do not need perfect. I love real. And with you, real feels bright.

I appreciate the way you care. I appreciate your presence, the sound of your laugh, and the calm that sometimes appears right in the middle of our chaos. I appreciate that I get to keep learning you. There are always new details, and I never get tired of noticing them.

Sunflowers turn toward the light, and somehow you help me do the same. You remind me to look up, to laugh, and to enjoy what is right in front of me. You make the good days warmer, and you make the difficult days feel less heavy just by being there.

Thank you for being playful with me. Thank you for being interesting, surprising, sweet, and wonderfully chaotic. Thank you for giving me so many reasons to smile. I hope I can give some of that light back to you, in the small ways that matter.

Happy Girlfriend Day, Emiy. I love you. Thank you for being one of the brightest things in my life. I am very lucky that I get to share this strange, fun, beautiful little world with you.`

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

function drawTinyStar(ctx, x, y, radius, color = '#a76f1d', rotation = 0) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const angle = -Math.PI / 2 + i * Math.PI / 4
    const length = i % 2 === 0 ? radius : radius * .28
    const px = Math.cos(angle) * length
    const py = Math.sin(angle) * length
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

function drawLeaf(ctx, x, y, angle, scale = 1, color = '#516039') {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.bezierCurveTo(7 * scale, -7 * scale, 17 * scale, -5 * scale, 21 * scale, 0)
  ctx.bezierCurveTo(13 * scale, 7 * scale, 6 * scale, 6 * scale, 0, 0)
  ctx.fill()
  ctx.strokeStyle = 'rgba(44,61,35,.72)'
  ctx.lineWidth = .7
  ctx.beginPath()
  ctx.moveTo(2 * scale, 0)
  ctx.lineTo(18 * scale, 0)
  ctx.stroke()
  ctx.restore()
}

function drawVine(ctx, x, y, length, direction = 1) {
  ctx.save()
  ctx.strokeStyle = 'rgba(62,80,43,.58)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.bezierCurveTo(x + direction * 11, y + length * .23, x - direction * 8, y + length * .66, x + direction * 5, y + length)
  ctx.stroke()
  for (let i = 1; i <= 4; i++) {
    const py = y + length * (i / 5)
    const px = x + Math.sin(i * 1.7) * 4
    drawLeaf(ctx, px, py, i % 2 ? -.45 : Math.PI + .45, .42, i % 2 ? '#5f6d3e' : '#6f7942')
  }
  ctx.restore()
}

function drawIlluminatedCorner(ctx, x, y, flipX, flipY) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(flipX, flipY)
  ctx.globalAlpha = .42
  ctx.strokeStyle = '#9f6e25'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, 22)
  ctx.quadraticCurveTo(4, 3, 23, 0)
  ctx.quadraticCurveTo(8, 9, 16, 23)
  ctx.stroke()
  drawLeaf(ctx, 7, 8, -.72, .34, '#7a5430')
  drawLeaf(ctx, 14, 4, -.25, .28, '#5e6a3b')
  ctx.restore()
}

function drawSunEmblem(ctx, x, y, scale = 1) {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = '#a86e1c'
  ctx.fillStyle = '#d69a23'
  ctx.lineWidth = 1
  for (let i = 0; i < 12; i++) {
    const angle = i * Math.PI / 6
    ctx.beginPath()
    ctx.moveTo(Math.cos(angle) * 8 * scale, Math.sin(angle) * 8 * scale)
    ctx.lineTo(Math.cos(angle) * 12 * scale, Math.sin(angle) * 12 * scale)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.arc(0, 0, 5.5 * scale, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, 2.2 * scale, 0, Math.PI * 2)
  ctx.fillStyle = '#69421e'
  ctx.fill()
  ctx.restore()
}

function drawIlluminatedCapital(ctx, y, compact) {
  const centerX = compact ? 37 : 47
  const width = compact ? 27 : 39
  const height = compact ? 42 : 54
  ctx.save()
  ctx.translate(centerX, y + height / 2)
  ctx.fillStyle = 'rgba(169,111,29,.11)'
  ctx.strokeStyle = '#aa711f'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(-width / 2, -height / 2, width, height, 4)
  ctx.fill()
  ctx.stroke()
  drawTinyStar(ctx, 0, -height / 2 + 7, compact ? 2.5 : 3, '#a34731', Math.PI / 4)
  ctx.fillStyle = '#973e2f'
  ctx.font = `${compact ? 32 : 43}px Georgia`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('E', 0, 5)
  ctx.restore()
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

  drawIlluminatedCorner(ctx, 27, 27, 1, 1)
  drawIlluminatedCorner(ctx, width - 27, 27, -1, 1)
  drawIlluminatedCorner(ctx, 27, height - 27, 1, -1)
  drawIlluminatedCorner(ctx, width - 27, height - 27, -1, -1)

  drawVine(ctx, 31, height * .25, Math.min(155, height * .2), 1)
  drawVine(ctx, width - 31, height * .58, Math.min(145, height * .18), -1)

  ctx.fillStyle = 'rgba(152,72,43,.56)'
  for (const [x, y, size] of [[36, height * .49, 1.5], [width - 37, height * .34, 1.3], [43, height * .72, 1], [width - 42, height * .8, 1]]) {
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
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

  const emblemX = compact ? width - 57 : width - 62
  const emblemY = top + (compact ? 48 : 34)
  drawSunEmblem(ctx, emblemX, emblemY, compact ? .7 : .85)
  drawTinyStar(ctx, compact ? 31 : 28, top + (compact ? 47 : 32), compact ? 3 : 4, '#a66f1f', .35)
  drawTinyStar(ctx, compact ? width - 30 : width - 29, top + (compact ? 13 : 16), 2.4, '#92402e', .2)
  ctx.fillStyle = '#a06b26'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc((compact ? 40 : 43) + i * 8, top + (compact ? 62 : 51), 1.1 - i * .15, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFooter(ctx, width, height, compact) {
  ctx.fillStyle = '#815130'
  ctx.font = `${compact ? 8 : 10}px Georgia`
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2.2px'
  ctx.fillText(compact ? 'HAPPY GIRLFRIEND DAY  ·  EMILY  ·  FOLIO VIII' : 'HAPPY GIRLFRIEND DAY  ·  FIRST OF AUGUST  ·  ALWAYS TOWARD THE SUN', width / 2, height - 37)
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
        const margin = compact ? 58 : Math.max(78, width * .055)
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
        drawIlluminatedCapital(ctx, bodyTop + 1, compact)

        ctx.save()
        ctx.font = font
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#302417'
        let cursor = { segmentIndex: 0, graphemeIndex: 0 }
        let y = bodyTop

        while (y + lineHeight <= bodyBottom) {
          let slots = [{ left: margin, right: width - margin }]
          for (const shape of shapes) {
            const interval = ellipseInterval(shape, y, y + lineHeight, compact ? 7 : 11)
            if (interval) slots = carve(slots, interval)
          }
          const minimumSlotWidth = fontSize * (compact ? 7.5 : 3.3)
          slots = slots.filter(slot => slot.right - slot.left > minimumSlotWidth)
          if (!slots.length) { y += lineHeight; continue }

          let exhausted = false
          for (const slot of slots) {
            const line = layoutNextLine(prepared, cursor, slot.right - slot.left)
            if (!line) { exhausted = true; break }

            ctx.fillStyle = '#302417'
            ctx.fillText(line.text, slot.left, y)
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
