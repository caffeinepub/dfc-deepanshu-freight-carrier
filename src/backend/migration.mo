module {
  type OldActor = { adminPassword : Text };
  type NewActor = {};

  public func run(old : OldActor) : NewActor {
    {}; // Remove obsolete admin password state
  };
};
