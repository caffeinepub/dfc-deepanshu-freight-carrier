module {
  type Actor = {
    adminPassword : Text;
  };

  public func run(old : Actor) : Actor {
    { old with adminPassword = "jatinkrs01" };
  };
};
