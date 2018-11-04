let log = console.log

module.exports = asyncAction => ({
  should: {
    be: {
      rejected: async () => {
        try {
          await asyncAction()
        } catch (e) {
          assert.ok(true)
          return
        }
        assert.fail()
      },
      succeed: async () => {
        try {
          await asyncAction()
        } catch (e) {
          assert.fail()
        }
      }
    }
  }
})