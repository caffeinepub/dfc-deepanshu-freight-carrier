import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

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

  public type OtpRecord = {
    phoneNumber : Text;
    otp : Text;
    expiration : Time.Time;
    verified : Bool;
  };

  let shipments = Map.empty<Text, Shipment>();
  let invoices = Map.empty<Nat, Invoice>();
  let clients = Map.empty<Principal, Client>();
  let payments = Map.empty<Nat, Payment>();
  let clientAccounts = Map.empty<Text, ClientAccount>();
  let clientSessions = Map.empty<Text, ClientSession>();
  let adminSessionTokens = Map.empty<Text, Time.Time>();
  let otpRecords = Map.empty<Text, OtpRecord>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let sessionTimeout : Int = 30 * 60 * 1_000_000_000;

  let loginAttempts = Map.empty<Text, (Nat, Time.Time)>();
  let maxLoginAttempts : Nat = 5;
  let loginAttemptWindow : Int = 15 * 60 * 1_000_000_000;

  let otpAttempts = Map.empty<Text, (Nat, Time.Time)>();
  let maxOtpAttempts : Nat = 3;
  let otpAttemptWindow : Int = 5 * 60 * 1_000_000_000;

  let clientSessionTimeout : Int = 60 * 60 * 1_000_000_000;
  let otpTimeout : Int = 5 * 60 * 1_000_000_000;

  let loginHistory = Map.empty<Nat, LoginHistoryEntry>();
  var nextLoginHistoryId : Nat = 0;

  let adminPassword = "Jatin2580";

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

  func isValidAdminSession(token : Text) : Bool {
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

  func isValidClientSession(sessionToken : Text) : ?Text {
    switch (clientSessions.get(sessionToken)) {
      case (null) { null };
      case (?session) {
        let currentTime = Time.now();
        if ((currentTime - session.expiration) > 0) {
          clientSessions.remove(sessionToken);
          null;
        } else {
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

  func generateOtp() : Text {
    ((Int.abs(Time.now()) % 900000) + 100000).toText();
  };

  func generateSessionToken(identifier : Text) : Text {
    identifier # "-session-" # Time.now().toText();
  };

  func createClientRecord(clientAccount : ClientAccount, principal : Principal) {
    let client : Client = {
      id = principal;
      companyName = clientAccount.profile.companyName;
      gstNumber = clientAccount.profile.gstNumber;
      address = clientAccount.profile.address;
      mobile = clientAccount.profile.mobile;
    };
    clients.add(principal, client);
  };

  func autoRepairClientAccount(account : ClientAccount, _identifier : Text) : ClientAccount {
    switch (account.linkedPrincipal) {
      case (null) { account };
      case (?_) { account };
    };
  };

  public shared ({ caller }) func clientSignup(
    email : ?Text,
    mobile : ?Text,
    password : Text,
    companyName : Text,
    gstNumber : Text,
    address : Text,
  ) : async {
    #success : Text;
    #emailExists;
    #mobileExists;
    #invalidInput : Text;
  } {
    let identifier = switch (email, mobile) {
      case (?e, _) { normalizeIdentifier(e) };
      case (null, ?m) { normalizeIdentifier(m) };
      case (null, null) { return #invalidInput("Email or mobile required") };
    };

    if (identifier == "") {
      return #invalidInput("Invalid identifier");
    };

    switch (email) {
      case (?e) {
        if (emailExists(e)) {
          return #emailExists;
        };
      };
      case (null) {};
    };

    switch (mobile) {
      case (?m) {
        if (mobileExists(m)) {
          return #mobileExists;
        };
      };
      case (null) {};
    };

    let mobileValue = switch (mobile) { case (?m) { m }; case (null) { "" } };
    let profile : UserProfile = { companyName; gstNumber; address; mobile = mobileValue };

    let newAccount : ClientAccount = {
      identifier;
      email;
      mobile;
      password;
      profile;
      isFirstLogin = true;
      activeSessionToken = null;
      role = #client;
      createdAt = Time.now();
      linkedPrincipal = null;
    };

    clientAccounts.add(identifier, newAccount);

    #success(identifier);
  };

  public shared ({ caller }) func clientPasswordLogin(
    identifier : Text,
    password : Text,
  ) : async {
    #success : { sessionToken : Text; clientId : Text };
    #invalidCredentials;
    #rateLimited;
  } {
    let normalizedId = normalizeIdentifier(identifier);

    if (not checkRateLimit(normalizedId)) {
      return #rateLimited;
    };

    switch (clientAccounts.get(normalizedId)) {
      case (null) { #invalidCredentials };
      case (?account) {
        if (account.password != password) {
          return #invalidCredentials;
        };

        let repairedAccount = autoRepairClientAccount(account, normalizedId);

        let sessionToken = generateSessionToken(normalizedId);
        let newSession : ClientSession = {
          clientId = normalizedId;
          sessionToken;
          expiration = Time.now() + clientSessionTimeout;
        };

        clientSessions.add(sessionToken, newSession);

        let updatedAccount = { repairedAccount with activeSessionToken = ?sessionToken; isFirstLogin = false };
        clientAccounts.add(normalizedId, updatedAccount);

        let historyEntry : LoginHistoryEntry = {
          identifier = normalizedId;
          clientId = normalizedId;
          loginTime = Time.now();
          ipAddress = null;
        };
        loginHistory.add(nextLoginHistoryId, historyEntry);
        nextLoginHistoryId += 1;

        #success({ sessionToken; clientId = normalizedId });
      };
    };
  };

  public shared ({ caller }) func sendOtp(
    phoneNumber : Text,
  ) : async {
    #success;
    #rateLimited;
    #invalidPhone;
  } {
    let normalizedPhone = normalizeIdentifier(phoneNumber);

    if (normalizedPhone == "") {
      return #invalidPhone;
    };

    if (not checkOtpRateLimit(normalizedPhone)) {
      return #rateLimited;
    };

    let otp = generateOtp();
    let otpRecord : OtpRecord = {
      phoneNumber = normalizedPhone;
      otp;
      expiration = Time.now() + otpTimeout;
      verified = false;
    };

    otpRecords.add(normalizedPhone, otpRecord);

    #success;
  };

  public shared ({ caller }) func verifyOtp(
    phoneNumber : Text,
    otp : Text,
  ) : async {
    #success : { sessionToken : Text; clientId : Text };
    #invalidOtp;
    #expired;
    #notFound;
  } {
    let normalizedPhone = normalizeIdentifier(phoneNumber);

    switch (otpRecords.get(normalizedPhone)) {
      case (null) { #notFound };
      case (?record) {
        let currentTime = Time.now();
        if (currentTime > record.expiration) {
          otpRecords.remove(normalizedPhone);
          return #expired;
        };

        if (record.otp != otp) {
          return #invalidOtp;
        };

        otpRecords.remove(normalizedPhone);

        switch (clientAccounts.get(normalizedPhone)) {
          case (null) { #notFound };
          case (?account) {
            let repairedAccount = autoRepairClientAccount(account, normalizedPhone);

            let sessionToken = generateSessionToken(normalizedPhone);
            let newSession : ClientSession = {
              clientId = normalizedPhone;
              sessionToken;
              expiration = currentTime + clientSessionTimeout;
            };

            clientSessions.add(sessionToken, newSession);
            let updatedAccount = { repairedAccount with activeSessionToken = ?sessionToken; isFirstLogin = false };
            clientAccounts.add(normalizedPhone, updatedAccount);

            #success({ sessionToken; clientId = normalizedPhone });
          };
        };
      };
    };
  };

  public shared ({ caller }) func getClientAccountStatus(
    sessionToken : Text,
  ) : async {
    #authenticated : {
      clientId : Text;
      profile : UserProfile;
      isFirstLogin : Bool;
    };
    #unauthenticated;
  } {
    switch (isValidClientSession(sessionToken)) {
      case (null) { #unauthenticated };
      case (?clientId) {
        switch (clientAccounts.get(clientId)) {
          case (null) { #unauthenticated };
          case (?account) {
            #authenticated({
              clientId;
              profile = account.profile;
              isFirstLogin = account.isFirstLogin;
            });
          };
        };
      };
    };
  };

  public shared ({ caller }) func getClientShipmentsBySessionToken(
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
          case (?_account) {
            let clientShipments = shipments.values().toArray();
            return #success(clientShipments);
          };
        };
      };
    };
  };

  public shared ({ caller }) func getClientInvoicesBySessionToken(
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
          case (?_account) {
            let clientInvoices = invoices.values().toArray();
            return #success(clientInvoices);
          };
        };
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

  public shared ({ caller }) func adminLogin(password : Text) : async {
    #success : Text;
    #invalidPassword;
    #serverError;
  } {
    let cleanPassword = password.trim(#predicate(func(c) { c == ' ' }));

    if (cleanPassword != adminPassword) {
      return #invalidPassword;
    };

    let token = "admin-session-" # Time.now().toText();
    adminSessionTokens.add(token, Time.now());
    #success(token);
  };

  public shared func validateAdminSession(
    sessionToken : Text,
  ) : async Bool {
    isValidAdminSession(sessionToken);
  };

  public shared ({ caller }) func adminLogout(token : Text) : async () {
    adminSessionTokens.remove(token);
  };

  public type AllClientsResponse = {
    state : Text;
    clientAccounts : [ClientAccount];
    shipments : [Shipment];
    invoices : [Invoice];
  };

  public shared ({ caller }) func getAllClients(sessionToken : Text) : async ?AllClientsResponse {
    if (not isValidAdminSession(sessionToken)) {
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

  public shared ({ caller }) func createClientAccount(
    sessionToken : Text,
    identifier : Text,
    password : Text,
    email : ?Text,
    mobile : ?Text,
    companyName : Text,
    gstNumber : Text,
    address : Text,
  ) : async ?Text {
    if (not isValidAdminSession(sessionToken)) {
      return null;
    };

    let profile : UserProfile = { companyName; gstNumber; address; mobile = switch (mobile) { case (?m) { m }; case (null) { "" } } };

    let newAccount : ClientAccount = {
      identifier;
      email;
      password;
      profile;
      isFirstLogin = true;
      activeSessionToken = null;
      role = #client;
      createdAt = Time.now();
      linkedPrincipal = null;
      mobile;
    };
    clientAccounts.add(identifier, newAccount);
    ?identifier;
  };

  public shared ({ caller }) func provisionClientAccount(
    sessionToken : Text,
    identifier : Text,
    password : Text,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    switch (clientAccounts.get(identifier)) {
      case (null) {
        Runtime.trap("Client account not found");
      };
      case (?account) {
        let updatedAccount : ClientAccount = {
          identifier = account.identifier;
          password = password;
          email = account.email;
          mobile = account.mobile;
          profile = account.profile;
          isFirstLogin = account.isFirstLogin;
          activeSessionToken = account.activeSessionToken;
          role = account.role;
          createdAt = account.createdAt;
          linkedPrincipal = null;
        };
        clientAccounts.add(identifier, updatedAccount);
      };
    };
  };

  public shared ({ caller }) func repairMissingLinkedPrincipals(sessionToken : Text) : async Nat {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    var count : Nat = 0;
    for ((id, account) in clientAccounts.entries()) {
      switch (account.linkedPrincipal) {
        case (null) {
          count += 1;
        };
        case (?_) {};
      };
    };
    count;
  };

  public shared ({ caller }) func createShipment(
    sessionToken : Text,
    trackingID : Text,
    status : Text,
    location : Text,
    client : Principal,
    coordinates : ?Coordinates,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    let shipment : Shipment = {
      trackingID;
      status;
      location;
      client;
      coordinates;
    };
    shipments.add(trackingID, shipment);
  };

  public shared ({ caller }) func updateShipment(
    sessionToken : Text,
    trackingID : Text,
    status : Text,
    location : Text,
    coordinates : ?Coordinates,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    switch (shipments.get(trackingID)) {
      case (null) {
        Runtime.trap("Shipment not found");
      };
      case (?existingShipment) {
        let updatedShipment : Shipment = {
          trackingID;
          status;
          location;
          client = existingShipment.client;
          coordinates;
        };
        shipments.add(trackingID, updatedShipment);
      };
    };
  };

  public shared ({ caller }) func deleteShipment(
    sessionToken : Text,
    trackingID : Text,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    shipments.remove(trackingID);
  };

  public shared ({ caller }) func createInvoice(
    sessionToken : Text,
    invoiceNo : Nat,
    amount : Nat,
    status : Text,
    dueDate : Time.Time,
    client : Principal,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    let invoiceStatus : InvoiceStatus = switch (status) {
      case ("paid") { #paid };
      case ("pending") { #pending };
      case ("overdue") { #overdue };
      case (_) { #pending };
    };

    let invoice : Invoice = {
      invoiceNo;
      amount;
      status = invoiceStatus;
      dueDate;
      client;
    };
    invoices.add(invoiceNo, invoice);
  };

  public shared ({ caller }) func updateInvoice(
    sessionToken : Text,
    invoiceNo : Nat,
    amount : Nat,
    status : Text,
    dueDate : Time.Time,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    switch (invoices.get(invoiceNo)) {
      case (null) {
        Runtime.trap("Invoice not found");
      };
      case (?existingInvoice) {
        let invoiceStatus : InvoiceStatus = switch (status) {
          case ("paid") { #paid };
          case ("pending") { #pending };
          case ("overdue") { #overdue };
          case (_) { #pending };
        };

        let updatedInvoice : Invoice = {
          invoiceNo;
          amount;
          status = invoiceStatus;
          dueDate;
          client = existingInvoice.client;
        };
        invoices.add(invoiceNo, updatedInvoice);
      };
    };
  };

  public shared ({ caller }) func deleteInvoice(
    sessionToken : Text,
    invoiceNo : Nat,
  ) : async () {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    invoices.remove(invoiceNo);
  };

  public shared ({ caller }) func getLoginHistory(sessionToken : Text) : async [LoginHistoryEntry] {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    loginHistory.values().toArray();
  };

  public shared ({ caller }) func getRevenueData(sessionToken : Text) : async [{ date : Text; amount : Nat }] {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    [];
  };

  public shared ({ caller }) func getAllShipmentsForMap(sessionToken : Text) : async [Shipment] {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    shipments.values().toArray();
  };

  public shared ({ caller }) func getShipmentsByClient(sessionToken : Text) : async [Shipment] {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    shipments.values().toArray();
  };

  public shared ({ caller }) func getInvoicesByClient(sessionToken : Text) : async [Invoice] {
    if (not isValidAdminSession(sessionToken)) {
      Runtime.trap("Invalid admin session");
    };

    invoices.values().toArray();
  };
};
