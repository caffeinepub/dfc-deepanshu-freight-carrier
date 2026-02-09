import Map "mo:core/Map";
import Time "mo:core/Time";

module {
  type ClientRole = {
    #client;
    #admin;
  };

  type OldClientAccount = {
    identifier : Text;
    email : ?Text;
    mobile : ?Text;
    password : Text;
    profile : {
      companyName : Text;
      gstNumber : Text;
      address : Text;
      mobile : Text;
    };
    isFirstLogin : Bool;
    activeSessionToken : ?Text;
  };

  type NewClientAccount = {
    identifier : Text;
    email : ?Text;
    mobile : ?Text;
    password : Text;
    profile : {
      companyName : Text;
      gstNumber : Text;
      address : Text;
      mobile : Text;
    };
    isFirstLogin : Bool;
    activeSessionToken : ?Text;
    role : ClientRole;
    createdAt : Time.Time;
  };

  type OldActor = {
    clientAccounts : Map.Map<Text, OldClientAccount>;
  };

  type NewActor = {
    clientAccounts : Map.Map<Text, NewClientAccount>;
  };

  public func run(old : OldActor) : NewActor {
    let newClientAccounts = old.clientAccounts.map<Text, OldClientAccount, NewClientAccount>(
      func(_id, oldAccount) {
        {
          oldAccount with
          role = #client;
          createdAt = Time.now();
        };
      }
    );
    { clientAccounts = newClientAccounts };
  };
};
