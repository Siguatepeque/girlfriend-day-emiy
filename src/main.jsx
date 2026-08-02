import React, { useEffect, useRef, useState } from 'react'
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

const clamp01 = value => Math.max(0, Math.min(1, value))

function cubicPoint(curve, t) {
  const u = 1 - t
  return {
    x: u ** 3 * curve.start.x + 3 * u ** 2 * t * curve.c1.x + 3 * u * t ** 2 * curve.c2.x + t ** 3 * curve.end.x,
    y: u ** 3 * curve.start.y + 3 * u ** 2 * t * curve.c1.y + 3 * u * t ** 2 * curve.c2.y + t ** 3 * curve.end.y
  }
}

function buildGarden(seed, bounds, growth, compact) {
  const spanX = bounds.right - bounds.left
  const spanY = bounds.bottom - bounds.top
  const specs = [
    { end: [.05, .29], c1: [-.09, -.1], c2: [.16, .38], delay: 0 },
    { end: [.91, .08], c1: [.13, -.12], c2: [.79, .31], delay: .07 },
    { end: [.05, .89], c1: [-.14, .13], c2: [.19, .69], delay: .14 },
    { end: [.93, .91], c1: [.13, .15], c2: [.78, .72], delay: .21 }
  ]
  const branches = specs.map((spec, index) => {
    const progress = clamp01((growth - spec.delay) / (1 - spec.delay))
    const curve = {
      start: seed,
      c1: { x: seed.x + spec.c1[0] * spanX, y: seed.y + spec.c1[1] * spanY },
      c2: { x: bounds.left + spec.c2[0] * spanX, y: bounds.top + spec.c2[1] * spanY },
      end: { x: bounds.left + spec.end[0] * spanX, y: bounds.top + spec.end[1] * spanY }
    }
    const points = []
    const steps = Math.max(1, Math.ceil(progress * 24))
    for (let step = 0; step <= steps; step++) {
      points.push(cubicPoint(curve, progress * step / steps))
    }
    const leafFractions = [.29, .51, .72].map((t, leafIndex) => ({
      t,
      side: (leafIndex + index) % 2 ? 1 : -1,
      reveal: clamp01((progress - t) * 8)
    })).filter(leaf => leaf.reveal > 0)
    return { curve, progress, points, leaves: leafFractions, index }
  })

  const shapes = [{ x: seed.x, y: seed.y, rx: compact ? 10 : 13, ry: compact ? 14 : 17 }]
  for (const branch of branches) {
    for (let index = 1; index < branch.points.length; index += 2) {
      const point = branch.points[index]
      shapes.push({ x: point.x, y: point.y, rx: compact ? 6 : 8, ry: compact ? 7 : 9 })
    }
    for (const leaf of branch.leaves) {
      const point = cubicPoint(branch.curve, leaf.t)
      shapes.push({
        x: point.x,
        y: point.y,
        rx: (compact ? 15 : 23) * leaf.reveal,
        ry: (compact ? 10 : 15) * leaf.reveal
      })
    }
    if (branch.progress > .84) {
      const flowerReveal = clamp01((branch.progress - .84) / .16)
      shapes.push({
        x: branch.curve.end.x,
        y: branch.curve.end.y,
        rx: (compact ? 27 : 39) * flowerReveal,
        ry: (compact ? 25 : 36) * flowerReveal
      })
    }
  }
  return { seed, branches, shapes, growth }
}

function drawSeed(ctx, seed, growth) {
  ctx.save()
  ctx.translate(seed.x, seed.y)
  ctx.rotate(-.3)
  ctx.fillStyle = '#30271d'
  ctx.strokeStyle = '#14120e'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.ellipse(0, 0, 7, 12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  if (growth > .015) {
    ctx.strokeStyle = '#eadfc8'
    ctx.beginPath()
    ctx.moveTo(-2, -10)
    ctx.lineTo(1, -3)
    ctx.lineTo(-2, 3)
    ctx.lineTo(2, 9)
    ctx.stroke()
  }
  ctx.restore()
}

function drawSunflowerHead(ctx, x, y, size, rotation = 0) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  const outerGold = ctx.createRadialGradient(0, -size * .22, 1, 0, 0, size * .52)
  outerGold.addColorStop(0, '#f7d14b')
  outerGold.addColorStop(.58, '#dfa020')
  outerGold.addColorStop(1, '#a95716')
  ctx.fillStyle = outerGold
  ctx.strokeStyle = '#a55c18'
  ctx.lineWidth = Math.max(.7, size * .012)
  for (let index = 0; index < 16; index++) {
    ctx.save()
    ctx.rotate(index * Math.PI / 8)
    ctx.beginPath()
    ctx.ellipse(0, -size * .31, size * .075, size * .24, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  ctx.fillStyle = '#e8ad25'
  ctx.globalAlpha = .9
  for (let index = 0; index < 12; index++) {
    ctx.save()
    ctx.rotate(index * Math.PI / 6 + Math.PI / 12)
    ctx.beginPath()
    ctx.ellipse(0, -size * .245, size * .06, size * .18, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.globalAlpha = 1

  const center = ctx.createRadialGradient(-size * .05, -size * .06, 1, 0, 0, size * .25)
  center.addColorStop(0, '#b97a24')
  center.addColorStop(.35, '#66401c')
  center.addColorStop(1, '#2d2118')
  ctx.fillStyle = center
  ctx.strokeStyle = '#241a12'
  ctx.lineWidth = Math.max(1, size * .018)
  ctx.beginPath()
  ctx.arc(0, 0, size * .225, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#d39b35'
  for (let ring = 1; ring <= 3; ring++) {
    const dots = ring * 8
    for (let dot = 0; dot < dots; dot++) {
      const angle = dot * Math.PI * 2 / dots + ring * .42
      const radius = size * .047 * ring
      ctx.beginPath()
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, Math.max(.55, size * .008), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawGarden(ctx, _image, garden, compact, time) {
  drawSeed(ctx, garden.seed, garden.growth)
  for (const branch of garden.branches) {
    if (!branch.progress) continue
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#31522d'
    ctx.lineWidth = compact ? 3 : 4.2
    ctx.beginPath()
    branch.points.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y))
    ctx.stroke()
    ctx.strokeStyle = 'rgba(119, 139, 72, .72)'
    ctx.lineWidth = compact ? .8 : 1.1
    ctx.stroke()

    for (const leaf of branch.leaves) {
      const point = cubicPoint(branch.curve, leaf.t)
      const ahead = cubicPoint(branch.curve, Math.min(1, leaf.t + .015))
      const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) + leaf.side * 1.05
      ctx.save()
      ctx.translate(point.x, point.y)
      ctx.rotate(angle)
      ctx.scale(leaf.reveal * (compact ? .72 : 1), leaf.reveal * (compact ? .72 : 1))
      drawLeaf(ctx, 0, 0, 0, 1.22, '#4f672f')
      ctx.restore()

      const tendrilLength = (compact ? 12 : 18) * leaf.reveal
      ctx.strokeStyle = 'rgba(49, 82, 45, .82)'
      ctx.lineWidth = compact ? 1 : 1.4
      ctx.beginPath()
      ctx.moveTo(point.x, point.y)
      ctx.quadraticCurveTo(
        point.x + Math.cos(angle + leaf.side * .7) * tendrilLength,
        point.y + Math.sin(angle + leaf.side * .7) * tendrilLength,
        point.x + Math.cos(angle + leaf.side * 1.35) * tendrilLength * .72,
        point.y + Math.sin(angle + leaf.side * 1.35) * tendrilLength * .72
      )
      ctx.stroke()
    }

    if (branch.progress > .84) {
      const reveal = clamp01((branch.progress - .84) / .16)
      const size = (compact ? 58 : 84) * reveal
      const sway = Math.sin(time * .001 + branch.index * 1.7) * .045 * reveal
      ctx.save()
      ctx.translate(branch.curve.end.x, branch.curve.end.y)
      ctx.rotate(sway)
      drawSunflowerHead(ctx, 0, 0, size, 0)
      ctx.restore()
    }
    ctx.restore()
  }
}

function drawButterfly(ctx, image, x, y, scale, angle, wing) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale * (.72 + wing * .28))
  ctx.drawImage(image, -70, -48, 140, 96)
  ctx.restore()
}

function drawQuill(ctx, x, y, scale, angle, time) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(scale, scale)

  const ink = '#171510'

  // Both vanes grow away from the cursor. The nib point remains at local (0, 0).
  const upperVane = ctx.createLinearGradient(24, 0, 174, -20)
  upperVane.addColorStop(0, '#c9c2b2')
  upperVane.addColorStop(.42, '#65645f')
  upperVane.addColorStop(1, '#1d2227')
  ctx.fillStyle = upperVane
  ctx.strokeStyle = ink
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(24, 1)
  ctx.bezierCurveTo(55, -39, 122, -55, 174, -19)
  ctx.bezierCurveTo(137, -12, 82, -3, 24, 1)
  ctx.fill()
  ctx.stroke()

  const lowerVane = ctx.createLinearGradient(25, 2, 168, 24)
  lowerVane.addColorStop(0, '#bdb7aa')
  lowerVane.addColorStop(.35, '#eee8da')
  lowerVane.addColorStop(.78, '#92928c')
  lowerVane.addColorStop(1, '#34383b')
  ctx.fillStyle = lowerVane
  ctx.beginPath()
  ctx.moveTo(24, 1)
  ctx.bezierCurveTo(76, 2, 132, -5, 174, -19)
  ctx.bezierCurveTo(149, 11, 98, 38, 49, 31)
  ctx.bezierCurveTo(34, 23, 27, 10, 24, 1)
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = 'rgba(37, 36, 32, .72)'
  ctx.lineWidth = .9
  for (let index = 0; index < 8; index++) {
    const root = 42 + index * 16
    const spineY = 2 - (root - 24) * .12
    ctx.beginPath()
    ctx.moveTo(root, spineY)
    ctx.lineTo(root + 12, -24 - index * 1.2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(root, spineY + 2)
    ctx.lineTo(root + 13, 22 + index * .45)
    ctx.stroke()
  }

  ctx.strokeStyle = '#d8d1b7'
  ctx.lineWidth = 3.4
  ctx.beginPath()
  ctx.moveTo(18, 2)
  ctx.quadraticCurveTo(87, 1 + Math.sin(time * .002) * .55, 171, -18)
  ctx.stroke()
  ctx.strokeStyle = '#525249'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.fillStyle = '#252a2d'
  ctx.strokeStyle = '#111315'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(8, -8)
  ctx.lineTo(22, -4)
  ctx.lineTo(25, 2)
  ctx.lineTo(11, 9)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = '#ddd8c9'
  ctx.beginPath()
  ctx.arc(12, 1, 2.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#d7d2c4'
  ctx.lineWidth = .9
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(13, 1)
  ctx.stroke()

  ctx.fillStyle = '#a9a594'
  ctx.strokeStyle = '#292b29'
  ctx.beginPath()
  ctx.moveTo(20, -4)
  ctx.lineTo(31, -2)
  ctx.lineTo(32, 5)
  ctx.lineTo(22, 7)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function App() {
  const canvasRef = useRef(null)
  const [memoryOpen, setMemoryOpen] = useState(false)

  useEffect(() => {
    if (!memoryOpen) return undefined
    const closeOnEscape = event => {
      if (event.key === 'Escape') setMemoryOpen(false)
    }
    addEventListener('keydown', closeOnEscape)
    return () => removeEventListener('keydown', closeOnEscape)
  }, [memoryOpen])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { alpha: false })
    let frame = 0
    let alive = true
    let last = performance.now()
    let currentFont = ''
    let prepared = null
    let growth = 0
    let growthTarget = 0
    const seedHit = { x: 0, y: 0, radius: 28 }
    const pointer = { x: innerWidth * .5, y: innerHeight * .45, tx: innerWidth * .5, ty: innerHeight * .45, active: false }

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
      const distance = Math.hypot(event.clientX - seedHit.x, event.clientY - seedHit.y)
      if (distance <= seedHit.radius) growthTarget = 1
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
        const pageMargin = Math.round(45 * ratio)
        const textLeft = page.left + pageMargin
        const textRight = page.right - pageMargin
        const bodyTop = page.top + pageMargin
        const bodyBottom = page.bottom - pageMargin
        const availableTextArea = (textRight - textLeft) * (bodyBottom - bodyTop)
        const preferredFontSize = 21 * (.45 + .55 * ratio)
        const fittedFontSize = Math.sqrt(availableTextArea / (LETTER.length * .8)) * .9
        const fontSize = Math.round(Math.max(compact ? 10.5 : 13, Math.min(preferredFontSize, fittedFontSize)) * 2) / 2
        const lineHeight = Math.max(17, Math.round(fontSize * 1.55))
        const font = `${fontSize}px ${FONT_STACK}`

        if (font !== currentFont) {
          prepared = prepareWithSegments(LETTER.slice(1), font, { whiteSpace: 'pre-wrap' })
          currentFont = font
        }

        if (!pointer.active) {
          pointer.tx = page.left + page.width * .58 + Math.sin(now * .00027) * page.width * .12
          pointer.ty = bodyTop + (bodyBottom - bodyTop) * .42 + Math.cos(now * .00021) * 46
        }
        pointer.x += (pointer.tx - pointer.x) * Math.min(1, dt * .008)
        pointer.y += (pointer.ty - pointer.y) * Math.min(1, dt * .008)

        if (growthTarget) growth = Math.min(1, growth + dt * .00012)
        const seed = {
          x: (textLeft + textRight) / 2,
          y: bodyTop + (bodyBottom - bodyTop) * .52
        }
        seedHit.x = seed.x
        seedHit.y = seed.y
        seedHit.radius = growthTarget ? (compact ? 18 : 22) : (compact ? 25 : 29)
        const garden = buildGarden(seed, {
          left: textLeft,
          right: textRight,
          top: bodyTop,
          bottom: bodyBottom
        }, growth, compact)

        const butterflyShape = {
          x: page.left + page.width * (.47 + Math.cos(now * .00042) * .28),
          y: bodyTop + (bodyBottom - bodyTop) * (.48 + Math.sin(now * .00063) * .27),
          rx: compact ? 31 : 42,
          ry: compact ? 22 : 29
        }
        const quillAngle = -.74 + Math.sin(now * .0011) * .018
        const quillLength = compact ? 104 : 144
        const quillShapes = Array.from({ length: 8 }, (_, index) => {
          const t = index / 7
          return {
            x: pointer.x + Math.cos(quillAngle) * quillLength * t,
            y: pointer.y + Math.sin(quillAngle) * quillLength * t,
            rx: (compact ? 9 : 13) + Math.sin(t * Math.PI) * (compact ? 7 : 10),
            ry: (compact ? 8 : 11) + Math.sin(t * Math.PI) * (compact ? 5 : 8)
          }
        })
        const dropCapRect = {
          x: textLeft,
          y: bodyTop,
          width: Math.max(compact ? 54 : 78, fontSize * (compact ? 4.8 : 5.1)),
          height: lineHeight * (compact ? 6 : 6.4)
        }
        const shapes = [...quillShapes, butterflyShape, ...garden.shapes]

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

          for (const slot of slots) {
            const line = layoutNextLine(prepared, cursor, slot.right - slot.left)
            // A narrow slot can reject the next word without meaning the letter is finished.
            if (!line) continue

            ctx.fillStyle = '#302417'
            ctx.fillText(line.text, slot.left, y)
            cursor = line.end
          }
          if (!layoutNextLine(prepared, cursor, 100000)) break
          y += lineHeight
        }
        ctx.restore()

        drawOrnateDropCap(ctx, dropCapRect, compact)

        drawGarden(ctx, sunflower, garden, compact, now)
        drawButterfly(ctx, butterfly, butterflyShape.x, butterflyShape.y, compact ? .53 : .68, Math.sin(now * .0009) * .25, .5 + Math.sin(now * .013) * .5)
        drawQuill(ctx, pointer.x, pointer.y, compact ? .62 : .82, quillAngle, now)

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
      <button
        className="memory-book"
        type="button"
        aria-label="Open our little manuscript"
        aria-expanded={memoryOpen}
        onClick={() => setMemoryOpen(true)}
      >
        <span className="memory-book__spine" />
        <span className="memory-book__cover">our little<br />manuscript</span>
        <span className="memory-book__pages" />
      </button>

      {memoryOpen && (
        <div className="memory-overlay" role="presentation" onMouseDown={event => {
          if (event.target === event.currentTarget) setMemoryOpen(false)
        }}>
          <div className="memory-spread" role="dialog" aria-modal="true" aria-label="A treasured memory">
            <button className="memory-close" type="button" onClick={() => setMemoryOpen(false)} aria-label="Close manuscript">×</button>
            <section className="memory-page memory-page--words">
              <span className="memory-kicker">A TREASURED LEAF</span>
              <h2>One bright moment,<br />kept here with you.</h2>
              <p>Some memories deserve their own page. I love this one because it is simple, sunny, and ours.</p>
              <div className="memory-flourish" aria-hidden="true">❦</div>
              <small>For Emily, always toward the light.</small>
            </section>
            <figure className="memory-page memory-page--photo">
              <div className="memory-photo-frame">
                <img src={`${import.meta.env.BASE_URL}our-memory.png`} alt="Emily and me together beneath a tree" />
              </div>
              <figcaption>a day beneath green branches</figcaption>
            </figure>
          </div>
        </div>
      )}
      <div className="instruction"><i /> guide the quill · click the seed</div>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
