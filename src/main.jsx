import React, { useEffect, useRef } from 'react'
import { createRoot } from 'react-dom/client'
import { layoutNextLine, prepareWithSegments } from '@chenglou/pretext'
import './styles.css'

const LETTER = `Emily, you are a sunflower in my life. You keep turning me back toward the light, even on days when I forget where it is. Thank you for guiding me there in your own way, with your smile, your chaos, your mischief, and the way you make ordinary moments feel alive.

I love your smile. I love how it changes the whole mood of a room for me. I love the way your mischievous side makes me laugh before I even mean to. You can turn a normal moment into a story I want to remember, usually with one look or one perfectly timed comment.

You are fun, chaotic, interesting, and so completely yourself. I love that about you. Life with you never feels flat. There is always a little surprise, a strange idea, a joke, or some tiny adventure waiting around the corner. Even when things are messy, you bring a kind of brightness that feels honest and real.

Thank you for sharing all of that with me. Thank you for letting me know your softer side, your silly side, your stubborn side, and all the little details that make you Emily. I do not need perfect. I love real. And with you, real feels bright.

I appreciate the way you care. I appreciate your presence, the sound of your laugh, and the calm that sometimes appears right in the middle of our chaos. I appreciate that I get to keep learning you. There are always new details, and I never get tired of noticing them.

Sunflowers turn toward the light, and somehow you help me do the same. You remind me to look up, to laugh, and to enjoy what is right in front of me. You make the good days warmer, and you make the difficult days feel less heavy just by being there.

Thank you for being playful with me. Thank you for being interesting, surprising, sweet, and wonderfully chaotic. Thank you for giving me so many reasons to smile. I hope I can give some of that light back to you, in the small ways that matter.

Happy Girlfriend Day, Emily. I love you. Thank you for being one of the brightest things in my life. I am very lucky that I get to share this strange, fun, beautiful little world with you.`

const FONT_STACK = '"IM FELL English", Georgia, "Times New Roman", serif'

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

function rectInterval(rect, bandTop, bandBottom, padding = 0) {
  if (bandBottom <= rect.y - padding || bandTop >= rect.y + rect.height + padding) return null
  return { left: rect.x - padding, right: rect.x + rect.width + padding }
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

function drawBorderRosette(ctx, x, y, scale, color) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = color
  ctx.strokeStyle = '#48291d'
  ctx.lineWidth = .7
  for (let i = 0; i < 8; i++) {
    ctx.save()
    ctx.rotate(i * Math.PI / 4)
    ctx.beginPath()
    ctx.ellipse(0, -7 * scale, 2.8 * scale, 6 * scale, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
  ctx.beginPath()
  ctx.arc(0, 0, 3.3 * scale, 0, Math.PI * 2)
  ctx.fillStyle = '#d4a32b'
  ctx.fill()
  ctx.restore()
}

function drawIlluminatedBand(ctx, left, top, bottom) {
  ctx.save()
  ctx.strokeStyle = '#b48726'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(left, top)
  ctx.lineTo(left, bottom)
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.strokeStyle = '#244c64'
  ctx.beginPath()
  ctx.moveTo(left + 6, top + 4)
  ctx.lineTo(left + 6, bottom - 4)
  ctx.stroke()
  for (let y = top + 8, i = 0; y < bottom - 8; y += 24, i++) {
    ctx.fillStyle = i % 2 ? '#9b332d' : '#315b73'
    ctx.fillRect(left - 3, y, 7, 11)
    ctx.fillStyle = '#d1a32d'
    ctx.beginPath()
    ctx.arc(left + 7, y + 5.5, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  drawBorderRosette(ctx, left + 2, top - 2, .72, '#9d352d')
  drawBorderRosette(ctx, left + 2, bottom + 2, .72, '#315c70')
  ctx.restore()
}

function drawOrnateDropCap(ctx, rect, compact) {
  ctx.save()
  const centerX = rect.x + rect.width / 2
  const centerY = rect.y + rect.height / 2
  ctx.strokeStyle = '#16130e'
  ctx.lineWidth = compact ? 2.2 : 3.2
  ctx.beginPath()
  ctx.moveTo(rect.x + rect.width * .22, rect.y + rect.height * .92)
  ctx.bezierCurveTo(rect.x - 10, rect.y + rect.height * .78, rect.x + 2, rect.y + rect.height * .25, rect.x + rect.width * .31, rect.y + rect.height * .1)
  ctx.bezierCurveTo(rect.x + rect.width * .56, rect.y - 8, rect.x + rect.width * .9, rect.y + 3, rect.x + rect.width * .84, rect.y + rect.height * .24)
  ctx.stroke()
  drawLeaf(ctx, rect.x + 4, rect.y + rect.height * .66, -.76, compact ? .48 : .7, '#9b3a2f')
  drawLeaf(ctx, rect.x + rect.width * .75, rect.y + 11, 2.7, compact ? .4 : .6, '#a84937')
  drawLeaf(ctx, rect.x + 9, rect.y + rect.height * .88, -.28, compact ? .34 : .5, '#9b3a2f')

  ctx.strokeStyle = '#17140f'
  ctx.lineWidth = compact ? 1.5 : 2.1
  for (const [ox, oy, radius] of [[.18, .18, .14], [.78, .34, .12], [.22, .82, .11]]) {
    ctx.beginPath()
    ctx.arc(rect.x + rect.width * ox, rect.y + rect.height * oy, rect.width * radius, 0, Math.PI * 1.78)
    ctx.stroke()
  }

  ctx.shadowColor = 'rgba(244,238,221,.9)'
  ctx.shadowBlur = 1
  ctx.fillStyle = '#17140f'
  ctx.font = `700 ${rect.height * (compact ? .72 : .74)}px "UnifrakturCook", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('E', centerX, centerY + rect.height * .03)
  ctx.shadowBlur = 0
  ctx.restore()
}

function drawPaper(ctx, width, height, time, page) {
  ctx.fillStyle = '#f4eee0'
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient((page.left + page.right) / 2, page.top + page.height * .4, 30, (page.left + page.right) / 2, page.top + page.height * .4, page.width * .75)
  glow.addColorStop(0, 'rgba(255,252,236,.45)')
  glow.addColorStop(1, 'rgba(103,73,38,.035)')
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

}

function drawHeader(ctx, page, compact) {
  const left = page.left + (compact ? 32 : 18)
  const right = page.right - (compact ? 20 : 18)
  const top = compact ? 49 : 52
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#7f3a2c'
  ctx.font = `${compact ? 10 : 12}px "IM FELL English", Georgia, serif`
  ctx.letterSpacing = compact ? '2px' : '3px'
  ctx.fillText(compact ? 'AN ILLUMINATED LETTER' : 'AN ILLUMINATED LETTER OF BRIGHT THINGS', left, top)
  if (!compact) {
    ctx.textAlign = 'right'
    ctx.fillText('FOLIO · VIII', right, top)
  }
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#17150f'
  ctx.font = `700 ${compact ? 25 : 40}px "UnifrakturCook", Georgia, serif`
  if (compact) {
    ctx.fillText('For Emily,', left, top + 31)
    ctx.font = `italic 18px "IM FELL English", Georgia, serif`
    ctx.fillText('who turns me toward the light', left, top + 54)
  } else {
    ctx.fillText('For Emily, who turns me toward the light', left, top + 43)
  }

  ctx.strokeStyle = '#ad741e'
  ctx.beginPath()
  ctx.moveTo(left, top + (compact ? 68 : 58))
  ctx.lineTo(right, top + (compact ? 68 : 58))
  ctx.stroke()

  const emblemX = right - (compact ? 9 : 5)
  const emblemY = top + (compact ? 48 : 34)
  drawSunEmblem(ctx, emblemX, emblemY, compact ? .7 : .85)
  drawTinyStar(ctx, left - 14, top + (compact ? 47 : 32), compact ? 3 : 4, '#a66f1f', .35)
  drawTinyStar(ctx, right + 9, top + (compact ? 13 : 16), 2.4, '#92402e', .2)
  ctx.fillStyle = '#a06b26'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(left - 8 + i * 8, top + (compact ? 62 : 51), 1.1 - i * .15, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawFooter(ctx, page, height, compact) {
  ctx.fillStyle = '#815130'
  ctx.font = `${compact ? 9 : 11}px "IM FELL English", Georgia, serif`
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2.2px'
  ctx.fillText(compact ? 'EMILY  ·  GIRLFRIEND DAY  ·  VIII' : 'HAPPY GIRLFRIEND DAY  ·  EMILY  ·  ALWAYS TOWARD THE SUN', (page.left + page.right) / 2, height - 38)
  ctx.textAlign = 'left'
  ctx.letterSpacing = '0px'
}

function drawBloomingSunflower(ctx, image, x, bottomY, finalScale, bloom, time) {
  const eased = 1 - Math.pow(1 - bloom, 3)
  if (eased < .035) {
    ctx.save()
    ctx.translate(x, bottomY - 7)
    ctx.rotate(-.28)
    ctx.fillStyle = '#3b3021'
    ctx.strokeStyle = '#17140f'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.ellipse(0, 0, 6, 11, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
    return
  }
  const scaleX = finalScale * eased
  const scaleY = finalScale * (.08 + eased * .92)
  ctx.save()
  ctx.translate(x, bottomY)
  ctx.rotate(Math.sin(time * .0011) * .025 * eased)
  ctx.scale(scaleX, scaleY)
  ctx.drawImage(image, -90, -264, 180, 264)
  ctx.restore()
}

function drawButterfly(ctx, image, x, y, scale, angle, wing) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale * (.72 + wing * .28))
  ctx.drawImage(image, -70, -48, 140, 96)
  ctx.restore()
}

function drawPen(ctx, x, y, scale, angle) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)

  const ink = '#171510'
  ctx.fillStyle = ink
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(-76, 4)
  ctx.bezierCurveTo(-56, -24, -20, -28, 34, -9)
  ctx.bezierCurveTo(5, -5, -20, 4, -70, 15)
  ctx.bezierCurveTo(-59, 11, -49, 8, -36, 6)
  ctx.bezierCurveTo(-50, 4, -63, 4, -76, 4)
  ctx.fill()

  ctx.strokeStyle = '#eee5cf'
  ctx.globalAlpha = .8
  ctx.lineWidth = 1
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(-56 + i * 13, 2)
    ctx.lineTo(-42 + i * 13, -13 + i * .5)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-52 + i * 13, 5)
    ctx.lineTo(-37 + i * 13, 12 - i * .4)
    ctx.stroke()
  }
  ctx.globalAlpha = 1

  ctx.strokeStyle = '#7d5520'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(-66, 7)
  ctx.lineTo(62, 0)
  ctx.stroke()
  ctx.fillStyle = '#b98a2d'
  ctx.beginPath()
  ctx.moveTo(62, 0)
  ctx.lineTo(76, -5)
  ctx.lineTo(70, 6)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.arc(73, 0, 1.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    let frame = 0
    let alive = true
    let last = performance.now()
    let currentFont = ''
    let prepared = null
    let bloom = 0
    let bloomTarget = 0
    const sunflowerHit = { x: 0, y: 0, radius: 60 }
    const pointer = { x: innerWidth * .5, y: innerHeight * .45, tx: innerWidth * .5, ty: innerHeight * .45, active: false, angle: -.08 }

    const imagesPromise = Promise.all([
      loadImage(`${import.meta.env.BASE_URL}sunflower.svg`),
      loadImage(`${import.meta.env.BASE_URL}moth.svg`),
      document.fonts.ready
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
    const press = event => {
      setPointer(event.clientX, event.clientY)
      const distance = Math.hypot(event.clientX - sunflowerHit.x, event.clientY - sunflowerHit.y)
      if (distance <= sunflowerHit.radius) bloomTarget = 1
    }

    addEventListener('resize', resize)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerdown', press)
    canvas.addEventListener('touchmove', touchMove, { passive: true })
    resize()

    imagesPromise.then(([sunflower, butterfly]) => {
      const render = now => {
        if (!alive) return
        const dt = Math.min(32, now - last)
        last = now
        const width = innerWidth
        const height = innerHeight
        const compact = width < 650
        const pageWidth = Math.min(700, width - 40)
        const pageHeight = Math.min(920, height - 40)
        const page = {
          left: (width - pageWidth) / 2,
          right: (width + pageWidth) / 2,
          top: Math.max(20, (height - pageHeight) / 2),
          width: pageWidth,
          height: pageHeight
        }
        page.bottom = page.top + page.height
        const ratio = pageWidth / 700
        const fontSize = Math.max(14, Math.round(21 * (.45 + .55 * ratio)))
        const lineHeight = Math.max(22, Math.round(34 * (.45 + .55 * ratio)))
        const font = `${fontSize}px ${FONT_STACK}`
        const pageMargin = Math.round(45 * ratio)
        const textLeft = page.left + pageMargin
        const textRight = page.right - pageMargin
        const bodyTop = page.top + pageMargin
        const bodyBottom = page.bottom - pageMargin

        if (font !== currentFont) {
          prepared = prepareWithSegments(LETTER.slice(1), font, { whiteSpace: 'pre-wrap' })
          currentFont = font
        }

        if (!pointer.active) {
          pointer.tx = page.left + page.width * .58 + Math.sin(now * .00027) * page.width * .12
          pointer.ty = bodyTop + (bodyBottom - bodyTop) * .42 + Math.cos(now * .00021) * 46
        }
        const pointerDx = pointer.tx - pointer.x
        const pointerDy = pointer.ty - pointer.y
        pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * .008)
        pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * .008)
        const targetAngle = Math.atan2(pointerDy, pointerDx || 1) * .12 - .08
        pointer.angle += (targetAngle - pointer.angle) * .12

        bloom += (bloomTarget - bloom) * Math.min(1, dt * .0048)
        const bloomEase = 1 - Math.pow(1 - bloom, 3)
        const sunflowerFinalScale = compact ? .52 : .68
        const sunflowerScale = sunflowerFinalScale * bloomEase
        const sunflowerX = textRight - (compact ? 16 : 24)
        const sunflowerBottom = bodyBottom + 8
        const sunflowerShape = {
          x: sunflowerX,
          y: sunflowerBottom - 132 * sunflowerScale,
          rx: Math.max(8, 86 * sunflowerScale),
          ry: Math.max(12, 132 * sunflowerScale)
        }
        sunflowerHit.x = sunflowerX
        sunflowerHit.y = bloomTarget ? sunflowerBottom - 92 * sunflowerFinalScale : sunflowerBottom - 7
        sunflowerHit.radius = bloomTarget ? (compact ? 54 : 68) : 24

        const butterflyShape = {
          x: page.left + page.width * (.47 + Math.cos(now * .00042) * .28),
          y: bodyTop + (bodyBottom - bodyTop) * (.48 + Math.sin(now * .00063) * .27),
          rx: compact ? 31 : 42,
          ry: compact ? 22 : 29
        }
        const penLength = compact ? 88 : 128
        const penShapes = Array.from({ length: 6 }, (_, index) => {
          const t = index / 5 - .5
          return {
            x: pointer.x + Math.cos(pointer.angle) * penLength * t,
            y: pointer.y + Math.sin(pointer.angle) * penLength * t,
            rx: compact ? 13 : 18,
            ry: compact ? 11 : 15
          }
        })
        const dropCapRect = {
          x: textLeft,
          y: bodyTop,
          width: compact ? 86 : 112,
          height: lineHeight * (compact ? 6.6 : 7)
        }
        const shapes = [...penShapes, butterflyShape, sunflowerShape]

        drawPaper(ctx, width, height, now, page)

        ctx.save()
        ctx.font = font
        ctx.textBaseline = 'top'
        ctx.fillStyle = '#302417'
        let cursor = { segmentIndex: 0, graphemeIndex: 0 }
        let y = bodyTop

        while (y + lineHeight <= bodyBottom) {
          let slots = [{ left: textLeft, right: textRight }]
          for (const shape of shapes) {
            const interval = ellipseInterval(shape, y, y + lineHeight, compact ? 7 : 11)
            if (interval) slots = carve(slots, interval)
          }
          const dropCapInterval = rectInterval(dropCapRect, y, y + lineHeight, compact ? 7 : 10)
          if (dropCapInterval) slots = carve(slots, dropCapInterval)
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

        drawOrnateDropCap(ctx, dropCapRect, compact)

        drawBloomingSunflower(ctx, sunflower, sunflowerX, sunflowerBottom, sunflowerFinalScale, bloom, now)
        drawButterfly(ctx, butterfly, butterflyShape.x, butterflyShape.y, compact ? .53 : .68, Math.sin(now * .0009) * .25, .5 + Math.sin(now * .013) * .5)
        drawPen(ctx, pointer.x, pointer.y, compact ? .62 : .82, pointer.angle)

        ctx.save()
        ctx.fillStyle = '#2a1a0a'
        ctx.font = `${compact ? 11 : 13}px "IM FELL English", Georgia, serif`
        ctx.textAlign = 'center'
        ctx.fillText('For Emily', (page.left + page.right) / 2, page.bottom - 8)
        ctx.restore()
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
      canvas.removeEventListener('touchmove', touchMove)
    }
  }, [])

  return (
    <main className="experience">
      <canvas ref={canvasRef} aria-label="An animated illustrated love letter for Emily" />
      <div className="instruction"><i /> guide the quill · click the seed</div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
