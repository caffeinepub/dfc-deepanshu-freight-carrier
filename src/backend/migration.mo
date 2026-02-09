import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type OldShipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
  };

  type OldInvoice = {
    invoiceNo : Nat;
    amount : Nat;
    status : {
      #paid;
      #pending;
      #overdue;
    };
    dueDate : Time.Time;
    client : Principal;
  };

  type OldClient = {
    id : Principal;
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  type OldPayment = {
    id : Nat;
    invoiceNo : Nat;
    amount : Nat;
    status : ?{
      #pending;
      #complete;
      #failed : Text;
    };
    paymentIntent : ?{
      intentId : Text;
      clientSecret : Text;
      amount : Nat;
      currency : Text;
      status : Text;
    };
    receipts : [Text];
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

  type OldClientSession = {
    clientId : Text;
    sessionToken : Text;
    expiration : Time.Time;
  };

  type OldActor = {
    shipments : Map.Map<Text, OldShipment>;
    invoices : Map.Map<Nat, OldInvoice>;
    clients : Map.Map<Principal, OldClient>;
    payments : Map.Map<Nat, OldPayment>;
    clientAccounts : Map.Map<Text, OldClientAccount>;
    clientSessions : Map.Map<Text, OldClientSession>;
    msg91ApiKey : ?Text;
    adminPassword : Text;
    adminSessionTokens : Map.Map<Text, Time.Time>;
    loginAttempts : Map.Map<Text, (Nat, Time.Time)>;
    otpAttempts : Map.Map<Text, (Nat, Time.Time)>;
  };

  public func run(old : OldActor) : {
    shipments : Map.Map<Text, OldShipment>;
    invoices : Map.Map<Nat, OldInvoice>;
    clients : Map.Map<Principal, OldClient>;
    payments : Map.Map<Nat, OldPayment>;
    clientAccounts : Map.Map<Text, OldClientAccount>;
    clientSessions : Map.Map<Text, OldClientSession>;
    msg91ApiKey : ?Text;
    adminPassword : Text;
    adminSessionTokens : Map.Map<Text, Time.Time>;
    loginAttempts : Map.Map<Text, (Nat, Time.Time)>;
    otpAttempts : Map.Map<Text, (Nat, Time.Time)>;
  } {
    old;
  };
};
