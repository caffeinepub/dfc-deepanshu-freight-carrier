import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Data Models
  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type Shipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
    coordinates : ?Coordinates;
  };

  type Invoice = {
    invoiceNo : Nat;
    amount : Nat;
    status : InvoiceStatus;
    dueDate : Time.Time;
    client : Principal;
  };

  type Client = {
    id : Principal;
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  type Payment = {
    id : Nat;
    invoiceNo : Nat;
    amount : Nat;
    status : ?PaymentStatus;
    paymentIntent : ?StripePaymentIntent;
    receipts : [Text];
  };

  type PaymentStatus = {
    #pending;
    #complete;
    #failed : Text;
  };

  type StripePaymentIntent = {
    intentId : Text;
    clientSecret : Text;
    amount : Nat;
    currency : Text;
    status : Text;
  };

  type InvoiceStatus = {
    #paid;
    #pending;
    #overdue;
  };

  type ClientRole = {
    #client;
    #admin;
  };

  type ClientAccount = {
    identifier : Text;
    email : ?Text;
    mobile : ?Text;
    password : Text;
    profile : UserProfile;
    isFirstLogin : Bool;
    activeSessionToken : ?Text;
    role : ClientRole;
    createdAt : Time.Time;
    failedAttempts : Nat;
    isLocked : Bool;
    clientCode : Text;
  };

  type UserProfile = {
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  type ClientSession = {
    clientId : Text;
    sessionToken : Text;
    expiration : Time.Time;
  };

  type LoginHistoryEntry = {
    identifier : Text;
    clientId : Text;
    loginTime : Time.Time;
    ipAddress : ?Text;
  };

  // Persistent Storage
  let shipments = Map.empty<Text, Shipment>();
  let invoices = Map.empty<Nat, Invoice>();
  let clients = Map.empty<Principal, Client>();
  let payments = Map.empty<Nat, Payment>();
  let clientAccounts = Map.empty<Text, ClientAccount>();
  let clientSessions = Map.empty<Text, ClientSession>();
  let loginHistory = Map.empty<Nat, LoginHistoryEntry>();
  var nextLoginHistoryId = 0;

  // Authorization System State (component)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profiles for AccessControl integration
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Admin Authentication State
  var adminPassword = "JATINSHARMA2356";
  let adminSessionTokens = Map.empty<Text, Time.Time>();

  let sessionTimeout : Int = 30 * 60 * 1_000_000_000; // 30 minutes in nanoseconds

  // Rate Limiting for Login Attempts (both admin and client)
  let loginAttempts = Map.empty<Text, (Nat, Time.Time)>(); // identifier -> (attempts, lastAttempt)
  let maxLoginAttempts : Nat = 5;
  let loginAttemptWindow : Int = 15 * 60 * 1_000_000_000; // 15 minutes

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

  func isValidSession(token : Text) : Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?timestamp) {
        let currentTime = Time.now();
        if ((currentTime - timestamp) > sessionTimeout) {
          adminSessionTokens.remove(token);
          false;
        } else {
          adminSessionTokens.add(token, currentTime);
          true;
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

  func recordLoginHistory(identifier : Text, clientId : Text, ipAddress : ?Text) {
    let entry : LoginHistoryEntry = {
      identifier = identifier;
      clientId = clientId;
      loginTime = Time.now();
      ipAddress = ipAddress;
    };
    loginHistory.add(nextLoginHistoryId, entry);
    nextLoginHistoryId += 1;
  };
  func generateClientCode() : Text {
    let randomNumber = Time.now().toNat() % 100_000;
    let paddedNumber = randomNumber.toText();
    let padded = if (paddedNumber.size() < 5) {
      let zerosNeeded = 5 - paddedNumber.size();
      var zeros = "";
      var i = 0;
      while (i < zerosNeeded) {
        zeros := zeros # "0";
        i += 1;
      };
      zeros # paddedNumber;
    } else {
      paddedNumber;
    };
    "DFC" # padded;
  };

  // User Profile Functions (Required by instructions)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Public query functions (no authorization needed)
  public query ({ caller }) func isMsg91ApiKeyStored() : async Bool {
    true;
  };

  public query ({ caller }) func transform(input : {}) : async {} {
    {};
  };

  public query ({ caller }) func healthCheck() : async Text {
    "System is healthy and ready for persistent operations. Canister version: 1.1.1-persistent";
  };

  // Admin Authentication (custom token-based, not using AccessControl for backward compatibility)
  public shared ({ caller }) func adminLogin(password : Text, token : Text) : async Text {
    let callerText = caller.toText();

    if (not checkRateLimit(callerText)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    if (password != adminPassword) {
      Runtime.trap("Invalid password");
    };

    loginAttempts.remove(callerText);
    adminSessionTokens.add(token, Time.now());
    token;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?_) {
        adminSessionTokens.remove(token);
        true;
      };
    };
  };

  public shared ({ caller }) func changeAdminPassword(token : Text, oldPassword : Text, newPassword : Text) : async () {
    if (not isValidSession(token)) {
      Runtime.trap("Unauthorized: Invalid session token");
    };

    if (oldPassword != adminPassword) {
      Runtime.trap("Invalid current password");
    };

    if (newPassword.size() < 8) {
      Runtime.trap("New password must be at least 8 characters long");
    };

    adminPassword := newPassword;

    for ((sessionToken, _) in adminSessionTokens.entries()) {
      adminSessionTokens.remove(sessionToken);
    };
  };

  // Client Signup (No authorization - public registration)
  public shared ({ caller }) func clientSignup(
    email : Text,
    password : Text,
    profile : UserProfile,
  ) : async Text {
    if (password.size() < 8) {
      Runtime.trap("Password must be at least 8 characters long");
    };

    let normalizedEmail = normalizeIdentifier(email);

    if (emailExists(normalizedEmail)) {
      Runtime.trap("An account with this email already exists");
    };

    let generatedClientCode = generateClientCode();

    let newAccount : ClientAccount = {
      identifier = normalizedEmail;
      email = ?normalizedEmail;
      mobile = ?profile.mobile;
      password = password;
      profile = profile;
      isFirstLogin = false;
      activeSessionToken = null;
      role = #client;
      createdAt = Time.now();
      clientCode = generatedClientCode;
      failedAttempts = 0;
      isLocked = false;
    };

    clientAccounts.add(normalizedEmail, newAccount);
    generatedClientCode;
  };

  // Client Authentication (No authorization - public login)
  public shared ({ caller }) func authenticateClient(emailOrMobile : Text, password : Text, ipAddress : ?Text) : async ?Text {
    let normalizedInput = normalizeIdentifier(emailOrMobile);

    if (not checkRateLimit(normalizedInput)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    var matchedAccountKey : ?Text = null;
    var matchedAccount : ?ClientAccount = null;

    for ((accountKey, account) in clientAccounts.entries()) {
      if (Text.equal(normalizeIdentifier(account.identifier), normalizedInput)) {
        matchedAccountKey := ?accountKey;
        matchedAccount := ?account;
      } else {
        switch (account.email) {
          case (?email) {
            if (Text.equal(normalizeIdentifier(email), normalizedInput)) {
              matchedAccountKey := ?accountKey;
              matchedAccount := ?account;
            };
          };
          case (null) {};
        };
        switch (account.mobile) {
          case (?mobile) {
            if (Text.equal(normalizeIdentifier(mobile), normalizedInput)) {
              matchedAccountKey := ?accountKey;
              matchedAccount := ?account;
            };
          };
          case (null) {};
        };
      };
    };

    switch (matchedAccountKey, matchedAccount) {
      case (?accountKey, ?account) {
        if (account.isLocked) {
          Runtime.trap("Account is locked due to too many failed login attempts. Please contact support.");
        };

        if (not Text.equal(account.password, password)) {
          let updatedAccount = {
            account with
            failedAttempts = account.failedAttempts + 1;
            isLocked = account.failedAttempts + 1 >= 5;
          };
          clientAccounts.add(accountKey, updatedAccount);
          Runtime.trap("Invalid email/mobile or password");
        };

        let resetAccount = {
          account with
          failedAttempts = 0;
        };
        clientAccounts.add(accountKey, resetAccount);

        // Record login history on successful authentication
        recordLoginHistory(normalizedInput, account.clientCode, ipAddress);

        loginAttempts.remove(normalizedInput);

        ?account.clientCode;
      };
      case (_, _) {
        Runtime.trap("Invalid email/mobile or password");
      };
    };
  };

  // Admin-only: List all client accounts
  public query ({ caller }) func getAllClientAccounts(adminToken : Text) : async [ClientAccount] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    clientAccounts.values().toArray();
  };

  // Admin-only: Get client account by code
  public query ({ caller }) func getClientAccountByCode(clientCode : Text, adminToken : Text) : async ?ClientAccount {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    for ((_, account) in clientAccounts.entries()) {
      if (account.clientCode == clientCode) {
        return ?account;
      };
    };
    null;
  };

  // Admin-only: Delete client account by client code
  public shared ({ caller }) func deleteClientAccount(clientCode : Text, adminToken : Text) : async Bool {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    var foundKey : ?Text = null;
    for ((key, account) in clientAccounts.entries()) {
      if (account.clientCode == clientCode) {
        foundKey := ?key;
      };
    };

    switch (foundKey) {
      case (?key) {
        clientAccounts.remove(key);
        true;
      };
      case (null) {
        false;
      };
    };
  };

  // Admin-only: Get login history
  public query ({ caller }) func getLoginHistory(adminToken : Text) : async [LoginHistoryEntry] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    loginHistory.values().toArray();
  };
};
