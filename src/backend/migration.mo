import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
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
    role : {
      #client;
      #admin;
    };
    createdAt : Time.Time;
  };

  type OldActor = {
    clientAccounts : Map.Map<Text, OldClientAccount>;
    clientSessionTimeout : Int;
    googleApiKey : ?Text;
    maxOtpAttempts : Nat;
    msg91ApiKey : ?Text;
    otpAttemptWindow : Int;
    otpAttempts : Map.Map<Text, (Nat, Time.Time)>;
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
    role : {
      #client;
      #admin;
    };
    createdAt : Time.Time;
    failedAttempts : Nat;
    isLocked : Bool;
    clientCode : Text;
  };

  type NewActor = {
    clientAccounts : Map.Map<Text, NewClientAccount>;
  };

  public func run(old : OldActor) : NewActor {
    let newClientAccounts = old.clientAccounts.map<Text, OldClientAccount, NewClientAccount>(
      func(identifier, oldAccount) {
        {
          oldAccount with
          failedAttempts = 0;
          isLocked = false;
          clientCode = identifier;
        };
      }
    );
    { clientAccounts = newClientAccounts };
  };
};
