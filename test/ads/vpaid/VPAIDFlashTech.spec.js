describe("VPAIDFlashTech", function () {
  it("must be a function", function () {
    assert.isFunction(VPAIDFlashTech);
  });

  it("must return an instance of itself", function () {
    assert.instanceOf(VPAIDFlashTech({src:'fakeSource'}), VPAIDFlashTech);
  });

  describe("supports", function () {
    it("must be a function", function () {
      assert.isFunction(VPAIDFlashTech.supports);
    });

    it("must return true when you pass 'application/x-shockwave-flash' as type and false otherwise", function () {
      assert.isTrue(VPAIDFlashTech.supports('application/x-shockwave-flash'));
      assert.isFalse(VPAIDFlashTech.supports('application/javascript'));
      assert.isFalse(VPAIDFlashTech.supports(undefined));
      assert.isFalse(VPAIDFlashTech.supports(null));
      assert.isFalse(VPAIDFlashTech.supports(123));
    });
  });

  it("must complain if you don't pass a valid media file", function(){
    [undefined, null, {}, []].forEach(function (invalidMediaFile) {
      assert.throws(function() {
        new VPAIDFlashTech(invalidMediaFile);
      }, VASTError, 'VAST Error: on VPAIDFlashTech, invalid MediaFile')
    });
  });

  describe("instance", function () {
    var vpaidFlashTech, testDiv;

    beforeEach(function () {
      vpaidFlashTech = new VPAIDFlashTech({src:'http://fake.mediaFile.url'});
      testDiv = document.createElement("div");
      document.body.appendChild(testDiv);
    });

    afterEach(function () {
      dom.remove(testDiv);
    });

    describe("loadAdUnit", function () {
      it("must throw a VASTError if you don't pass a valid dom Element to contain the ad", function(){
        [undefined, null, {}, 123].forEach(function (invalidDomElement) {
          assert.throws(function () {
            vpaidFlashTech.loadAdUnit(invalidDomElement);
          }, VASTError, 'on VPAIDFlashTech.loadAdUnit, invalid dom container element');
        });
      });

      it("must throw a VASTError if you don't pass a callback to call once the ad have been loaded", function(){
        [undefined, null, {}, 123].forEach(function (invalidCallback) {
          assert.throws(function () {
            vpaidFlashTech.loadAdUnit(testDiv, invalidCallback);
          }, VASTError, 'on VPAIDFlashTech.loadAdUnit, missing valid callback');
        });
      });

      it("must not throw an error if pass valid arguments", function(){
        assert.doesNotThrow(function () {
          vpaidFlashTech.loadAdUnit(testDiv, noop);
        });
      });

      it("must publish the containerEl and the vpaidFlashToJs into the instance", function(){
        assert.isNull(vpaidFlashTech.containerEl);
        assert.isNull(vpaidFlashTech.vpaidFlashClient);
        vpaidFlashTech.loadAdUnit(testDiv, noop);
        assert.equal(vpaidFlashTech.containerEl, testDiv);
        assert.instanceOf(vpaidFlashTech.vpaidFlashClient, VPAIDFLASHClient);
      });
    });

    describe("unloadUnit", function(){
      it("must do nothing if the there is no loaded adUnit", function(){
        assert.doesNotThrow(function() {
          vpaidFlashTech.unloadAdUnit();
        });
      });

      it("must unload the adUnit", function(){
        vpaidFlashTech.loadAdUnit(testDiv, noop);
        var vpaidFlashClient = vpaidFlashTech.vpaidFlashClient;
        vpaidFlashClient.destroy = sinon.spy();

        vpaidFlashTech.unloadAdUnit();

        sinon.assert.calledOnce(vpaidFlashClient.destroy);
      });

      it("must remove the containerEl", function(){
        sinon.stub(dom, 'remove');
        vpaidFlashTech.loadAdUnit(testDiv, noop);
        //We mock destroy to prevent exception
        vpaidFlashTech.vpaidFlashClient.destroy = noop;
        vpaidFlashTech.unloadAdUnit();


        sinon.assert.calledWithExactly(dom.remove, testDiv);
        dom.remove.restore();
      });

      it("must set instance properties: containerEl and vpaidFlashClient to null", function(){
        vpaidFlashTech.loadAdUnit(testDiv, noop);
        //We mock destroy to prevent exception
        vpaidFlashTech.vpaidFlashClient.destroy = noop;

        vpaidFlashTech.unloadAdUnit();

        assert.isNull(vpaidFlashTech.vpaidFlashClient);
        assert.isNull(vpaidFlashTech.containerEl);
      });
    });
  });
});