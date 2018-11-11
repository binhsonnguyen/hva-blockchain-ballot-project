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
        if (debug) log("no any exception thrown")
        assert.fail()
      },
      succeed: async () => {
        try {
          await asyncAction()
          if (debug) log("no any exception thrown")
        } catch (e) {
          if (debug) log(e)
          assert.fail()
        }
      }
    }
  }
})