import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";

actor {
  public type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  public type Shipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
    coordinates : ?Coordinates;
  };

  public type Invoice = {
    invoiceNo : Nat;
    amount : Nat;
    status : InvoiceStatus;
    dueDate : Time.Time;
    client : Principal;
  };

  public type Client = {
    id : Principal;
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  public type Payment = {
    id : Nat;
    invoiceNo : Nat;
    amount : Nat;
    status : ?PaymentStatus;
    paymentIntent : ?StripePaymentIntent;
    receipts : [Text];
  };

  public type PaymentStatus = {
    #pending;
    #complete;
    #failed : Text;
  };

  public type StripePaymentIntent = {
    intentId : Text;
    clientSecret : Text;
    amount : Nat;
    currency : Text;
    status : Text;
  };

  public type InvoiceStatus = {
    #paid;
    #pending;
    #overdue;
  };

  public type UserProfile = {
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  public type ClientRole = {
    #client;
    #admin;
  };

  public type ClientAccount = {
    identifier : Text;
    email : ?Text;
    mobile : ?Text;
    password : Text;
    profile : UserProfile;
    isFirstLogin : Bool;
    activeSessionToken : ?Text;
    role : ClientRole;
    createdAt : Time.Time;
    linkedPrincipal : ?Principal;
  };

  public type ClientSession = {
    clientId : Text;
    sessionToken : Text;
    expiration : Time.Time;
  };

  public type LoginHistoryEntry = {
    identifier : Text;
    clientId : Text;
    loginTime : Time.Time;
    ipAddress : ?Text;
  };

  let shipments = Map.empty<Text, Shipment>();
  let invoices = Map.empty<Nat, Invoice>();
  let clients = Map.empty<Principal, Client>();
  let payments = Map.empty<Nat, Payment>();
  let clientAccounts = Map.empty<Text, ClientAccount>();
  let clientSessions = Map.empty<Text, ClientSession>();
  let adminSessionTokens = Map.empty<Text, Time.Time>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var msg91ApiKey : ?Text = null;
  var googleApiKey : ?Text = null;
  var adminPassword = "JATINSHARMA2356";
  let sessionTimeout : Int = 30 * 60 * 1_000_000_000; // 30 minutes

  let loginAttempts = Map.empty<Text, (Nat, Time.Time)>();
  let maxLoginAttempts : Nat = 5;
  let loginAttemptWindow : Int = 15 * 60 * 1_000_000_000; // 15 minutes

  let otpAttempts = Map.empty<Text, (Nat, Time.Time)>();
  let maxOtpAttempts : Nat = 3;
  let otpAttemptWindow : Int = 5 * 60 * 1_000_000_000; // 5 minutes

  let clientSessionTimeout : Int = 60 * 60 * 1_000_000_000; // 1 hour

  let loginHistory = Map.empty<Nat, LoginHistoryEntry>();
  var nextLoginHistoryId = 0;

  func checkRateLimit(identifier : Text) : Bool {
    let now = Time.now();
    switch (loginAttempts.get(identifier)) {
      case (null) {
        loginAttempts.add(identifier, (1, now));
        true;
      };
      case (?(attempts, lastAttempt)) {
        if ((now - lastAttempt) > loginAttemptWindow) {
          loginAttempts.add(identifier, (1, now));
          true;
        } else if (attempts >= maxLoginAttempts) {
          false;
        } else {
          loginAttempts.add(identifier, (attempts + 1, now));
          true;
        };
      };
    };
  };

  func checkOtpRateLimit(phoneNumber : Text) : Bool {
    let now = Time.now();
    switch (otpAttempts.get(phoneNumber)) {
      case (null) {
        otpAttempts.add(phoneNumber, (1, now));
        true;
      };
      case (?(attempts, lastAttempt)) {
        if ((now - lastAttempt) > otpAttemptWindow) {
          otpAttempts.add(phoneNumber, (1, now));
          true;
        } else if (attempts >= maxOtpAttempts) {
          false;
        } else {
          otpAttempts.add(phoneNumber, (attempts + 1, now));
          true;
        };
      };
    };
  };

  func isValidSession(token : Text) : Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?timestamp) {
        let currentTime = Time.now();
        if ((currentTime - timestamp) > sessionTimeout) {
          adminSessionTokens.remove(token);
          false;
        } else {
          adminSessionTokens.add(token, currentTime); // Refresh session activity
          true;
        };
      };
    };
  };

  func isValidClientSession(sessionToken : Text) : ?Text {
    switch (clientSessions.get(sessionToken)) {
      case (null) { null };
      case (?session) {
        let currentTime = Time.now();
        if ((currentTime - session.expiration) > 0) {
          clientSessions.remove(sessionToken);
          null;
        } else {
          // Refresh session expiration
          let refreshedSession = {
            session with
            expiration = currentTime + clientSessionTimeout;
          };
          clientSessions.add(sessionToken, refreshedSession);
          ?session.clientId;
        };
      };
    };
  };

  func getClientIdFromSession(sessionToken : Text) : Text {
    switch (isValidClientSession(sessionToken)) {
      case (null) {
        Runtime.trap("Invalid or expired client session token");
      };
      case (?clientId) { clientId };
    };
  };

  func getPrincipalFromSession(sessionToken : Text) : Principal {
    let clientId = getClientIdFromSession(sessionToken);
    switch (clientAccounts.get(clientId)) {
      case (null) {
        Runtime.trap("Client account not found");
      };
      case (?account) {
        switch (account.linkedPrincipal) {
          case (null) {
            Runtime.trap("Client account has no linked principal");
          };
          case (?principal) { principal };
        };
      };
    };
  };

  func getClientPrincipalSafe(sessionToken : Text) : ?Principal {
    switch (isValidClientSession(sessionToken)) {
      case (null) { null };
      case (?clientId) {
        switch (clientAccounts.get(clientId)) {
          case (null) { null };
          case (?account) { account.linkedPrincipal };
        };
      };
    };
  };

  func normalizeIdentifier(text : Text) : Text {
    text.trim(#predicate(func(c) { c == ' ' }));
  };

  func emailExists(email : Text) : Bool {
    let normalizedEmail = normalizeIdentifier(email);
    for ((_, account) in clientAccounts.entries()) {
      switch (account.email) {
        case (?existingEmail) {
          if (Text.equal(normalizeIdentifier(existingEmail), normalizedEmail)) {
            return true;
          };
        };
        case (null) {};
      };
    };
    false;
  };

  func mobileExists(mobile : Text) : Bool {
    let normalizedMobile = normalizeIdentifier(mobile);
    for ((_, account) in clientAccounts.entries()) {
      switch (account.mobile) {
        case (?existingMobile) {
          if (Text.equal(normalizeIdentifier(existingMobile), normalizedMobile)) {
            return true;
          };
        };
        case (null) {};
      };
    };
    false;
  };

  public query ({ caller }) func getClientShipmentsBySessionToken(
    sessionToken : Text,
  ) : async {
    #success : [Shipment];
    #noSessionToken;
    #notLinked : Text;
  } {
    if (sessionToken == "") {
      return #noSessionToken;
    };

    switch (isValidClientSession(sessionToken)) {
      case (null) {
        return #noSessionToken;
      };
      case (?clientId) {
        switch (clientAccounts.get(clientId)) {
          case (null) {
            return #notLinked(clientId);
          };
          case (?account) {
            switch (account.linkedPrincipal) {
              case (null) {
                return #notLinked(clientId);
              };
              case (?principal) {
                let clientShipments = shipments.filter(func(_k, v) { v.client == principal }).values().toArray();
                return #success(clientShipments);
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getClientInvoicesBySessionToken(
    sessionToken : Text,
  ) : async {
    #success : [Invoice];
    #noSessionToken;
    #notLinked : Text;
  } {
    if (sessionToken == "") {
      return #noSessionToken;
    };

    switch (isValidClientSession(sessionToken)) {
      case (null) {
        return #noSessionToken;
      };
      case (?clientId) {
        switch (clientAccounts.get(clientId)) {
          case (null) {
            return #notLinked(clientId);
          };
          case (?account) {
            switch (account.linkedPrincipal) {
              case (null) {
                return #notLinked(clientId);
              };
              case (?principal) {
                let clientInvoices = invoices.filter(func(_k, v) { v.client == principal }).values().toArray();
                return #success(clientInvoices);
              };
            };
          };
        };
      };
    };
  };

  public shared ({ caller }) func createClientAccount(
    identifier : Text,
    password : Text,
    linkedPrincipal : Principal,
    email : ?Text,
    mobile : ?Text,
    companyName : Text,
    gstNumber : Text,
    address : Text,
  ) : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create client accounts");
    };

    let profile : UserProfile = { 
      companyName; 
      gstNumber; 
      address; 
      mobile = switch (mobile) { case (?m) { m }; case (null) { "" } } 
    };

    let newAccount : ClientAccount = {
      identifier;
      email;
      password;
      profile;
      isFirstLogin = true;
      activeSessionToken = null;
      linkedPrincipal = ?linkedPrincipal;
      role = #client;
      createdAt = Time.now();
      mobile;
    };
    clientAccounts.add(identifier, newAccount);
    ?identifier;
  };

  public shared ({ caller }) func provisionClientAccount(
    identifier : Text,
    password : Text,
    linkedPrincipal : Principal,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can provision client accounts");
    };
      
    let existingAccount = clientAccounts.get(identifier);
    switch (existingAccount) {
      case (null) {
        Runtime.trap("Client account not found");
      };
      case (?account) {
        let updatedAccount : ClientAccount = {
          identifier = account.identifier;
          password = password;
          linkedPrincipal = ?linkedPrincipal;
          email = account.email;
          mobile = account.mobile;
          profile = account.profile;
          isFirstLogin = account.isFirstLogin;
          activeSessionToken = account.activeSessionToken;
          role = account.role;
          createdAt = account.createdAt;
        };
        clientAccounts.add(identifier, updatedAccount);
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    switch (clients.get(caller)) {
      case (null) { null };
      case (?client) {
        ?{
          companyName = client.companyName;
          gstNumber = client.gstNumber;
          address = client.address;
          mobile = client.mobile;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (clients.get(user)) {
      case (null) { null };
      case (?client) {
        ?{
          companyName = client.companyName;
          gstNumber = client.gstNumber;
          address = client.address;
          mobile = client.mobile;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let client : Client = {
      id = caller;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      address = profile.address;
      mobile = profile.mobile;
    };
    clients.add(caller, client);
  };

  public type AdminSession = {
    token : Text;
    expiration : Time.Time;
  };

  public shared ({ caller }) func adminLogin(password : Text) : async ?Text {
    if (password != adminPassword) {
      Runtime.trap("Invalid admin password");
    };

    let token = "admin-session-" # Time.now().toText();
    let newSession : AdminSession = {
      token;
      expiration = Time.now() + sessionTimeout;
    };
    adminSessionTokens.add(token, Time.now());
    ?token;
  };

  public query ({ caller }) func validateAdminSession(
    sessionToken : Text,
  ) : async ?Text {
    if (isValidSession(sessionToken)) {
      ?sessionToken;
    } else {
      null;
    };
  };

  public type AllClientsResponse = {
    state : Text;
    clientAccounts : [ClientAccount];
    shipments : [Shipment];
    invoices : [Invoice];
  };

  public shared ({ caller }) func getAllClients(sessionToken : Text) : async ?AllClientsResponse {
    if (not isValidSession(sessionToken)) {
      return null;
    };

    let allClients = clientAccounts.values().toArray();
    let allShipments = shipments.values().toArray();
    let allInvoices = invoices.values().toArray();

    ?{
      state = "verified";
      clientAccounts = allClients;
      shipments = allShipments;
      invoices = allInvoices;
    };
  };
};
