let body = document.body
let images = { mainImg: null, maskImg: null }
let mainImg
let maskImg
let origW
let origH
let imgAR
let maskSize = 600
let flipped = false
let fadingOut = false // After swapping image, the masking lens is faded back in
let fadeOutCounter = 0
let fadeOutId
let fadingIn = false
let fadeInCounter = 0
let fadeInId
let isResizing = false
let debounceId = null
let fr

function preload() {
	images.mainImg = loadImage('/assets/mountain_2.jpg')
	images.maskImg = loadImage('/assets/beach.jpg')
}

function setup() {
	// Get original image aspect ratio for resizing
	origW = images.mainImg.width
	origH = images.mainImg.height
	imgAR = origW / origH

	// Create canvas based on current body size or maybe the container in which the canvas will live
	createCanvas(0, 0);
	onResize()

	fr = createP('')
}

function draw() {
	// push()
	if (!fadingOut) {
		image(mainImg, 0, 0)
		!mouseOutBounds() && drawMask(maskSize)
	} else {
		if (fadeOutCounter >= 50) {
			clearInterval(fadeOutId)
			fadingOut = false
			fadeOutCounter = 0
			fadingIn = true
			swapImages()
			fadeInId = setInterval(() => {
				fadeInCounter += 10
			})
		}
		tint(255, fadeOutCounter)
		image(maskImg, 0, 0)
	}
	// pop()
	fr.html(floor(frameRate()))
}

function mousePressed() {
	if (fadingOut) return
	if (!mouseOutBounds()) {
		fadingOut = true
		fadeOutId = setInterval(() => {
			fadeOutCounter++
		}, 1)
	}
}

function windowResized() {
	// if (debounceId !== null) clearTimeout(debounceId)
	// debounceId = setTimeout(() => {
		onResize()
	// }, 250)
}

/**
 * @param {number} r - Mask radius
 * Create mask graphic which acts as a small canvas on which we can draw shapes
 * with an alpha fill to determine the amount of transparency to the masking image
 */

function drawMask(r) {
	// Get starting point for the masking image
	const xStart = mouseX - r
	const yStart = mouseY - r

	// Create mask canvas
	const circleMask = createGraphics(r + 60, r + 60)
	// if (flipping || fading) circleMask.noStroke()
	circleMask.noStroke()
	const cycle = frameCount / 200


	const newR = r - 100
	const coef = 12
	let counter = 0
	// Draw circles with different alpha values and animate them
	for (let x = newR; x > 0; x -= coef) {
		const t = floor(coef / 2) // Translate value
		const a = easeOutBounce(1 - x / newR) * 255 // Alpha value
		const pulseOff = counter%2 == 0 ? sin(cycle) : cos(cycle)
		const radius = x + 20 * pulseOff

		// Draw on mask graphic
		circleMask.translate(t, t)
		circleMask.fill(0, 0, 0, a)
		circleMask.ellipse(floor(x/2), floor(x/2), radius + 20 * sin(cycle), radius + 20 * cos(cycle))

		counter++
	}

	// Cut masking image
	const img = maskImg.get(xStart + r/2, yStart + r/2, r, r)

	// Apply shape mask
	img.mask(circleMask)

	// Translate to put cursor in the middle
	// push()
	translate(r/2, r/2)
	fadingOut && tint(255, 1 / fadeOutCounter)
	fadingIn && tint(255, fadeInCounter)
	image(img, xStart, yStart)
	// pop()
	if (fadeInCounter >= 255) {
		fadingIn = false
		fadeInCounter = 0
		flipped = !flipped
		clearInterval(fadeInId)
	}
	circleMask.remove()
}

/**
 * On window resize callback
 */
function onResize() {
	noLoop()
	const { w, h } = getResizeDim()
	const resizeW = w < origW ? w : origW
	const resizeH = h < origH ? h : origH
	resizeCanvas(resizeW, resizeH)
	resizeImg(resizeW, resizeH)
	loop()
}

/*
 * Because the p5.Image.resize function deteriorates image quality,
 * store original image, copy it onto a new image object and only then resize
 */
function resizeImg(w, h) {
	const currentBg = (bool) => bool ? 'maskImg' : 'mainImg'
	mainImg = createImage(w, h)
	maskImg = createImage(w, h)
	mainImg.copy(images[currentBg(flipped)], 0, 0, origW, origH, 0, 0, w, h)
	maskImg.copy(images[currentBg(!flipped)], 0, 0, origW, origH, 0, 0, w, h)
}

function swapImages() {
	const mainCopy = mainImg
	const maskCopy = maskImg
	maskImg = mainCopy
	mainImg = maskCopy
}

// Helper Functions

function getResizeDim() {
	const w = body.clientWidth
	const h = w / imgAR
	return { w, h }
}

function mouseOutBounds() {
	return mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height
}
