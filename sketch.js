let body = document.body
let images = { mainImg: null, maskImg: null }
let mainImg
let maskImg
let origW
let origH
let imgAR
let maskSize = 600
let flipped = false
let flipping = false // Sets true when user clicks and swaps image
let flipCounter = 0
let flipIncrement = 0
let flipDuration = 1000
let flipD = 0
let fading = false // After swapping image, the masking lens is faded back in
let fadeCounter = 0
let fadeDuration = 500
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
	!flipping && image(mainImg, 0, 0)
	if (mouseInBounds()) {
		if (!flipping && !fading) {
			drawMask(maskSize)
		}
		if (flipping && !fading) {
			console.log('Flipping')
			flipCounter += flipIncrement
			drawMask(maskSize + flipCounter)
			if (flipCounter - 1.5 * maskSize > flipD) {
				console.log('Swapping images :::')
				console.log('flipCounter :::', flipCounter)
				console.log('flipD :::', flipD)
				swapImages()
			}
		}
		if (!flipping && fading) {
			fadeCounter += 13.33 * 1.5
			drawMask(1 + fadeCounter)
		}
	}

	fr.html(floor(frameRate()))
}

function mousePressed() {
	if (flipping || fading) return
	if (!mouseInBounds()) return
	flipD = getFurthestFlipCorner()
	flipIncrement = getFlipIncrement(flipD)
	flipping = true
	requestPointerLock()
}

function windowResized() {
	if (debounceId !== null) clearTimeout(debounceId)
	debounceId = setTimeout(() => {
		onResize()
	}, 250)
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

	if (flipping) {
		circleMask.fill(0, 0, 0, 255)
		circleMask.circle(floor(r/2), floor(r/2), r)
	} else {
		const newR = r - 100
		const coef = flipping ? 96 : 12
		let counter = 0
		// Draw circles with different alpha values and animate them
		for (let x = newR; x > 0; x -= coef) {
			const t = floor(coef / 2) // Translate value
			const a = (flipping || fading ? easeOutCirc(1 - x / newR) : easeOutBounce(1 - x / newR)) * 255 // Alpha value
			const pulseOff = counter%2 == 0 ? sin(cycle) : cos(cycle)
			const radius = x + 20 * pulseOff

			// Draw on mask graphic
			push()
			circleMask.translate(t, t)
			circleMask.fill(0, 0, 0, a)
			circleMask.ellipse(floor(x/2), floor(x/2), radius + 20 * sin(cycle), radius + 20 * cos(cycle))
			pop()

			counter++
		}
	}

	// Cut masking image
	const img = maskImg.get(xStart + r/2, yStart + r/2, r, r)

	// Apply shape mask
	img.mask(circleMask)

	// Translate to put cursor in the middle
	push()
	translate(r/2, r/2)
	image(img, xStart, yStart)
	pop()
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
	flipping = false
	fading = true
	flipCounter = 0
	exitPointerLock()
	setTimeout(() => {
		fading = false
		flipped = !flipped
		fadeCounter = 0
	}, fadeDuration)
}

// Helper Functions

function getResizeDim() {
	const w = body.clientWidth
	const h = w / imgAR
	return { w, h }
}

function mouseInBounds() {
	return mouseX < width || mouseX > width || mouseY < height || mouseY > height
}

function getFurthestFlipCorner() {
	const x = mouseX
	const y = mouseY
	let result
	if (x <= width/2 && y <= height/2) {
		console.log('Scenario 1')
		result = dist(x, y, width, height)
	}
	if (x > width/2 && y < height/2) {
		console.log('Scenario 2')

		result = dist(x, y, 0, height)
	}
	if (x < width/2 && y > height/2) {
		console.log('Scenario 3')

		result = dist(x, y, width, 0)
	}
	if (x > width/2 && y > height/2) {
		console.log('Scenario 4')
		result = dist(0, 0, x, y)
	}
	console.log('result ::: ', result)
	return result
}

function getFlipIncrement(r) {
	console.log('flipIncrement ::: ' ,(r / 30) * (1000 / flipDuration))
	return (r / 20) * (1000 / flipDuration)
}
