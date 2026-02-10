import Map "mo:core/Map";

module {
  type OldActor = { /* Old actor state without loginHistory */ };

  type NewActor = {
    loginHistory : Map.Map<Nat, { identifier : Text; clientId : Text; loginTime : Int; ipAddress : ?Text }>;
  };

  public func run(old : OldActor) : NewActor {
    { old with loginHistory = Map.empty<Nat, { identifier : Text; clientId : Text; loginTime : Int; ipAddress : ?Text }>() };
  };
};
