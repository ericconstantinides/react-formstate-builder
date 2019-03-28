/**
 * animateScroll adds a smooth scroll behavior to a scroll
 *
 * @param {number} scrollTo is the scroll position in pixels to go to
 * @param {number} scrollDuration is the transition time in milliseconds
 * @param {element} containerEl is the container which is scrolling
 * @param {function} callback a function to run after completion
 *
 * inspired by:
 * https://gist.github.com/joshcanhelp/a3a669df80898d4097a1e2c01dea52c1
 * https://stackoverflow.com/a/24559613/728480
 */
const animateScroll = (scrollTo = 0, scrollDuration = 250, containerEl = window, callback) => {
  const currentPos = window ? window.pageYOffset : containerEl.scrollTop
  if (currentPos === scrollTo) {
    return
  }
  const cosParameter =
    ((containerEl === window ? window.pageYOffset : containerEl.scrollTop) - scrollTo) / 2
  let scrollCount = 0
  let oldTimestamp = window.performance.now()

  const body = document.body
  let abort = false
  const eventTypes = ['scroll', 'mousedown', 'DOMMouseScroll', 'mousewheel', 'keyup']
  // we watch the scroll and if any movement is detected, we abort
  const watchScroll = event => {
    abort = event.which > 0 || event.type === 'mousedown' || event.type === 'mousewheel'
  }
  eventTypes.forEach(type => body.addEventListener(type, watchScroll))

  const scrollAction = thisScrollTo => {
    if (containerEl === window) {
      window.scrollTo(0, thisScrollTo)
    } else {
      containerEl.scrollTop = thisScrollTo
    }
  }

  const step = newTimestamp => {
    // If tdDiff > 100, set it back to 30. Why? Slow animations are better than choppy animations.
    const tsDiff = newTimestamp - oldTimestamp
    scrollCount += Math.PI / (scrollDuration / (tsDiff > 100 ? 30 : tsDiff))

    // As soon as we cross over Pi, we're about where we need to be
    if (abort || scrollCount >= Math.PI) {
      // one last scroll just in case:
      scrollAction(scrollTo)
      // kill the watchScroll Event Listener:
      eventTypes.forEach(type => body.removeEventListener(type, watchScroll))
      // Return the callback if we have one here:
      if (callback && typeof callback === 'function') {
        return callback()
      }
      return
    }
    const moveStep = Math.round(scrollTo + cosParameter + cosParameter * Math.cos(scrollCount))
    scrollAction(moveStep)
    oldTimestamp = newTimestamp
    window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)
}

export default animateScroll
