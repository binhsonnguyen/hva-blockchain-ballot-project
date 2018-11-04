let log = console.log

module.exports = asyncAction => ({
  should: {
    be: {
      rejected: async () => {
        assert.fail("a", "b", "c")

        try {
          await asyncAction
          log("should be", "rejected", "seems not fired anything")
        } catch (e) {
          log("should be", "rejected", "catched", e.toString())
          assert.ok(true)
          return
        }
        log("should be", "rejected", "...so it failed")
        assert.fail("a", "b", "c")
      },
      succeed: async () => {
        try {
          await asyncAction()
          log("should be", "succeed", "seems not fired anything")
          assert.ok(true)
        } catch (e) {
          log("should be", "succeed", "catched", e.toString())
          assert.fail()
        }
      }
    }
  }
})