let log = console.log

module.exports = (asyncAction, debug) => ({
  should: {
    be: {
      rejected: async () => {
        try {
          await asyncAction()
        } catch (e) {
          if (debug) log(e)
          assert.ok(true)
          return
        }
        assert.fail()
      },
      succeed: async () => {
        try {
          await asyncAction()
        } catch (e) {
          assert.fail( debug ? log(e) : undefined)
        }
      }
    }
  }
})