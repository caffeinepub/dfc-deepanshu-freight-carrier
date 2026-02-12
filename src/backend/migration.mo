module {
  type OldActor = { var adminPassword : Text };
  type NewActor = { var adminPassword : Text };

  public func run(old : OldActor) : NewActor {
    old;
  };
};
