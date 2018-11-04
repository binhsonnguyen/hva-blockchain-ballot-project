module.exports = asyncAction => ({
  should: {
    be: {
      rejected: async () => {
        try {
          await asyncAction
        } catch (e) {
          assert.ok(true)
          return
        }
        assert.fail()
      },
      succeed: async () => {
        try {
          await asyncAction()
          assert.ok(true)
        } catch (e) {
          assert.fail()
        }
      }
    }
  }
})