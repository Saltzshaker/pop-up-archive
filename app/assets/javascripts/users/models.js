angular.module('Directory.users.models', ['RailsModel'])
.factory('CreditCard', ['Model', function (Model) {
  var CreditCard = Model({url:'/api/me/credit_card', name: 'credit_card'});
  return CreditCard;
}])
.factory('Subscription', ['Model', function (Model) {
  var Subscription = Model({url:'/api/me/subscription', name: 'subscription'});
  return Subscription;
}])
.factory('User', ['Model', 'CreditCard', 'Subscription', function (Model, CreditCard, Subscription) {
  var User = Model({url:'/api/users', name: 'user'});

  User.prototype.authenticated = function (callback, errback) {
    var self = this;
    if (self.id) {
      if (callback) {
        callback(self);
      }

      return true;
    }

    if (errback) {
      errback(self);
    }
    
    return false;
  };

  User.prototype.canEdit = function (obj) {
    if (this.authenticated() && obj && obj.collectionId) {
      return (this.collectionIds.indexOf(obj.collectionId) > -1);
    } else {
      return false;
    }
  };

  User.prototype.isAdmin = function () {
    if (this.authenticated()) {
      if (this.role == 'admin' || this.role == 'owner') {
        return true;
      }
      return false;
    } else {
      return false;
    }
  };

  User.prototype.updateCreditCard = function (stripeToken) {
    var cc = new CreditCard({token: stripeToken});
    return cc.update().then(function () {
      return User.get('me');
    });
  };

  User.prototype.hasCreditCard = function () {
    return !!this.creditCard;
  };

  User.prototype.isOrgMember = function() {
    return this.role == "member";
  };

  User.prototype.hasCommunityPlan = function () {
    return !!(!this.plan || !this.plan.id || this.plan.name.match(/Community/));
  };

  User.prototype.hasPremiumTranscripts = function() {
    return this.plan.isPremium;
  };

  User.prototype.defaultTranscriptType = function() {
    return this.hasPremiumTranscripts() ? "premium" : "basic";
  };

  User.prototype.subscribe = function (planId, offerCode) {
    var sub = new Subscription({planId: planId});
    var self = this;
    if (typeof offerCode !== 'undefined') {
      sub.offer = offerCode;
    }
    return sub.update().then(function (plan) {
      return User.get('me');
    });
  };

  return User;
}])
